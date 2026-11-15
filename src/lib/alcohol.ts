import type { Key } from './de'
import type { Entry } from './types'

/**
 * Annahme: 1 Standardgetränk = 10 g reiner Alkohol.
 * Die Richtwerte (Alkoholgehalt, Gläsergrössen) sind Schätzungen und sollten
 * mit Sucht Schweiz bzw. der Fachstelle abgestimmt werden.
 */
export const GRAMS_PER_STANDARD_DRINK = 10
const ETHANOL_G_PER_ML = 0.789

export type AlcoholTypeKey = 'beer' | 'wine' | 'sparkling' | 'spirits' | 'mixed' | 'alcopop' | 'cider' | 'liqueur' | 'other'
type ServingLabel = 'shot' | 'glass' | 'stange' | 'large' | 'mass' | 'bottle' | 'can'

export interface Serving {
  key: string
  label: ServingLabel
  ml: number
}

export interface AlcoholType {
  key: AlcoholTypeKey
  /** Alkoholgehalt in Volumenprozent (Richtwert) */
  abv: number
  servings: Serving[]
}

const sv = (label: ServingLabel, ml: number): Serving => ({ key: `${label}-${ml}`, label, ml })

export const ALCOHOL_TYPES: AlcoholType[] = [
  { key: 'beer', abv: 5, servings: [sv('stange', 300), sv('can', 330), sv('large', 500), sv('mass', 1000)] },
  { key: 'wine', abv: 12.5, servings: [sv('glass', 100), sv('glass', 200), sv('glass', 300), sv('bottle', 750)] },
  { key: 'sparkling', abv: 11, servings: [sv('glass', 100), sv('glass', 200), sv('bottle', 750)] },
  { key: 'spirits', abv: 40, servings: [sv('shot', 10), sv('shot', 20), sv('shot', 40)] },
  { key: 'mixed', abv: 8, servings: [sv('glass', 200), sv('glass', 300), sv('glass', 400)] },
  { key: 'alcopop', abv: 5, servings: [sv('bottle', 275), sv('can', 330)] },
  { key: 'cider', abv: 5, servings: [sv('glass', 300), sv('bottle', 330), sv('large', 500)] },
  { key: 'liqueur', abv: 18, servings: [sv('shot', 20), sv('shot', 40), sv('glass', 100)] },
  { key: 'other', abv: 0, servings: [] },
]

export interface AlcoholDetail {
  type: AlcoholTypeKey
  /** Schlüssel der Portion; bei «Anderes» leer, dann ist count die Zahl der Standardgetränke */
  serving?: string
  count: number
}

export interface AlcoholDraft {
  type?: AlcoholTypeKey
  serving?: string
  count: number
}

export const alcoholType = (key?: string) => ALCOHOL_TYPES.find((t) => t.key === key)

export function standardDrinks(d: AlcoholDraft): number {
  if (!d.type) return 0
  if (d.type === 'other') return round1(d.count)
  const type = alcoholType(d.type)
  const serving = type?.servings.find((s) => s.key === d.serving)
  if (!type || !serving) return 0
  const grams = serving.ml * (type.abv / 100) * ETHANOL_G_PER_ML * d.count
  return round1(grams / GRAMS_PER_STANDARD_DRINK)
}

export const isAlcoholDraftComplete = (d: AlcoholDraft): boolean =>
  !!d.type && d.count > 0 && (d.type === 'other' || !!alcoholType(d.type)?.servings.some((s) => s.key === d.serving))

const round1 = (n: number) => Math.round(n * 10) / 10

export function toDetail(d: AlcoholDraft): AlcoholDetail | undefined {
  if (!d.type) return undefined
  return { type: d.type, serving: d.type === 'other' ? undefined : d.serving, count: d.count }
}

export function volumeText(ml: number, fmt: (n: number) => string): string {
  if (ml < 50) return `${fmt(ml / 10)} cl`
  if (ml >= 1000) return `${fmt(ml / 1000)} l`
  return `${fmt(ml / 100)} dl`
}

type T = (key: Key, params?: Record<string, string | number>) => string

export const alcoholTypeName = (t: T, type: string) => t(`alc.type.${type}` as Key)

export function servingParts(t: T, fmt: (n: number) => string, type: string, servingKey?: string) {
  const s = alcoholType(type)?.servings.find((x) => x.key === servingKey)
  if (!s) return undefined
  return { label: t(`alc.sv.${s.label}` as Key), volume: volumeText(s.ml, fmt) }
}

export function sgText(t: T, n: number, fmt: (n: number) => string): string {
  return n === 1 ? t('alc.sg.one') : t('alc.sg.other', { n: fmt(n) })
}

/** Kurzbeschreibung eines Alkohol-Eintrags für Listen und Details. */
export function describeAlcohol(t: T, fmt: (n: number) => string, e: Entry) {
  const d = e.alcohol
  if (!d) return undefined
  const typeName = alcoholTypeName(t, d.type)
  if (d.type === 'other') return { typeName, quantity: sgText(t, d.count, fmt), sg: undefined }
  const parts = servingParts(t, fmt, d.type, d.serving)
  const quantity = parts ? `${fmt(d.count)} × ${parts.label} ${parts.volume}` : sgText(t, e.amount, fmt)
  return { typeName, quantity, sg: sgText(t, e.amount, fmt) }
}
