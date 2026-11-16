import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { IconChat, IconCheck, IconChevronRight, IconPlus, IconTarget } from '../components/Icons'
import { Badge, Sheet, TopBar } from '../components/ui'
import { fmtDayLong, toDateStr } from '../lib/dates'
import type { Key } from '../lib/de'
import { dailyGoalOnTrackToday, dailyGoalReachedYesterday, entryDay } from '../lib/goals'
import { useI18n } from '../lib/i18n'
import { SupportContent } from './More'
import { useStore } from '../lib/store'
import { RowView, useResults } from './Goals'

function greetingKey(d: Date): Key {
  const h = d.getHours()
  if (h >= 5 && h < 11) return 'home.hi.morning'
  if (h >= 11 && h < 18) return 'home.hi.day'
  return 'home.hi.evening'
}

export function HomePage() {
  const { t, tn, lang, catName } = useI18n()
  const { data } = useStore()
  const [supportOpen, setSupportOpen] = useState(false)
  const results = useResults()
  const now = new Date()
  const today = toDateStr(now)

  const todays = useMemo(() => data.entries.filter((e) => entryDay(e) === today), [data.entries, today])
  const todayCats = [...new Set(todays.map((e) => e.categoryId))]
  const activeGoals = results.filter((r) => !r.ended).slice(0, 3)

  // Nur positive Hinweise. Wer sein Ziel nicht erreicht, bekommt hier keine Meldung (die Details stehen unter «Ziele»).
  const messages = useMemo(() => {
    const list: string[] = []
    const reached = dailyGoalReachedYesterday(data.goals, data.entries, today)
    if (reached) {
      const cat = data.categories.find((c) => c.id === reached.categoryId)
      list.push(t('diary.congrats', { name: catName(cat) }))
    }
    const onTrack = dailyGoalOnTrackToday(data.goals, data.entries, today)
    if (onTrack) {
      const cat = data.categories.find((c) => c.id === onTrack.goal.categoryId)
      list.push(t('home.todayOk', { name: catName(cat) }))
    }
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.goals, data.entries, data.categories, today, lang])

  return (
    <div className="screen">
      <TopBar title={t('home.title')} />
      <div className="content">
        <div className="hello">
          <h2 className="hello__hi">{t(greetingKey(now))}</h2>
          <p className="hello__date">{fmtDayLong(today, lang)}</p>
        </div>

        {messages.map((m) => (
          <div key={m} className="banner banner--success" role="status">
            <IconCheck />
            <p>{m}</p>
          </div>
        ))}

        <ul className="quick">
          <li>
            <Link to="/neu/kategorie" className="qtile qtile--primary">
              <span className="qtile__icon" aria-hidden="true">
                <IconPlus size={26} />
              </span>
              <span className="qtile__title">{t('home.newEntry')}</span>
              <span className="qtile__hint">{t('home.newEntryHint')}</span>
            </Link>
          </li>
          <li>
            <Link to="/ziele/neu" className="qtile">
              <span className="qtile__icon" aria-hidden="true">
                <IconTarget size={26} />
              </span>
              <span className="qtile__title">{t('home.newGoal')}</span>
              <span className="qtile__hint">{t('home.newGoalHint')}</span>
            </Link>
          </li>
        </ul>

        <h2 className="eyebrow">{t('home.today')}</h2>
        <Link to="/tagebuch" className="homecard">
          {todays.length === 0 ? (
            <span className="homecard__text">{t('home.todayNone')}</span>
          ) : (
            <>
              <span className="day__badges">
                {todayCats.slice(0, 4).map((id) => {
                  const c = data.categories.find((x) => x.id === id)
                  return c ? <Badge key={id} category={c} size="sm" /> : null
                })}
              </span>
              <span className="homecard__text">{tn('diary.count', todays.length)}</span>
            </>
          )}
          <span className="homecard__link">
            {t('home.toDiary')}
            <IconChevronRight size={18} />
          </span>
        </Link>

        {activeGoals.length > 0 && (
          <>
            <h2 className="eyebrow">{t('home.goals')}</h2>
            <div className="homegoals">
              <ul className="cards">
                {activeGoals.map((r) => {
                  const cat = data.categories.find((c) => c.id === r.goal.categoryId)
                  if (!cat) return null
                  return (
                    <li key={r.goal.id} className="card">
                      <Link to={`/ziele/${r.goal.id}`} className="card__head" aria-label={t('goals.open', { name: catName(cat) })}>
                        <Badge category={cat} />
                        <span className="card__title">
                          <span className="card__name">{catName(cat)}</span>
                        </span>
                        <IconChevronRight size={18} className="card__chev" />
                      </Link>
                      <ul className="grows">
                        {r.rows.map((row) => (
                          <RowView key={row.kind} row={row} period={r.goal.period} />
                        ))}
                      </ul>
                    </li>
                  )
                })}
              </ul>
              <Link to="/ziele" className="homecard__link homegoals__all">
                {t('home.allGoals')}
                <IconChevronRight size={18} />
              </Link>
            </div>
          </>
        )}
        <button type="button" className="supporttile" onClick={() => setSupportOpen(true)}>
          <span className="supporttile__icon" aria-hidden="true">
            <IconChat size={24} />
          </span>
          <span className="supporttile__text">
            <span className="supporttile__title">{t('support.title')}</span>
            <span className="supporttile__hint">{t('home.supportHint')}</span>
          </span>
          <IconChevronRight size={18} className="supporttile__chev" />
        </button>
        {supportOpen && (
          <Sheet title={t('support.title')} onClose={() => setSupportOpen(false)}>
            <div className="content prose">
              <SupportContent />
            </div>
          </Sheet>
        )}
      </div>
    </div>
  )
}
