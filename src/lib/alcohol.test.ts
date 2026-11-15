import { describe, expect, it } from 'vitest'
import { isAlcoholDraftComplete, standardDrinks } from './alcohol'

describe('standardDrinks', () => {
  it('rechnet Bier, Wein und Schnaps in Standardgetränke um', () => {
    expect(standardDrinks({ type: 'beer', serving: 'stange-300', count: 1 })).toBe(1.2)
    expect(standardDrinks({ type: 'wine', serving: 'glass-100', count: 1 })).toBe(1)
    expect(standardDrinks({ type: 'spirits', serving: 'shot-40', count: 2 })).toBe(2.5)
  })

  it('übernimmt bei «Anderes» die Anzahl direkt', () => {
    expect(standardDrinks({ type: 'other', count: 2 })).toBe(2)
  })

  it('liefert 0 ohne vollständige Auswahl', () => {
    expect(standardDrinks({ count: 1 })).toBe(0)
    expect(standardDrinks({ type: 'beer', count: 1 })).toBe(0)
    expect(isAlcoholDraftComplete({ type: 'beer', count: 1 })).toBe(false)
    expect(isAlcoholDraftComplete({ type: 'beer', serving: 'stange-300', count: 1 })).toBe(true)
  })
})
