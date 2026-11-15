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

/** Tageszeit eines Eintrags (statt exakter Uhrzeit). */
export type DayPart = 'morning' | 'forenoon' | 'noon' | 'afternoon' | 'evening' | 'night'

/** Eine erfasste Alkoholmenge, z. B. 2 × Bier / Grosses Bier. */
export interface Drink {
  /** Alkoholsorte, z. B. 'beer' */
  type: string
  /** Einheit der Sorte, z. B. 'large' */
  unit: string
  count: number
}

export interface Entry {
  id: string
  categoryId: string
  /** ISO-Zeitpunkt */
  at: string
  amount: number
  unitIdx: number
  spend?: number
  /** Gewählte Tageszeit; wenn gesetzt, ist `at` nur ein Richtwert und die Uhrzeit wird nicht angezeigt. */
  dayPart?: DayPart
  /** Alkohol: einzelne Getränke. `amount` enthält dann die Summe in Standardgetränken. */
  drinks?: Drink[]
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
