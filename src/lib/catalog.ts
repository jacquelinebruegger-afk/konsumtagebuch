import type { Category } from './types'

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
