export type Lang = 'de' | 'fr' | 'it'

export interface Category {
  id: string
  /** Schlüssel einer Vorlage; Name und Einheiten werden dann übersetzt, solange sie nicht überschrieben wurden. */
  key?: string
  name?: string
  /** Einheiten; Einträge, die mit "@" beginnen, sind übersetzbare Standard-Einheiten. */
  units?: string[]
  /** Zusätzliches Feld für Ausgaben in CHF (z. B. Gamen, Geldspiel). */
  spend?: boolean
}

export interface Entry {
  id: string
  categoryId: string
  /** ISO-Zeitpunkt */
  at: string
  amount: number
  unitIdx: number
  spend?: number
  context: string
  craving: number
  tension: number
  mood: number
  pain: number
  notes: string
}

export type GoalPeriod = 'week' | 'month' | 'custom'

export interface Goal {
  id: string
  categoryId: string
  period: GoalPeriod
  /** yyyy-mm-dd, inklusive */
  start: string
  /** yyyy-mm-dd, inklusive */
  end: string
  maxPerDay?: number
  maxPerPeriod?: number
  freeDays?: number
  maxSpend?: number
}

export interface Settings {
  lang: Lang
  push: boolean
  reminder: boolean
  pinHash?: string
}

export interface ShareState {
  code: string
  since: string
}

export interface AppData {
  version: 1
  categories: Category[]
  entries: Entry[]
  goals: Goal[]
  settings: Settings
  share?: ShareState
  seeded: boolean
}
