import { describe, expect, it } from 'vitest'
import { dayPart, dayPartInFuture } from './dates'
import { dailyGoalOnTrackToday, evaluateGoal } from './goals'
import { legacyProducts, productSet, productTotal, setProductCount, sortProducts } from './catalog'

describe('Alkohol: Standardgetränke', () => {
  it('rechnet mehrere Sorten und Einheiten zusammen', () => {
    let d = setProductCount([], 'beer', 'large', 2)
    d = setProductCount(d, 'wine', 'dl1', 2)
    d = setProductCount(d, 'wine', 'dl2', 1)
    expect(productTotal(d)).toBe(7.4)
  })

  it('entfernt Einheiten mit Menge 0 und sortiert stabil', () => {
    let d = setProductCount([], 'wine', 'dl1', 1)
    d = setProductCount(d, 'beer', 'bottle33', 1)
    expect(sortProducts(d).map((x) => x.type)).toEqual(['beer', 'wine'])
    expect(setProductCount(d, 'wine', 'dl1', 0)).toHaveLength(1)
  })
})

describe('Nikotin: Produkte', () => {
  it('rechnet Zigaretten, Snus und Vape zu Konsumeinheiten zusammen', () => {
    let p = setProductCount([], 'cigarette', 'piece', 3)
    p = setProductCount(p, 'snus', 'pouch', 2)
    p = setProductCount(p, 'vape', 'puffs10', 1)
    expect(productTotal(p)).toBe(6)
    expect(sortProducts(p).map((x) => x.type)).toEqual(['cigarette', 'snus', 'vape'])
  })
  it('erkennt die Kategorien mit Produktwahl und führt ältere Einträge weiter', () => {
    expect(productSet({ id: 'a', key: 'nicotine', name: '', abbr: '', units: [] } as never)).toBe('nicotine')
    expect(legacyProducts('nicotine', 4)).toEqual([{ type: 'cigarette', unit: 'piece', count: 4 }])
  })
})

describe('Tageszeit', () => {
  it('ordnet Uhrzeiten den sechs Tageszeiten zu', () => {
    const at = (h: number) => dayPart(new Date(2026, 0, 1, h))
    expect([at(5), at(9), at(12), at(14), at(18), at(23), at(2)]).toEqual(['morning', 'forenoon', 'noon', 'afternoon', 'evening', 'night', 'night'])
  })

  it('erkennt Tageszeiten in der Zukunft', () => {
    const now = new Date(2026, 10, 15, 17, 22)
    expect(dayPartInFuture('2026-11-15', 'evening', now)).toBe(true)
    expect(dayPartInFuture('2026-11-15', 'afternoon', now)).toBe(false)
    expect(dayPartInFuture('2026-11-14', 'night', now)).toBe(false)
  })
})

describe('Startseite: Tagesziel heute', () => {
  const goal = { id: 'g', categoryId: 'c', period: 'week' as const, start: '2026-11-09', end: '2026-11-15', maxPerDay: 2 }
  const entry = (amount: number) => ({
    id: 'e' + amount,
    categoryId: 'c',
    at: new Date(2026, 10, 15, 12).toISOString(),
    amount,
    unitIdx: 0,
    context: '',
    craving: 0,
    tension: 0,
    mood: 0,
    pain: 0,
    notes: '',
  })

  it('meldet ein eingehaltenes Tagesziel, auch ohne Einträge', () => {
    expect(dailyGoalOnTrackToday([goal], [], '2026-11-15')?.value).toBe(0)
    expect(dailyGoalOnTrackToday([goal], [entry(2)], '2026-11-15')?.value).toBe(2)
  })

  it('meldet nichts, wenn das Tagesziel überschritten ist oder nicht gilt', () => {
    expect(dailyGoalOnTrackToday([goal], [entry(3)], '2026-11-15')).toBeUndefined()
    expect(dailyGoalOnTrackToday([goal], [], '2026-11-16')).toBeUndefined()
  })

  it('Höchstwert 0: ohne Eintrag im Rahmen, mit Eintrag überschritten', () => {
    const zero = { ...goal, maxPerDay: 0, maxPerPeriod: 0 }
    const none = evaluateGoal(zero, [], '2026-11-15', () => 0)
    expect(none.rows.map((r) => [r.status, r.ratio])).toEqual([
      ['progress', 0],
      ['progress', 0],
    ])
    const one = evaluateGoal(zero, [entry(1)], '2026-11-15', () => 0)
    expect(one.rows.map((r) => [r.status, r.ratio])).toEqual([
      ['failed', 1],
      ['failed', 1],
    ])
  })
})
