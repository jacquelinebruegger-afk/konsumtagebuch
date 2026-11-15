import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { catalogItem } from './catalog'
import { demoData, emptyData } from './demo'
import { uid } from './dates'
import type { AppData, Category, Entry, Goal, Settings, ShareState } from './types'

const STORAGE_KEY = 'konsumtagebuch.v1'

function load(): AppData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as AppData
      if (parsed?.version === 1) return parsed
    }
  } catch {
    /* beschädigte Daten ignorieren */
  }
  return demoData()
}

interface Store {
  data: AppData
  addEntry: (e: Omit<Entry, 'id'>) => Entry
  updateEntry: (e: Entry) => void
  deleteEntry: (id: string) => void
  addCategory: (c: Omit<Category, 'id'>) => Category
  updateCategory: (c: Category) => void
  deleteCategory: (id: string) => void
  addGoal: (g: Omit<Goal, 'id'>) => Goal
  updateGoal: (g: Goal) => void
  deleteGoal: (id: string) => void
  updateSettings: (s: Partial<Settings>) => void
  setShare: (s: ShareState | undefined) => void
  loadDemo: () => void
  clearAll: () => void
}

const Ctx = createContext<Store | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData>(load)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      /* Speicher voll oder blockiert */
    }
  }, [data])

  const addEntry = useCallback((e: Omit<Entry, 'id'>) => {
    const entry = { ...e, id: uid() }
    setData((d) => ({ ...d, entries: [entry, ...d.entries] }))
    return entry
  }, [])

  const updateEntry = useCallback((e: Entry) => setData((d) => ({ ...d, entries: d.entries.map((x) => (x.id === e.id ? e : x)) })), [])
  const deleteEntry = useCallback((id: string) => setData((d) => ({ ...d, entries: d.entries.filter((x) => x.id !== id) })), [])

  const addCategory = useCallback((c: Omit<Category, 'id'>) => {
    const cat = { ...c, id: c.key ? `cat-${c.key}` : `cat-${uid()}` }
    setData((d) => ({ ...d, categories: [...d.categories.filter((x) => x.id !== cat.id), cat] }))
    return cat
  }, [])

  const updateCategory = useCallback(
    (c: Category) => setData((d) => ({ ...d, categories: d.categories.map((x) => (x.id === c.id ? c : x)) })),
    [],
  )

  const deleteCategory = useCallback(
    (id: string) =>
      setData((d) => ({
        ...d,
        categories: d.categories.filter((c) => c.id !== id),
        entries: d.entries.filter((e) => e.categoryId !== id),
        goals: d.goals.filter((g) => g.categoryId !== id),
      })),
    [],
  )

  const addGoal = useCallback((g: Omit<Goal, 'id'>) => {
    const goal = { ...g, id: uid() }
    setData((d) => ({ ...d, goals: [goal, ...d.goals] }))
    return goal
  }, [])
  const updateGoal = useCallback((g: Goal) => setData((d) => ({ ...d, goals: d.goals.map((x) => (x.id === g.id ? g : x)) })), [])
  const deleteGoal = useCallback((id: string) => setData((d) => ({ ...d, goals: d.goals.filter((x) => x.id !== id) })), [])

  const updateSettings = useCallback((s: Partial<Settings>) => setData((d) => ({ ...d, settings: { ...d.settings, ...s } })), [])
  const setShare = useCallback((share: ShareState | undefined) => setData((d) => ({ ...d, share })), [])

  const loadDemo = useCallback(() => setData((d) => ({ ...demoData(), settings: d.settings })), [])
  const clearAll = useCallback(() => setData(emptyData()), [])

  const value = useMemo<Store>(
    () => ({ data, addEntry, updateEntry, deleteEntry, addCategory, updateCategory, deleteCategory, addGoal, updateGoal, deleteGoal, updateSettings, setShare, loadDemo, clearAll }),
    [data, addEntry, updateEntry, deleteEntry, addCategory, updateCategory, deleteCategory, addGoal, updateGoal, deleteGoal, updateSettings, setShare, loadDemo, clearAll],
  )

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore(): Store {
  const s = useContext(Ctx)
  if (!s) throw new Error('StoreProvider fehlt')
  return s
}

export const categoryAbbr = (c: Category): string => {
  const item = catalogItem(c.key)
  if (item && !c.name) return item.abbr
  const name = (c.name ?? '').trim()
  return (name.slice(0, 2) || '??').toUpperCase()
}
