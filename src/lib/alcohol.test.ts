import { describe, expect, it } from 'vitest'
import { dayPart, dayPartInFuture } from './dates'
import { setDrinkCount, sortDrinks, standardDrinks } from './catalog'

describe('Alkohol: Standardgetränke', () => {
  it('rechnet mehrere Sorten und Einheiten zusammen', () => {
    let d = setDrinkCount([], 'beer', 'large', 2)
    d = setDrinkCount(d, 'wine', 'dl1', 2)
    d = setDrinkCount(d, 'wine', 'dl2', 1)
    expect(standardDrinks(d)).toBe(7.4)
  })

  it('entfernt Einheiten mit Menge 0 und sortiert stabil', () => {
    let d = setDrinkCount([], 'wine', 'dl1', 1)
    d = setDrinkCount(d, 'beer', 'bottle33', 1)
    expect(sortDrinks(d).map((x) => x.type)).toEqual(['beer', 'wine'])
    expect(setDrinkCount(d, 'wine', 'dl1', 0)).toHaveLength(1)
  })
})

describe('Tageszeit', () => {
  it('ordnet Uhrzeiten den fünf Tageszeiten zu', () => {
    const at = (h: number) => dayPart(new Date(2026, 0, 1, h))
    expect([at(5), at(11), at(14), at(18), at(23), at(2)]).toEqual(['morning', 'noon', 'afternoon', 'evening', 'night', 'night'])
  })

  it('erkennt Tageszeiten in der Zukunft', () => {
    const now = new Date(2026, 10, 15, 17, 22)
    expect(dayPartInFuture('2026-11-15', 'evening', now)).toBe(true)
    expect(dayPartInFuture('2026-11-15', 'afternoon', now)).toBe(false)
    expect(dayPartInFuture('2026-11-14', 'night', now)).toBe(false)
  })
})
