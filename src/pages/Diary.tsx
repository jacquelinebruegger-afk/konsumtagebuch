import { useEffect, useMemo, useState } from 'react'
import { Link, Outlet, useLocation, useMatch, useNavigate, useParams } from 'react-router-dom'
import { IconBook, IconChevronDown, IconChevronRight, IconClose, IconNote, IconPlus, IconInfo } from '../components/Icons'
import { drinkTypesSummary, useDrinkLabels } from '../components/AlcoholFields'
import { sortDrinks } from '../lib/catalog'
import { Badge, ConfirmDialog, ScoreBar, TopBar, useToast } from '../components/ui'
import { addDays, dayPart, fmtDayLong, fmtDayMedium, fmtNumber, fmtTime, toDateStr } from '../lib/dates'
import { dailyGoalReachedYesterday, entryDay } from '../lib/goals'
import { useI18n } from '../lib/i18n'
import { useStore } from '../lib/store'
import type { Key } from '../lib/de'
import type { Entry } from '../lib/types'

export function DiaryLayout() {
  const { t, tn, lang, catName, entryUnit } = useI18n()
  const drinkLabels = useDrinkLabels()
  const { data } = useStore()
  const location = useLocation()
  const detailMatch = useMatch('/tagebuch/eintrag/:id')
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

  const newBtn = (
    <Link to="/neu/kategorie" className="btn btn--primary btn--sm">
      <IconPlus size={20} />
      <span>{t('diary.newShort')}</span>
      <span className="sr-only">: {t('diary.new')}</span>
    </Link>
  )

  return (
    <div className={`split${selectedId ? ' has-detail' : ''}`}>
      <section className="screen split__list" aria-label={t('diary.title')}>
        <TopBar title={t('diary.title')} right={newBtn} />
        <div className="content">
          {banner && (
            <div className={`banner banner--${banner.kind}`} role="status">
              <IconInfo />
              <p>{banner.text}</p>
              <button type="button" className="labelbtn labelbtn--sm" onClick={() => setDismissed(true)}>
                <IconClose size={20} />
                <span>{t('common.close')}</span>
              </button>
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
                                    {e.dayPart ? (e.drinks?.length ? ` · ${drinkTypesSummary(e.drinks, drinkLabels.type)}` : '') : ` · ${fmtTime(d, lang)}`}
                                  </span>
                                </span>
                                <span className="entry__amount">
                                  {fmtNumber(e.amount, lang)} × {entryUnit(e, cat)}
                                </span>
                                {e.notes && (
                                  <span className="entry__note" title={t('diary.hasNote')}>
                                    <IconNote size={18} />
                                    <span className="sr-only">{t('diary.hasNote')}</span>
                                  </span>
                                )}
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

      <section className="split__detail" aria-label={t('entry.title')}>
        <Outlet />
      </section>
    </div>
  )
}

export function DiaryEmptyDetail() {
  const { t } = useI18n()
  return (
    <div className="screen screen--placeholder">
      <div className="empty">
        <span className="empty__icon" aria-hidden="true">
          <IconNote size={32} />
        </span>
        <h2>{t('diary.select.title')}</h2>
        <p>{t('diary.select.text')}</p>
      </div>
    </div>
  )
}

export function EntryDetail() {
  const { id } = useParams()
  const { t, lang, catName, entryUnit } = useI18n()
  const drinkLabels = useDrinkLabels()
  const { data, deleteEntry } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  const [confirm, setConfirm] = useState(false)

  const entry = data.entries.find((e) => e.id === id)
  const cat = data.categories.find((c) => c.id === entry?.categoryId)

  if (!entry) {
    return (
      <div className="screen">
        <TopBar title={t('entry.title')} left="back" onLeft={() => navigate('/tagebuch', { replace: true })} leftMobileOnly />
        <div className="content">
          <p>{t('entry.notFound')}</p>
        </div>
      </div>
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
    <div className="screen">
      <TopBar title={t('entry.title')} left="back" onLeft={() => navigate('/tagebuch')} leftMobileOnly />
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
          {entry.drinks && entry.drinks.length > 0 && (
            <div>
              <dt>{t('entry.drinks')}</dt>
              <dd>
                <ul className="drinklist">
                  {sortDrinks(entry.drinks).map((dr) => (
                    <li key={`${dr.type}-${dr.unit}`}>
                      {fmtNumber(dr.count, lang)} × {drinkLabels.type(dr.type)}, {drinkLabels.unit(dr.type, dr.unit)}
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
      <div className="actions">
        <Link to={`/eintrag/${entry.id}/bearbeiten`} className="btn btn--primary">
          {t('common.edit')}
        </Link>
        <button type="button" className="btn btn--link btn--link-danger" onClick={() => setConfirm(true)}>
          {t('entry.delete')}
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        title={t('entry.deleteTitle')}
        text={t('entry.deleteText')}
        confirmLabel={t('confirm.yes')}
        onConfirm={remove}
        onClose={() => setConfirm(false)}
      />
    </div>
  )
}
