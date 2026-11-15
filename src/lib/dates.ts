import type { DayPart, Lang } from './types'

export const LOCALES: Record<Lang, string> = { de: 'de-CH', fr: 'fr-CH', it: 'it-CH' }

const p2 = (n: number) => String(n).padStart(2, '0')

export const toDateStr = (d: Date) => `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())}`
export const toTimeStr = (d: Date) => `${p2(d.getHours())}:${p2(d.getMinutes())}`

export function parseDate(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function combine(dateStr: string, timeStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = timeStr.split(':').map(Number)
  return new Date(y, m - 1, d, hh || 0, mm || 0).toISOString()
}

export const addDays = (s: string, n: number) => {
  const d = parseDate(s)
  d.setDate(d.getDate() + n)
  return toDateStr(d)
}

export function diffDays(a: string, b: string): number {
  return Math.round((parseDate(b).getTime() - parseDate(a).getTime()) / 86400000)
}

export function weekRange(ref: string): [string, string] {
  const d = parseDate(ref)
  const offset = (d.getDay() + 6) % 7
  const start = addDays(ref, -offset)
  return [start, addDays(start, 6)]
}

export function monthRange(ref: string): [string, string] {
  const d = parseDate(ref)
  const start = new Date(d.getFullYear(), d.getMonth(), 1)
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0)
  return [toDateStr(start), toDateStr(end)]
}

export type { DayPart }

/** Beginn jeder Tageszeit (Stunde). Nacht: 23–5 Uhr. */
export const DAYPART_START: Record<DayPart, number> = { morning: 5, forenoon: 9, noon: 12, afternoon: 14, evening: 18, night: 23 }
export const DAYPART_ORDER: DayPart[] = ['morning', 'forenoon', 'noon', 'afternoon', 'evening', 'night']
/** Richtwert für `at`, damit Einträge einer Tageszeit sinnvoll sortiert werden. */
const DAYPART_ANCHOR: Record<DayPart, [number, number]> = {
  morning: [7, 0],
  forenoon: [10, 30],
  noon: [13, 0],
  afternoon: [16, 0],
  evening: [20, 0],
  night: [23, 30],
}

export function dayPart(d: Date): DayPart {
  const h = d.getHours()
  if (h >= 5 && h < 9) return 'morning'
  if (h >= 9 && h < 12) return 'forenoon'
  if (h >= 12 && h < 14) return 'noon'
  if (h >= 14 && h < 18) return 'afternoon'
  if (h >= 18 && h < 23) return 'evening'
  return 'night'
}

/** Liegt der Beginn dieser Tageszeit am gewählten Tag noch in der Zukunft? */
export function dayPartInFuture(dateStr: string, part: DayPart, now = new Date()): boolean {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(y, m - 1, d, DAYPART_START[part]) > now
}

/** Richtwert-Zeitpunkt für eine Tageszeit (nie in der Zukunft). */
export function atForDayPart(dateStr: string, part: DayPart, now = new Date()): string {
  const [y, m, d] = dateStr.split('-').map(Number)
  const [hh, mm] = DAYPART_ANCHOR[part]
  const at = new Date(y, m - 1, d, hh, mm)
  return (at > now ? now : at).toISOString()
}

export const fmtDayLong = (s: string, lang: Lang) =>
  new Intl.DateTimeFormat(LOCALES[lang], { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(parseDate(s))

export const fmtDayMedium = (s: string, lang: Lang) =>
  new Intl.DateTimeFormat(LOCALES[lang], { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }).format(parseDate(s))

export const fmtDayShort = (s: string, lang: Lang) =>
  new Intl.DateTimeFormat(LOCALES[lang], { day: '2-digit', month: '2-digit' }).format(parseDate(s))

export const fmtDayFull = (s: string, lang: Lang) =>
  new Intl.DateTimeFormat(LOCALES[lang], { day: '2-digit', month: '2-digit', year: 'numeric' }).format(parseDate(s))

export const fmtTime = (d: Date, lang: Lang) =>
  new Intl.DateTimeFormat(LOCALES[lang], { hour: '2-digit', minute: '2-digit', hour12: false }).format(d)

export const fmtNumber = (n: number, lang: Lang) =>
  new Intl.NumberFormat(LOCALES[lang], { maximumFractionDigits: 2 }).format(n)

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4)
