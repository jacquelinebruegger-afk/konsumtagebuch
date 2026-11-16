import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useMatch, useNavigate, useParams } from 'react-router-dom'
import { IconBook, IconChevronDown, IconChevronRight, IconClose, IconPlus, IconInfo, IconShare } from '../components/Icons'
import { productTypesSummary, useProductLabels } from '../components/ProductFields'
import { productSet, sortProducts } from '../lib/catalog'
import { Badge, ConfirmDialog, ScoreBar, Sheet, TopBar, useGoBack, useToast } from '../components/ui'
import { addDays, dayPart, fmtDayLong, fmtDayMedium, fmtNumber, fmtTime, toDateStr } from '../lib/dates'
import { dailyGoalReachedYesterday, entryDay } from '../lib/goals'
import { useI18n } from '../lib/i18n'
import { useStore } from '../lib/store'
import type { Key } from '../lib/de'
import type { Entry } from '../lib/types'
import { EntryEdit } from './EntryForms'
import { ShareContent } from './More'

export function DiaryLayout() {
  const { t, tn, lang, catName, entryUnit } = useI18n()
  const productLabels = useProductLabels()
  const { data } = useStore()
  const location = useLocation()
  const detailMatch = useMatch('/tagebuch/eintrag/:id/*')
  const selectedId = detailMatch?.params.id
  const today = toDateStr(new Date())
  const yesterday = addDays(today, -1)

  const groups = useMemo(() => {
    const map = new Map<string, Entry[]>()
    for (const e of [...data.entries].sort((a, b) => b.at.localeCompare(a.at))) {
      const d = entryDay(e)
      map.set(d, [...(map.get(d) ?? []), e])
    }
    return [...map.entries()]
  }, [data.entries])

  const [open, setOpen] = useState<Set<string>>(() => new Set(groups.slice(0, 1).map(([d]) => d)))
  const [dismissed, setDismissed] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const expandDay = (location.state as { expandDay?: string } | null)?.expandDay
  useEffect(() => {
    if (expandDay) setOpen((s) => new Set(s).add(expandDay))
  }, [expandDay])

  const selected = data.entries.find((e) => e.id === selectedId)
  useEffect(() => {
    if (selected) setOpen((s) => (s.has(entryDay(selected)) ? s : new Set(s).add(entryDay(selected))))
  }, [selected])

  const toggle = (d: string) =>
    setOpen((s) => {
      const n = new Set(s)
      if (n.has(d)) n.delete(d)
      else n.add(d)
      return n
    })

  const banner = useMemo(() => {
    if (dismissed) return null
    if (data.settings.push) {
      const g = dailyGoalReachedYesterday(data.goals, data.entries, today)
      if (g) {
        const cat = data.categories.find((c) => c.id === g.categoryId)
        return { kind: 'success' as const, text: t('diary.congrats', { name: catName(cat) }) }
      }
    }
    if (data.settings.reminder && !data.entries.some((e) => entryDay(e) === today)) {
      return { kind: 'info' as const, text: t(new Date().getDate() % 2 ? 'diary.reminder1' : 'diary.reminder2') }
    }
    return null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismissed, data.settings.push, data.settings.reminder, data.goals, data.entries, data.categories, lang, today])

  return (
    <>
      <section className="screen" aria-label={t('diary.title')}>
        <TopBar title={t('diary.title')} />
        <div className="content">
          <div className="diary-actions">
            <Link to="/neu/kategorie" className="btn btn--primary btn--sm">
              <IconPlus size={20} />
              <span>{t('diary.newShort')}</span>
            </Link>
            <button type="button" className="btn btn--secondary btn--sm" onClick={() => setShareOpen(true)}>
              <IconShare size={20} />
              <span>{t('share.title')}</span>
            </button>
          </div>
          {banner && (
            <div className={`banner banner--${banner.kind} banner--dismissible`} role="status">
              <IconInfo />
              <button type="button" className="labelbtn labelbtn--sm" onClick={() => setDismissed(true)}>
                <IconClose size={20} />
                <span>{t('common.close')}</span>
              </button>
              <p>{banner.text}</p>
            </div>
          )}

          {groups.length === 0 ? (
            <div className="empty">
              <span className="empty__icon" aria-hidden="true">
                <IconBook size={32} />
              </span>
              <h2>{t('diary.empty.title')}</h2>
              <p>{t('diary.empty.text')}</p>
              <Link to="/neu/kategorie" className="btn btn--primary">
                {t('diary.empty.cta')}
              </Link>
            </div>
          ) : (
            <ul className="days" aria-label={t('diary.list')}>
              {groups.map(([day, entries]) => {
                const isOpen = open.has(day)
                const cats = [...new Set(entries.map((e) => e.categoryId))]
                return (
                  <li key={day} className="day">
                    <h2 className="day__head">
                      <button type="button" aria-expanded={isOpen} aria-controls={`day-${day}`} onClick={() => toggle(day)} className="day__toggle">
                        <span className="day__text">
                          {(day === today || day === yesterday) && (
                            <span className="day__eyebrow">{t(day === today ? 'diary.today' : 'diary.yesterday')}</span>
                          )}
                          <span className="day__date">{fmtDayMedium(day, lang)}</span>
                        </span>
                        <span className="day__meta">
                          {!isOpen && (
                            <span className="day__badges">
                              {cats.slice(0, 4).map((id) => {
                                const c = data.categories.find((x) => x.id === id)
                                return c ? <Badge key={id} category={c} size="sm" /> : null
                              })}
                            </span>
                          )}
                          <span className="day__count">{tn('diary.count', entries.length)}</span>
                          <IconChevronDown className={`chev${isOpen ? ' chev--open' : ''}`} size={20} />
                        </span>
                      </button>
                    </h2>
                    {isOpen && (
                      <ul id={`day-${day}`} className="entries">
                        {entries.map((e) => {
                          const cat = data.categories.find((c) => c.id === e.categoryId)
                          const d = new Date(e.at)
                          return (
                            <li key={e.id}>
                              <Link
                                to={`/tagebuch/eintrag/${e.id}`}
                                className={`entry${e.id === selectedId ? ' is-selected' : ''}`}
                                aria-current={e.id === selectedId ? 'true' : undefined}
                              >
                                {cat && <Badge category={cat} />}
                                <span className="entry__main">
                                  <span className="entry__name">{catName(cat)}</span>
                                  <span className="entry__time">
                                    {t(`daypart.${e.dayPart ?? dayPart(d)}` as Key)}
                                    {e.dayPart ? (e.products?.length ? ` · ${productTypesSummary(e.products, productLabels.type)}` : '') : ` · ${fmtTime(d, lang)}`}
                                  </span>
                                </span>
                                <span className="entry__amount">
                                  {fmtNumber(e.amount, lang)} × {entryUnit(e, cat)}
                                </span>
                                <IconChevronRight className="entry__chev" size={18} />
                              </Link>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>
      {shareOpen && (
        <Sheet title={t('share.title')} onClose={() => setShareOpen(false)}>
          <div className="content prose">
            <ShareContent />
          </div>
        </Sheet>
      )}
      <Outlet />
    </>
  )
}

export function EntryDetail() {
  const { id } = useParams()
  const { t, lang, catName, entryUnit } = useI18n()
  const productLabels = useProductLabels()
  const { data, deleteEntry } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  const close = useGoBack('/tagebuch')
  const [confirm, setConfirm] = useState(false)

  const entry = data.entries.find((e) => e.id === id)
  const cat = data.categories.find((c) => c.id === entry?.categoryId)

  if (!entry) {
    return (
      <Sheet title={t('entry.title')} onClose={() => navigate('/tagebuch', { replace: true })}>
        <div className="content">
          <p>{t('entry.notFound')}</p>
        </div>
      </Sheet>
    )
  }

  const d = new Date(entry.at)
  const showsSpend = entry.spend != null && entry.spend > 0
  const remove = () => {
    deleteEntry(entry.id)
    setConfirm(false)
    toast(t('entry.deleted'))
    navigate('/tagebuch', { replace: true })
  }

  return (
    <Sheet
      title={t('entry.title')}
      onClose={close}
      actions={
        <>
          <Link to={`/tagebuch/eintrag/${entry.id}/bearbeiten`} replace className="btn btn--primary">
            {t('common.edit')}
          </Link>
          <button type="button" className="btn btn--link btn--link-danger" onClick={() => setConfirm(true)}>
            {t('entry.delete')}
          </button>
        </>
      }
    >
      <div className="content">
        <div className="entry-head">
          {cat && <Badge category={cat} size="lg" />}
          <div>
            <h2 className="entry-head__name">{catName(cat)}</h2>
            <p className="entry-head__date">
              {fmtDayLong(toDateStr(d), lang)} · {t(`daypart.${entry.dayPart ?? dayPart(d)}` as Key)}
              {entry.dayPart ? '' : `, ${fmtTime(d, lang)}`}
            </p>
          </div>
        </div>

        <dl className="facts">
          <div>
            <dt>{t('entry.amount')}</dt>
            <dd>
              {fmtNumber(entry.amount, lang)} × {entryUnit(entry, cat)}
            </dd>
          </div>
          {entry.products && entry.products.length > 0 && (
            <div>
              <dt>{t(`entry.products.${productSet(cat) ?? 'alcohol'}` as Key)}</dt>
              <dd>
                <ul className="productlist">
                  {sortProducts(entry.products).map((dr) => (
                    <li key={`${dr.type}-${dr.unit}`}>
                      {fmtNumber(dr.count, lang)} × {productLabels.type(dr.type)}, {productLabels.unit(dr.type, dr.unit)}
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
          {showsSpend && (
            <div>
              <dt>{t('entry.spend')}</dt>
              <dd>{fmtNumber(entry.spend!, lang)} CHF</dd>
            </div>
          )}
          {entry.context && (
            <div>
              <dt>{t('entry.context')}</dt>
              <dd>{entry.context}</dd>
            </div>
          )}
        </dl>

        <h3 className="eyebrow">{t('feel.title')}</h3>
        <div className="scorebars">
          <ScoreBar label={t('feel.craving')} value={entry.craving} />
          <ScoreBar label={t('feel.tension')} value={entry.tension} />
          <ScoreBar label={t('feel.mood')} value={entry.mood} />
          <ScoreBar label={t('feel.pain')} value={entry.pain} />
        </div>

        {entry.notes && (
          <>
            <h3 className="eyebrow">{t('entry.notes')}</h3>
            <blockquote className="notes">„{entry.notes}“</blockquote>
          </>
        )}
      </div>
      <ConfirmDialog
        open={confirm}
        title={t('entry.deleteTitle')}
        text={t('entry.deleteText')}
        confirmLabel={t('confirm.yes')}
        onConfirm={remove}
        onClose={() => setConfirm(false)}
      />
    </Sheet>
  )
}

/** Route «tagebuch/eintrag/:id/*»: Detail oder Bearbeiten, jeweils als Overlay über der Liste. */
export function EntryOverlay() {
  const params = useParams()
  return params['*'] === 'bearbeiten' ? <EntryEdit /> : <EntryDetail />
}
