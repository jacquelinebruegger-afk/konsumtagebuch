import { useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { IconCheck, IconChevronDown, IconChevronRight, IconClock, IconCross, IconPlus, IconTarget } from '../components/Icons'
import { Badge, ConfirmDialog, Field, Stepper, Switch, TopBar, useGoBack, useToast } from '../components/ui'
import { hasSpend, unitStep } from '../lib/catalog'
import { addDays, diffDays, fmtDayFull, fmtDayShort, fmtNumber, monthRange, toDateStr, weekRange } from '../lib/dates'
import type { Key } from '../lib/de'
import { evaluateGoal, spendOf, type GoalRow, type GoalResult } from '../lib/goals'
import { useI18n } from '../lib/i18n'
import { useStore } from '../lib/store'
import type { Goal, GoalPeriod } from '../lib/types'

const ROW_LABEL: Record<GoalRow['kind'], Record<GoalPeriod, Key>> = {
  perDay: { week: 'goals.perDay', month: 'goals.perDay', custom: 'goals.perDay' },
  perPeriod: { week: 'goals.perWeek', month: 'goals.perMonth', custom: 'goals.perPeriod' },
  freeDays: { week: 'goals.freeDays', month: 'goals.freeDays', custom: 'goals.freeDays' },
  spend: { week: 'goals.spendWeek', month: 'goals.spendMonth', custom: 'goals.spendPeriod' },
}

function nextPeriod(g: Goal): { start: string; end: string } {
  if (g.period === 'week') {
    const [s, e] = weekRange(addDays(g.end, 1))
    return { start: s, end: e }
  }
  if (g.period === 'month') {
    const [s, e] = monthRange(addDays(g.end, 1))
    return { start: s, end: e }
  }
  const len = diffDays(g.start, g.end)
  return { start: addDays(g.end, 1), end: addDays(g.end, 1 + len) }
}

function useResults(): GoalResult[] {
  const { data } = useStore()
  const { entryUnitRaw } = useI18n()
  const today = toDateStr(new Date())
  return useMemo(
    () =>
      data.goals.map((g) =>
        evaluateGoal(g, data.entries, today, (e) => {
          const cat = data.categories.find((c) => c.id === e.categoryId)
          return spendOf(e, cat, entryUnitRaw(e, cat))
        }),
      ),
    [data, entryUnitRaw, today],
  )
}

function RowView({ row, period }: { row: GoalRow; period: GoalPeriod }) {
  const { t, lang } = useI18n()
  const v = fmtNumber(row.value, lang)
  const tg = fmtNumber(row.target, lang)
  const failed = row.status === 'failed'
  let detail: string
  switch (row.kind) {
    case 'perDay':
      detail = failed ? t('goals.d.perDayFail', { v, t: tg }) : t('goals.d.perDay', { t: tg })
      break
    case 'perPeriod':
      detail = failed ? t('goals.d.ofFail', { v, t: tg }) : t('goals.d.of', { v, t: tg })
      break
    case 'freeDays':
      detail = t('goals.d.days', { v, t: tg })
      break
    case 'spend':
      detail = failed ? t('goals.d.spendFail', { v, t: tg }) : t('goals.d.spend', { v, t: tg })
      break
  }
  const Icon = row.status === 'achieved' ? IconCheck : row.status === 'failed' ? IconCross : IconClock
  return (
    <li className="grow">
      <span className={`grow__icon grow__icon--${row.status}`}>
        <Icon size={18} />
      </span>
      <span className="grow__text">
        <span className="grow__label">{t(ROW_LABEL[row.kind][period])}</span>
        <span className="grow__detail">
          <span className={`grow__status grow__status--${row.status}`}>{t(`goals.status.${row.status}` as Key)}</span>
          {' · '}
          {detail}
        </span>
      </span>
      <span className="bar" aria-hidden="true">
        <span className={`bar__fill bar__fill--${row.status}`} style={{ width: `${Math.max(row.ratio, 0.04) * 100}%` }} />
      </span>
    </li>
  )
}

export function GoalsPage() {
  const { t, lang, catName, catUnits } = useI18n()
  const { data, addGoal } = useStore()
  const toast = useToast()
  const results = useResults()

  const active = results.filter((r) => !r.ended)
  const past = results.filter((r) => r.ended).sort((a, b) => b.goal.end.localeCompare(a.goal.end))

  const card = (r: GoalResult) => {
    const cat = data.categories.find((c) => c.id === r.goal.categoryId)
    if (!cat) return null
    return (
      <li key={r.goal.id} className="card">
        <Link to={`/ziele/${r.goal.id}`} className="card__head" aria-label={t('goals.open', { name: catName(cat) })}>
          <Badge category={cat} />
          <span className="card__title">
            <span className="card__name">{catName(cat)}</span>
            <span className="card__unit">{catUnits(cat)[0]}</span>
          </span>
          <span className="card__period">
            {fmtDayShort(r.goal.start, lang)} – {fmtDayFull(r.goal.end, lang)}
          </span>
          <IconChevronRight size={18} className="card__chev" />
        </Link>
        <ul className="grows">
          {r.rows.map((row) => (
            <RowView key={row.kind} row={row} period={r.goal.period} />
          ))}
        </ul>
        {r.ended && (
          <div className="card__foot">
            <button
              type="button"
              className="btn btn--link"
              onClick={() => {
                addGoal({ ...r.goal, ...nextPeriod(r.goal) })
                toast(t('goals.repeated'))
              }}
            >
              {t('goals.repeat')}
            </button>
          </div>
        )}
      </li>
    )
  }

  return (
    <div className="screen">
      <TopBar
        title={t('goals.title')}
        right={
          <Link to="/ziele/neu" className="btn btn--primary btn--sm">
            <IconPlus size={20} />
            <span>{t('goals.newShort')}</span>
            <span className="sr-only">: {t('goals.new')}</span>
          </Link>
        }
      />
      <div className="content">
        {results.length === 0 ? (
          <div className="empty">
            <span className="empty__icon" aria-hidden="true">
              <IconTarget size={32} />
            </span>
            <h2>{t('goals.empty.title')}</h2>
            <p>{t('goals.empty.text')}</p>
            <Link to="/ziele/neu" className="btn btn--primary">
              {t('goals.empty.cta')}
            </Link>
          </div>
        ) : (
          <>
            {active.length > 0 && (
              <>
                <h2 className="eyebrow eyebrow--first">{t('goals.active')}</h2>
                <ul className="cards">{active.map(card)}</ul>
              </>
            )}
            {past.length > 0 && (
              <>
                <h2 className={`eyebrow${active.length === 0 ? ' eyebrow--first' : ''}`}>{t('goals.past')}</h2>
                <ul className="cards">{past.map(card)}</ul>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

interface Limit {
  on: boolean
  val: number
}

export function GoalForm() {
  const { id } = useParams()
  const { t, catName, catUnitsRaw, unitLabel, lang } = useI18n()
  const { data, addGoal, updateGoal, deleteGoal } = useStore()
  const navigate = useNavigate()
  const goBack = useGoBack('/ziele')
  const toast = useToast()
  const existing = id ? data.goals.find((g) => g.id === id) : undefined
  const today = toDateStr(new Date())

  const categories = useMemo(
    () => [...data.categories].sort((a, b) => catName(a).localeCompare(catName(b), lang)),
    [data.categories, catName, lang],
  )

  const defaultsFor = (categoryId: string) => {
    const cat = data.categories.find((c) => c.id === categoryId)
    const raw = catUnitsRaw(cat)[0]
    const money = raw === '@chf'
    return {
      day: { on: !money, val: Math.max(1, unitStep(raw)) } as Limit,
      per: { on: !money, val: Math.max(1, unitStep(raw)) * 7 } as Limit,
      free: { on: true, val: 2 } as Limit,
      spend: { on: money || (!!cat && hasSpend(cat)), val: 100 } as Limit,
    }
  }

  const [categoryId, setCategoryId] = useState(existing?.categoryId ?? categories[0]?.id ?? '')
  const [period, setPeriod] = useState<GoalPeriod>(existing?.period ?? 'week')
  const [range, setRange] = useState<{ start: string; end: string }>(
    existing ? { start: existing.start, end: existing.end } : { start: weekRange(today)[0], end: weekRange(today)[1] },
  )
  const initial = defaultsFor(categoryId)
  const [day, setDay] = useState<Limit>(existing ? { on: existing.maxPerDay != null, val: existing.maxPerDay ?? initial.day.val } : initial.day)
  const [per, setPer] = useState<Limit>(existing ? { on: existing.maxPerPeriod != null, val: existing.maxPerPeriod ?? initial.per.val } : initial.per)
  const [free, setFree] = useState<Limit>(existing ? { on: existing.freeDays != null, val: existing.freeDays ?? 2 } : initial.free)
  const [spend, setSpend] = useState<Limit>(existing ? { on: existing.maxSpend != null, val: existing.maxSpend ?? 100 } : initial.spend)
  const [tried, setTried] = useState(false)
  const [confirm, setConfirm] = useState(false)

  if (id && !existing) return <Navigate to="/ziele" replace />

  const cat = data.categories.find((c) => c.id === categoryId)
  if (!cat) {
    return (
      <div className="screen">
        <TopBar title={t('goalForm.title')} left="close" onLeft={goBack} />
        <div className="content">
          <p>{t('goalForm.noCategory')}</p>
        </div>
      </div>
    )
  }
  const rawUnit = catUnitsRaw(cat)[0]
  const unit = unitLabel(rawUnit)
  const money = rawUnit === '@chf'
  const showSpend = money || hasSpend(cat)
  const showUnitRows = !money

  const pickCategory = (cid: string) => {
    setCategoryId(cid)
    const d = defaultsFor(cid)
    setDay(d.day)
    setPer(d.per)
    setFree(d.free)
    setSpend(d.spend)
  }

  const pickPeriod = (p: GoalPeriod) => {
    setPeriod(p)
    if (p === 'week') {
      const [s, e] = weekRange(today)
      setRange({ start: s, end: e })
    } else if (p === 'month') {
      const [s, e] = monthRange(today)
      setRange({ start: s, end: e })
    } else {
      setRange({ start: today, end: addDays(today, 6) })
    }
  }

  const periodKey = period === 'week' ? 'Week' : period === 'month' ? 'Month' : 'Period'
  const days = Math.max(1, diffDays(range.start, range.end) + 1)

  const anyLimit = (showUnitRows && (day.on || per.on)) || free.on || (showSpend && spend.on)
  const rangeErr = period === 'custom' && (!range.start || !range.end || range.end < range.start)

  const save = () => {
    setTried(true)
    if (!anyLimit || rangeErr) return
    const payload = {
      categoryId,
      period,
      start: range.start,
      end: range.end,
      maxPerDay: showUnitRows && day.on ? day.val : undefined,
      maxPerPeriod: showUnitRows && per.on ? per.val : undefined,
      freeDays: free.on ? Math.min(free.val, days) : undefined,
      maxSpend: showSpend && spend.on ? spend.val : undefined,
    }
    if (existing) updateGoal({ ...payload, id: existing.id })
    else addGoal(payload)
    toast(t('goalForm.saved'))
    goBack()
  }

  const limitRow = (
    key: string,
    label: string,
    limit: Limit,
    set: (l: Limit) => void,
    stepperProps: { step: number; min: number; max?: number; suffix: string },
  ) => (
    <div className="limit" key={key}>
      <div className="limit__head">
        <span id={`lim-${key}`} className="field__label">
          {label}
        </span>
        <Switch checked={limit.on} onChange={(on) => set({ ...limit, on })} labelledBy={`lim-${key}`} />
      </div>
      {limit.on && (
        <Stepper value={limit.val} onChange={(val) => set({ ...limit, val })} label={label} {...stepperProps} />
      )}
    </div>
  )

  return (
    <div className="screen">
      <TopBar title={existing ? t('goals.edit') : t('goalForm.title')} left="close" onLeft={goBack} />
      <div className="content">
        <Field label={t('goalForm.category')} htmlFor="goal-cat">
          <div className="select-wrap">
            <select id="goal-cat" className="select" value={categoryId} onChange={(e) => pickCategory(e.target.value)}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {catName(c)}
                </option>
              ))}
            </select>
            <IconChevronDown size={20} />
          </div>
        </Field>

        <div className="field">
          <span id="period-label" className="field__label">
            {t('goalForm.period')}
          </span>
          <div className="segmented" role="radiogroup" aria-labelledby="period-label">
            {(['week', 'month', 'custom'] as const).map((p) => (
              <button
                key={p}
                type="button"
                role="radio"
                aria-checked={period === p}
                className={`segmented__btn${period === p ? ' is-active' : ''}`}
                onClick={() => pickPeriod(p)}
              >
                {t(p === 'week' ? 'goalForm.thisWeek' : p === 'month' ? 'goalForm.thisMonth' : 'goalForm.custom')}
              </button>
            ))}
          </div>
          <p className="field__hint">
            {fmtDayFull(range.start, lang)} – {fmtDayFull(range.end, lang)}
          </p>
          {period === 'custom' && (
            <div className="row2">
              <Field label={t('goalForm.from')} htmlFor="g-from">
                <input id="g-from" type="date" className="input" value={range.start} onChange={(e) => setRange((r) => ({ ...r, start: e.target.value }))} lang={lang} />
              </Field>
              <Field label={t('goalForm.to')} htmlFor="g-to" error={tried && rangeErr ? t('goalForm.rangeError') : undefined}>
                <input id="g-to" type="date" className="input" value={range.end} min={range.start} onChange={(e) => setRange((r) => ({ ...r, end: e.target.value }))} lang={lang} />
              </Field>
            </div>
          )}
        </div>

        {showUnitRows &&
          limitRow('day', t('goalForm.maxPerDay'), day, setDay, { step: unitStep(rawUnit), min: 0, suffix: unit })}
        {showUnitRows &&
          limitRow('per', t(`goalForm.max${periodKey}` as Key), per, setPer, { step: unitStep(rawUnit), min: 0, suffix: unit })}
        {limitRow('free', t(`goalForm.free${periodKey}` as Key), free, setFree, {
          step: 1,
          min: 1,
          max: days,
          suffix: free.val === 1 ? t('goalForm.day') : t('goalForm.days', { n: free.val }),
        })}
        {showSpend &&
          limitRow('spend', t('goalForm.maxSpend'), spend, setSpend, { step: 10, min: 0, suffix: t('common.chf') })}

        {showSpend && <p className="infobox">{t('goalForm.spendInfo')}</p>}
        {tried && !anyLimit && (
          <p className="field__error" role="alert">
            {t('goalForm.noLimit')}
          </p>
        )}
      </div>
      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={save}>
          {t('goalForm.save')}
        </button>
        {existing && (
          <button type="button" className="btn btn--link btn--link-danger" onClick={() => setConfirm(true)}>
            {t('goalForm.delete')}
          </button>
        )}
      </div>
      {existing && (
        <ConfirmDialog
          open={confirm}
          title={t('goalForm.deleteTitle')}
          text={t('goalForm.deleteText')}
          confirmLabel={t('confirm.yes')}
          onConfirm={() => {
            deleteGoal(existing.id)
            setConfirm(false)
            toast(t('goalForm.deleted'))
            navigate('/ziele', { replace: true })
          }}
          onClose={() => setConfirm(false)}
        />
      )}
    </div>
  )
}
