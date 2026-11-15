import { addDays, diffDays, toDateStr } from './dates'
import type { Category, Entry, Goal } from './types'

export type GoalStatus = 'achieved' | 'progress' | 'failed'
export type GoalRowKind = 'perDay' | 'perPeriod' | 'freeDays' | 'spend'

export interface GoalRow {
  kind: GoalRowKind
  status: GoalStatus
  value: number
  target: number
  ratio: number
}

export interface GoalResult {
  goal: Goal
  ended: boolean
  rows: GoalRow[]
}

export const entryDay = (e: Entry) => toDateStr(new Date(e.at))

export function spendOf(e: Entry, cat: Category | undefined, unitRaw: string | undefined): number {
  if (!cat) return 0
  if (unitRaw === '@chf') return e.amount
  return e.spend ?? 0
}

export function evaluateGoal(
  goal: Goal,
  entries: Entry[],
  today: string,
  spendFn: (e: Entry) => number,
): GoalResult {
  const inRange = entries.filter((e) => {
    if (e.categoryId !== goal.categoryId) return false
    const d = entryDay(e)
    return d >= goal.start && d <= goal.end
  })
  const ended = today > goal.end
  const lastDay = today < goal.end ? today : goal.end
  const rows: GoalRow[] = []

  if (goal.maxPerDay != null) {
    const perDay = new Map<string, number>()
    for (const e of inRange) perDay.set(entryDay(e), (perDay.get(entryDay(e)) ?? 0) + e.amount)
    const worst = Math.max(0, ...perDay.values())
    const status: GoalStatus = worst > goal.maxPerDay ? 'failed' : ended ? 'achieved' : 'progress'
    rows.push({ kind: 'perDay', status, value: worst, target: goal.maxPerDay, ratio: clamp(worst / goal.maxPerDay) })
  }

  if (goal.maxPerPeriod != null) {
    const total = inRange.reduce((s, e) => s + e.amount, 0)
    const status: GoalStatus = total > goal.maxPerPeriod ? 'failed' : ended ? 'achieved' : 'progress'
    rows.push({ kind: 'perPeriod', status, value: total, target: goal.maxPerPeriod, ratio: clamp(total / goal.maxPerPeriod) })
  }

  if (goal.freeDays != null) {
    const used = new Set(inRange.map(entryDay))
    let free = 0
    if (lastDay >= goal.start) {
      for (let d = goal.start; d <= lastDay; d = addDays(d, 1)) if (!used.has(d)) free++
    }
    const daysAfterToday = ended ? 0 : Math.max(0, diffDays(today < goal.start ? goal.start : today, goal.end))
    let status: GoalStatus
    if (free >= goal.freeDays) status = 'achieved'
    else if (ended || free + daysAfterToday < goal.freeDays) status = 'failed'
    else status = 'progress'
    rows.push({ kind: 'freeDays', status, value: free, target: goal.freeDays, ratio: goal.freeDays ? clamp(free / goal.freeDays) : 1 })
  }

  if (goal.maxSpend != null) {
    const total = inRange.reduce((s, e) => s + spendFn(e), 0)
    const status: GoalStatus = total > goal.maxSpend ? 'failed' : ended ? 'achieved' : 'progress'
    rows.push({ kind: 'spend', status, value: total, target: goal.maxSpend, ratio: clamp(total / goal.maxSpend) })
  }

  return { goal, ended, rows }
}

const clamp = (n: number) => (Number.isFinite(n) ? Math.min(1, Math.max(0, n)) : 0)

/** Tagesziel, das gestern eingehalten wurde (für die Glückwunsch-Meldung). */
export function dailyGoalReachedYesterday(
  goals: Goal[],
  entries: Entry[],
  today: string,
): Goal | undefined {
  const y = addDays(today, -1)
  return goals.find((g) => {
    if (g.maxPerDay == null || y < g.start || y > g.end) return false
    const total = entries
      .filter((e) => e.categoryId === g.categoryId && entryDay(e) === y)
      .reduce((s, e) => s + e.amount, 0)
    return total <= g.maxPerDay
  })
}

/** Tagesziel, das heute bisher eingehalten wird (für den positiven Hinweis auf der Startseite). */
export function dailyGoalOnTrackToday(
  goals: Goal[],
  entries: Entry[],
  today: string,
): { goal: Goal; value: number } | undefined {
  for (const g of goals) {
    if (g.maxPerDay == null || today < g.start || today > g.end) continue
    const value = entries
      .filter((e) => e.categoryId === g.categoryId && entryDay(e) === today)
      .reduce((s, e) => s + e.amount, 0)
    if (value <= g.maxPerDay) return { goal: g, value }
  }
  return undefined
}
