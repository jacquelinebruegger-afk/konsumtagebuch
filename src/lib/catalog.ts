import type { Category, Drink } from './types'

export interface CatalogItem {
  key: string
  abbr: string
  units: string[]
  spend?: boolean
  /** Teil der Standard-Auswahl beim ersten Start */
  initial: boolean
}

export const CATALOG: CatalogItem[] = [
  { key: 'alcohol', abbr: 'AL', units: ['@standardDrink'], initial: true },
  { key: 'amphetamines', abbr: 'AM', units: ['@mg'], initial: true },
  { key: 'cannabis', abbr: 'CA', units: ['@joint', '@g'], initial: true },
  { key: 'gaming', abbr: 'GA', units: ['@min', '@h'], spend: true, initial: true },
  { key: 'gambling', abbr: 'GE', units: ['@min', '@h'], spend: true, initial: true },
  { key: 'ghb', abbr: 'GH', units: ['@ml'], initial: false },
  { key: 'heroin', abbr: 'HE', units: ['@mg'], initial: true },
  { key: 'shopping', abbr: 'KF', units: ['@chf'], initial: true },
  { key: 'ketamine', abbr: 'KT', units: ['@mg'], initial: true },
  { key: 'caffeine', abbr: 'KO', units: ['@mg', '@cup'], initial: false },
  { key: 'cocaine', abbr: 'KK', units: ['@mg'], initial: true },
  { key: 'mdma', abbr: 'MD', units: ['@mg'], initial: true },
  { key: 'medication', abbr: 'ME', units: ['@mg'], initial: true },
  { key: 'methamphetamine', abbr: 'MA', units: ['@mg'], initial: true },
  { key: 'nicotine', abbr: 'NI', units: ['@cigarette'], initial: true },
  { key: 'opiates', abbr: 'OP', units: ['@mg'], initial: true },
  { key: 'porn', abbr: 'PO', units: ['@min', '@h'], initial: true },
  { key: 'psychedelics', abbr: 'PS', units: ['@ug', '@mg', '@g'], initial: false },
  { key: 'social', abbr: 'SM', units: ['@min', '@h'], initial: true },
]

export const catalogItem = (key?: string) => CATALOG.find((c) => c.key === key)

/** Schrittweite des Zählers je nach Einheit. */
export function unitStep(unitRaw: string): number {
  switch (unitRaw) {
    case '@mg':
    case '@ug':
      return 10
    case '@min':
    case '@ml':
    case '@chf':
      return 5
    default:
      return 1
  }
}

export function categoryFromCatalog(item: CatalogItem, id: string): Category {
  return { id, key: item.key }
}

export function initialCategories(): Category[] {
  return CATALOG.filter((c) => c.initial).map((c) => categoryFromCatalog(c, `cat-${c.key}`))
}

export const hasSpend = (c: Category): boolean => c.spend ?? catalogItem(c.key)?.spend ?? false

/* ---------- Alkohol: Sorten, Einheiten, Standardgetränke ---------- */

export interface AlcoholUnit {
  key: string
  /** ungefähre Anzahl Standardgetränke (≈ 10–12 g reiner Alkohol) pro Einheit */
  sd: number
}

export interface AlcoholType {
  key: string
  units: AlcoholUnit[]
}

export const ALCOHOL_TYPES: AlcoholType[] = [
  {
    key: 'beer',
    units: [
      { key: 'stange', sd: 1 }, // Stange, 3 dl
      { key: 'large', sd: 1.7 }, // Grosses Bier, 5 dl
      { key: 'bottle33', sd: 1.1 }, // Flasche, 33 cl
      { key: 'bottle50', sd: 1.7 }, // Flasche, 5 dl
    ],
  },
  {
    key: 'wine',
    units: [
      { key: 'dl1', sd: 1 },
      { key: 'dl2', sd: 2 },
      { key: 'dl3', sd: 3 },
      { key: 'bottle', sd: 7.5 }, // Flasche, 7,5 dl
    ],
  },
  {
    key: 'sparkling',
    units: [
      { key: 'glass', sd: 1 }, // Glas, 1 dl
      { key: 'bottle', sd: 7.5 }, // Flasche, 7,5 dl
    ],
  },
  {
    key: 'spirits',
    units: [
      { key: 'cl2', sd: 0.7 },
      { key: 'cl4', sd: 1.3 },
    ],
  },
  { key: 'cocktail', units: [{ key: 'glass', sd: 1.5 }] },
  { key: 'other', units: [{ key: 'standard', sd: 1 }] },
]

export const isAlcohol = (c: Category | undefined): boolean => c?.key === 'alcohol'

export const alcoholType = (key: string) => ALCOHOL_TYPES.find((t) => t.key === key)

export const drinkCount = (drinks: Drink[], type: string, unit: string): number =>
  drinks.find((d) => d.type === type && d.unit === unit)?.count ?? 0

export function setDrinkCount(drinks: Drink[], type: string, unit: string, count: number): Drink[] {
  const rest = drinks.filter((d) => !(d.type === type && d.unit === unit))
  return sortDrinks(count > 0 ? [...rest, { type, unit, count }] : rest)
}

/** Stabile Reihenfolge wie in der Auswahl (Sorte, dann Einheit). */
export function sortDrinks(drinks: Drink[]): Drink[] {
  const pos = (d: Drink) => {
    const ti = ALCOHOL_TYPES.findIndex((t) => t.key === d.type)
    const ui = alcoholType(d.type)?.units.findIndex((u) => u.key === d.unit) ?? 0
    return ti * 100 + ui
  }
  return [...drinks].sort((a, b) => pos(a) - pos(b))
}

/** Summe in Standardgetränken (auf 0,1 gerundet). */
export function standardDrinks(drinks: Drink[]): number {
  const total = drinks.reduce((sum, d) => {
    const u = alcoholType(d.type)?.units.find((x) => x.key === d.unit)
    return sum + (u ? u.sd * d.count : 0)
  }, 0)
  return Math.round(total * 10) / 10
}
