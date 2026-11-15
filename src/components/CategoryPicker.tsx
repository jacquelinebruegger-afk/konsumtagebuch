import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { useStore } from '../lib/store'
import type { Category } from '../lib/types'
import { IconPlus, IconSearch } from './Icons'
import { Badge } from './ui'

const RECENT_MAX = 6

export function useSortedCategories(): Category[] {
  const { data } = useStore()
  const { catName, lang } = useI18n()
  return useMemo(() => [...data.categories].sort((a, b) => catName(a).localeCompare(catName(b), lang)), [data.categories, catName, lang])
}

/** Zuletzt verwendete Kategorien (jüngster Eintrag zuerst), höchstens RECENT_MAX. */
function useRecentCategories(categories: Category[]): Category[] {
  const { data } = useStore()
  return useMemo(() => {
    const last = new Map<string, string>()
    for (const e of data.entries) {
      const prev = last.get(e.categoryId)
      if (!prev || e.at > prev) last.set(e.categoryId, e.at)
    }
    return categories
      .filter((c) => last.has(c.id))
      .sort((a, b) => (last.get(b.id) as string).localeCompare(last.get(a.id) as string))
      .slice(0, RECENT_MAX)
  }, [categories, data.entries])
}

/**
 * Kategorie-Auswahl mit Suche, «Zuletzt erfasste Kategorien» und «Alle Kategorien».
 * Wird beim neuen Eintrag und beim neuen Ziel verwendet.
 */
export function CategoryPicker({
  selectedId,
  onChoose,
  addCategoryState,
}: {
  selectedId?: string
  onChoose: (c: Category) => void
  /** Wird beim Link «Kategorie hinzufügen» mitgegeben, damit danach hierher zurückgekehrt wird. */
  addCategoryState: Record<string, boolean>
}) {
  const { t, catName } = useI18n()
  const categories = useSortedCategories()
  const recent = useRecentCategories(categories)
  const [query, setQuery] = useState('')
  const searching = query.trim() !== ''
  const filtered = categories.filter((c) => catName(c).toLowerCase().includes(query.trim().toLowerCase()))

  const tile = (c: Category) => (
    <li key={c.id}>
      <button type="button" className={`tile${selectedId === c.id ? ' is-selected' : ''}`} onClick={() => onChoose(c)} aria-pressed={selectedId === c.id}>
        <Badge category={c} size="lg" />
        <span className="tile__name">{catName(c)}</span>
      </button>
    </li>
  )

  return (
    <>
      <div className="searchbox">
        <IconSearch size={20} />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('new.search')}
          aria-label={t('new.searchLabel')}
          autoComplete="off"
        />
      </div>
      {!searching && recent.length > 0 && (
        <section aria-labelledby="recent-title">
          <h2 id="recent-title" className="eyebrow">
            {t('new.recent')}
          </h2>
          <ul className="tiles">{recent.map(tile)}</ul>
        </section>
      )}
      {!searching && recent.length > 0 && (
        <h2 id="all-title" className="eyebrow">
          {t('new.all')}
        </h2>
      )}
      <ul className="tiles">
        {filtered.map(tile)}
        {!searching && (
          <li>
            <Link to="/mehr/kategorien/hinzufuegen" state={addCategoryState} className="tile tile--add">
              <span className="badge badge--lg badge--add" aria-hidden="true">
                <IconPlus size={22} />
              </span>
              <span className="tile__name">{t('new.addCategory')}</span>
            </Link>
          </li>
        )}
      </ul>
      {filtered.length === 0 && <p className="muted">{t('new.noResults')}</p>}
    </>
  )
}
