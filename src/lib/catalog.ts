import type { Category, Product } from './types'

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
  { key: 'amphetamines', abbr: 'AM', units: ['@g', '@line', '@bump'], initial: true },
  { key: 'cannabis', abbr: 'CA', units: ['@joint', '@g'], initial: true },
  { key: 'gaming', abbr: 'GA', units: ['@min', '@h'], spend: true, initial: true },
  { key: 'gambling', abbr: 'GE', units: ['@min', '@h'], spend: true, initial: true },
  { key: 'ghb', abbr: 'GH', units: ['@ml'], initial: false },
  { key: 'heroin', abbr: 'HE', units: ['@mg'], initial: true },
  { key: 'shopping', abbr: 'KF', units: ['@chf'], initial: true },
  { key: 'ketamine', abbr: 'KT', units: ['@g', '@line', '@bump'], initial: true },
  { key: 'caffeine', abbr: 'KO', units: ['@mg', '@cup'], initial: false },
  { key: 'cocaine', abbr: 'KK', units: ['@g', '@line', '@bump'], initial: true },
  { key: 'mdma', abbr: 'MD', units: ['@mg'], initial: true },
  { key: 'medication', abbr: 'ME', units: ['@mg'], initial: true },
  { key: 'methamphetamine', abbr: 'MA', units: ['@mg'], initial: true },
  { key: 'nicotine', abbr: 'NI', units: ['@consumption'], initial: true },
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

/* ---------- Produkte je Kategorie (Alkohol, Nikotin) ---------- */

export type ProductSet = 'alcohol' | 'nicotine'

export interface ProductUnit {
  key: string
  /**
   * Gleichwertige Konsumeinheiten pro Stück.
   * Alkohol: Standardgetränke (≈ 10–12 g reiner Alkohol).
   * Nikotin: 1 Zigarette = 1 Snus-Beutel = 10 Züge an der Vape = 1 Konsumeinheit (Richtwert).
   */
  eq: number
}

export interface ProductType {
  key: string
  set: ProductSet
  units: ProductUnit[]
}

export const PRODUCT_TYPES: ProductType[] = [
  {
    key: 'beer',
    set: 'alcohol',
    units: [
      { key: 'stange', eq: 1 }, // Stange, 3 dl
      { key: 'large', eq: 1.7 }, // Grosses Bier, 5 dl
      { key: 'bottle33', eq: 1.1 }, // Flasche, 33 cl
      { key: 'bottle50', eq: 1.7 }, // Flasche, 5 dl
    ],
  },
  {
    key: 'wine',
    set: 'alcohol',
    units: [
      { key: 'dl1', eq: 1 },
      { key: 'dl2', eq: 2 },
      { key: 'dl3', eq: 3 },
      { key: 'bottle', eq: 7.5 }, // Flasche, 7,5 dl
    ],
  },
  {
    key: 'sparkling',
    set: 'alcohol',
    units: [
      { key: 'glass', eq: 1 }, // Glas, 1 dl
      { key: 'bottle', eq: 7.5 }, // Flasche, 7,5 dl
    ],
  },
  {
    key: 'spirits',
    set: 'alcohol',
    units: [
      { key: 'cl2', eq: 0.7 },
      { key: 'cl4', eq: 1.3 },
    ],
  },
  { key: 'cocktail', set: 'alcohol', units: [{ key: 'glass', eq: 1.5 }] },
  { key: 'other', set: 'alcohol', units: [{ key: 'standard', eq: 1 }] },
  { key: 'cigarette', set: 'nicotine', units: [{ key: 'piece', eq: 1 }] },
  { key: 'snus', set: 'nicotine', units: [{ key: 'pouch', eq: 1 }] },
  { key: 'vape', set: 'nicotine', units: [{ key: 'puffs10', eq: 1 }] },
]

/** Kategorien, bei denen zuerst das Produkt gewählt wird. */
export const productSet = (c: Category | undefined): ProductSet | undefined =>
  c?.key === 'alcohol' ? 'alcohol' : c?.key === 'nicotine' ? 'nicotine' : undefined

export const typesOf = (set: ProductSet) => PRODUCT_TYPES.filter((t) => t.set === set)

export const productType = (key: string) => PRODUCT_TYPES.find((t) => t.key === key)

export const productCount = (products: Product[], type: string, unit: string): number =>
  products.find((d) => d.type === type && d.unit === unit)?.count ?? 0

export function setProductCount(products: Product[], type: string, unit: string, count: number): Product[] {
  const rest = products.filter((d) => !(d.type === type && d.unit === unit))
  return sortProducts(count > 0 ? [...rest, { type, unit, count }] : rest)
}

/** Stabile Reihenfolge wie in der Auswahl (Sorte, dann Einheit). */
export function sortProducts(products: Product[]): Product[] {
  const pos = (d: Product) => {
    const ti = PRODUCT_TYPES.findIndex((t) => t.key === d.type)
    const ui = productType(d.type)?.units.findIndex((u) => u.key === d.unit) ?? 0
    return ti * 100 + ui
  }
  return [...products].sort((a, b) => pos(a) - pos(b))
}

/** Summe in Standardgetränken (Alkohol) bzw. Konsumeinheiten (Nikotin), auf 0,1 gerundet. */
export function productTotal(products: Product[]): number {
  const total = products.reduce((sum, d) => {
    const u = productType(d.type)?.units.find((x) => x.key === d.unit)
    return sum + (u ? u.eq * d.count : 0)
  }, 0)
  return Math.round(total * 10) / 10
}

/** Ältere Einträge ohne Produktliste: als «Anderes» bzw. Zigaretten weiterführen. */
export function legacyProducts(set: ProductSet, amount: number): Product[] {
  const count = Math.max(1, Math.round(amount))
  return set === 'alcohol'
    ? [{ type: 'other', unit: 'standard', count }]
    : [{ type: 'cigarette', unit: 'piece', count }]
}
