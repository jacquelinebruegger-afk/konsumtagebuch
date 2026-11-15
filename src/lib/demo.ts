import { CATALOG, initialCategories } from './catalog'
import { standardDrinks, type AlcoholDraft } from './alcohol'
import { addDays, diffDays, monthRange, toDateStr, uid, weekRange } from './dates'
import type { AppData, Entry, Goal, Settings } from './types'

export const defaultSettings: Settings = { lang: 'de', push: true, reminder: true }

export function emptyData(): AppData {
  return {
    version: 1,
    categories: initialCategories(),
    entries: [],
    goals: [],
    settings: { ...defaultSettings },
    seeded: true,
  }
}

function rng(seed: number) {
  let s = seed
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296
    return s / 4294967296
  }
}

const NOTES = [
  'Nach der Arbeit, um abzuschalten.',
  'Stressiger Tag, wenig Schlaf.',
  'Mit Freunden unterwegs, schwer Nein zu sagen.',
  'Langeweile am Abend.',
  '',
  '',
]
const CONTEXTS = ['Zuhause, allein', 'Bei der Arbeit', 'Unterwegs', 'Bar, mit Kollegen', 'Zuhause, mit Partner/in']

export function demoData(now = new Date()): AppData {
  const base = emptyData()
  const today = toDateStr(now)
  const rand = rng(42)
  const pick = <T,>(arr: T[]) => arr[Math.floor(rand() * arr.length)]
  const entries: Entry[] = []

  const add = (day: string, hour: number, minute: number, categoryKey: string, amount: number, extra: Partial<Entry> = {}) => {
    const [y, m, d] = day.split('-').map(Number)
    const at = new Date(y, m - 1, d, hour, minute)
    if (at.getTime() > now.getTime()) return
    entries.push({
      id: uid(),
      categoryId: `cat-${categoryKey}`,
      at: at.toISOString(),
      amount,
      unitIdx: 0,
      context: pick(CONTEXTS),
      craving: Math.floor(rand() * 8) + 1,
      tension: Math.floor(rand() * 8) + 1,
      mood: Math.floor(rand() * 8) + 1,
      pain: Math.floor(rand() * 6),
      notes: pick(NOTES),
      ...extra,
    })
  }

  const [ws, we] = weekRange(today)
  const drink = (d: AlcoholDraft): Partial<Entry> & { amount: number } => ({
    amount: standardDrinks(d),
    alcohol: { type: d.type!, serving: d.serving, count: d.count },
  })
  const alcoholWeek: (AlcoholDraft | null)[] = [
    { type: 'beer', serving: 'stange-300', count: 1 },
    null,
    { type: 'wine', serving: 'glass-200', count: 1 },
    null,
    { type: 'spirits', serving: 'shot-40', count: 1 },
    { type: 'beer', serving: 'large-500', count: 1 },
    null,
  ]
  const alcoholPast = (): AlcoholDraft | null => {
    const r = rand()
    if (r < 0.4) return null
    if (r < 0.7) return { type: 'beer', serving: 'stange-300', count: 1 }
    if (r < 0.9) return { type: 'wine', serving: 'glass-100', count: 1 + Math.floor(rand() * 2) }
    return { type: 'spirits', serving: 'shot-20', count: 1 }
  }
  for (let i = 0; i < 21; i++) {
    const day = addDays(today, -i)
    const offset = diffDays(ws, day)
    const inWeek = offset >= 0
    const alcohol = inWeek ? alcoholWeek[offset] : alcoholPast()
    if (alcohol) {
      const { amount, ...rest } = drink(alcohol)
      add(day, 19 + Math.floor(rand() * 3), Math.floor(rand() * 60), 'alcohol', amount, rest)
    }
    if (rand() > 0.15) {
      const n = inWeek && offset === 1 ? 8 : 3 + Math.floor(rand() * 3)
      add(day, 8, 10 + Math.floor(rand() * 40), 'nicotine', Math.ceil(n / 2))
      add(day, 15, Math.floor(rand() * 60), 'nicotine', n - Math.ceil(n / 2))
    }
    if (i % 3 === 0) add(day, 14, 32, 'cannabis', 1, { notes: NOTES[0], context: 'Zuhause, allein', craving: 3, tension: 7, mood: 5, pain: 9 })
    if (i % 5 === 1) add(day, 17, 20, 'shopping', 20 + Math.floor(rand() * 3) * 10)
    if (i % 6 === 2) add(day, 21, 45, 'gambling', 30 + Math.floor(rand() * 4) * 15, { spend: 20 + Math.floor(rand() * 4) * 10 })
  }
  entries.sort((a, b) => b.at.localeCompare(a.at))

  const [ms, me] = monthRange(today)
  const goals: Goal[] = [
    { id: uid(), categoryId: 'cat-alcohol', period: 'week', start: ws, end: we, maxPerDay: 2, maxPerPeriod: 8, freeDays: 3 },
    { id: uid(), categoryId: 'cat-nicotine', period: 'week', start: ws, end: we, maxPerDay: 5, maxPerPeriod: 35 },
    { id: uid(), categoryId: 'cat-shopping', period: 'month', start: ms, end: me, maxSpend: 100 },
    { id: uid(), categoryId: 'cat-alcohol', period: 'week', start: addDays(ws, -7), end: addDays(we, -7), maxPerDay: 3, maxPerPeriod: 12, freeDays: 1 },
  ]

  return { ...base, entries, goals }
}

export const KNOWN_KEYS = CATALOG.map((c) => c.key)
