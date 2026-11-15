import type { Lang } from './types'

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

export type DayPart = 'morning' | 'afternoon' | 'evening' | 'night'

export function dayPart(d: Date): DayPart {
  const h = d.getHours()
  if (h >= 6 && h < 12) return 'morning'
  if (h >= 12 && h < 18) return 'afternoon'
  if (h >= 18 && h < 23) return 'evening'
  return 'night'
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
