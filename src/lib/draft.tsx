import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import type { AlcoholDraft } from './alcohol'
import { toDateStr, toTimeStr } from './dates'

export interface Draft {
  categoryId?: string
  date: string
  time: string
  amount: number
  unitIdx: number
  spend: number
  context: string
  craving: number
  tension: number
  mood: number
  pain: number
  notes: string
  alcohol: AlcoholDraft
}

const fresh = (keep?: Partial<Draft>): Draft => {
  const now = new Date()
  return {
    date: toDateStr(now),
    time: toTimeStr(now),
    amount: 1,
    unitIdx: 0,
    spend: 0,
    context: '',
    craving: 0,
    tension: 0,
    mood: 0,
    pain: 0,
    notes: '',
    alcohol: { count: 1 },
    ...keep,
  }
}

interface Ctx {
  draft: Draft
  patch: (p: Partial<Draft>) => void
  reset: (keepWhen?: boolean) => void
}

const DraftCtx = createContext<Ctx | null>(null)

export function DraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<Draft>(() => fresh())
  const patch = useCallback((p: Partial<Draft>) => setDraft((d) => ({ ...d, ...p })), [])
  const reset = useCallback(
    (keepWhen = false) =>
      setDraft((d) => (keepWhen ? fresh({ date: d.date, time: d.time, context: d.context }) : fresh())),
    [],
  )
  const value = useMemo(() => ({ draft, patch, reset }), [draft, patch, reset])
  return <DraftCtx.Provider value={value}>{children}</DraftCtx.Provider>
}

export function useDraft() {
  const v = useContext(DraftCtx)
  if (!v) throw new Error('DraftProvider fehlt')
  return v
}
