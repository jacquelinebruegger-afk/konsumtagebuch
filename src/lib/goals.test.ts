import { describe, expect, it } from 'vitest'
import { evaluateGoal } from './goals'
import type { Entry, Goal } from './types'

const entry = (day: string, amount: number, categoryId = 'a'): Entry => ({
  id: day + amount + Math.random(),
  categoryId,
  at: new Date(`${day}T12:00:00`).toISOString(),
  amount,
  unitIdx: 0,
  context: '',
  craving: 0,
  tension: 0,
  mood: 0,
  pain: 0,
  notes: '',
})

const goal: Goal = {
  id: 'g',
  categoryId: 'a',
  period: 'week',
  start: '2026-10-07',
  end: '2026-10-13',
  maxPerDay: 2,
  maxPerPeriod: 5,
  freeDays: 2,
}

describe('evaluateGoal', () => {
  it('markiert überschrittene Tagesgrenze als nicht erreicht', () => {
    const r = evaluateGoal(goal, [entry('2026-10-08', 3)], '2026-10-09', () => 0)
    expect(r.rows.find((x) => x.kind === 'perDay')?.status).toBe('failed')
  })

  it('zählt konsumfreie Tage und bleibt in Bearbeitung, solange es noch möglich ist', () => {
    const r = evaluateGoal(goal, [entry('2026-10-07', 1), entry('2026-10-08', 1)], '2026-10-08', () => 0)
    const free = r.rows.find((x) => x.kind === 'freeDays')!
    expect(free.value).toBe(0)
    expect(free.status).toBe('progress')
  })

  it('erkennt unmöglich gewordene konsumfreie Tage', () => {
    const entries = ['07', '08', '09', '10', '11', '12'].map((d) => entry(`2026-10-${d}`, 1))
    const r = evaluateGoal(goal, entries, '2026-10-12', () => 0)
    expect(r.rows.find((x) => x.kind === 'freeDays')?.status).toBe('failed')
  })

  it('schliesst eingehaltene Ziele nach Periodenende als erreicht ab', () => {
    const r = evaluateGoal(goal, [entry('2026-10-08', 1)], '2026-10-14', () => 0)
    expect(r.ended).toBe(true)
    expect(r.rows.every((x) => x.status === 'achieved')).toBe(true)
  })

  it('summiert Ausgaben', () => {
    const g: Goal = { id: 'g2', categoryId: 'a', period: 'week', start: '2026-10-07', end: '2026-10-13', maxSpend: 100 }
    const r = evaluateGoal(g, [entry('2026-10-08', 60), entry('2026-10-09', 50)], '2026-10-10', (e) => e.amount)
    expect(r.rows[0].status).toBe('failed')
    expect(r.rows[0].value).toBe(110)
  })
})
