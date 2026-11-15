import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { catalogItem } from './catalog'
import { de, type Key } from './de'
import { fr } from './fr'
import { it } from './it'
import { useStore } from './store'
import type { Category, Entry, Lang } from './types'

const DICTS: Record<Lang, Record<Key, string>> = { de, fr, it }

export type TFn = (key: Key, params?: Record<string, string | number>) => string

interface I18n {
  lang: Lang
  t: TFn
  /** Pluralisierung mit .one / .other */
  tn: (base: 'diary.count', n: number) => string
  catName: (c: Category | undefined) => string
  catUnitsRaw: (c: Category | undefined) => string[]
  unitLabel: (raw: string) => string
  catUnits: (c: Category | undefined) => string[]
  entryUnitRaw: (e: Entry, c: Category | undefined) => string
  entryUnit: (e: Entry, c: Category | undefined) => string
}

const Ctx = createContext<I18n | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const { data } = useStore()
  const lang = data.settings.lang

  useEffect(() => {
    document.documentElement.lang = lang
    document.title = DICTS[lang]['app.name']
  }, [lang])

  const value = useMemo<I18n>(() => {
    const dict = DICTS[lang]
    const t: TFn = (key, params) => {
      let s = dict[key] ?? de[key]
      if (params) for (const [k, v] of Object.entries(params)) s = s.replaceAll(`{${k}}`, String(v))
      return s
    }
    const unitLabel = (raw: string) => (raw.startsWith('@') ? t(`unit.${raw.slice(1)}` as Key) : raw)
    const catUnitsRaw = (c: Category | undefined) => {
      if (!c) return ['']
      if (c.units?.length) return c.units
      return catalogItem(c.key)?.units ?? ['']
    }
    const entryUnitRaw = (e: Entry, c: Category | undefined) => {
      const units = catUnitsRaw(c)
      return units[e.unitIdx] ?? units[0]
    }
    return {
      lang,
      t,
      tn: (base, n) => t(`${base}.${n === 1 ? 'one' : 'other'}` as Key, { n }),
      catName: (c) => {
        if (!c) return '–'
        if (c.name) return c.name
        return c.key ? t(`cat.${c.key}` as Key) : '–'
      },
      catUnitsRaw,
      unitLabel,
      catUnits: (c) => catUnitsRaw(c).map(unitLabel),
      entryUnitRaw,
      entryUnit: (e, c) => unitLabel(entryUnitRaw(e, c)),
    }
  }, [lang])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useI18n(): I18n {
  const v = useContext(Ctx)
  if (!v) throw new Error('I18nProvider fehlt')
  return v
}
