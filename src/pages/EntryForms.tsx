import { useMemo, useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { IconChevronDown, IconPlus, IconSearch } from '../components/Icons'
import { DrinkFields, WhenFields, dayPartError } from '../components/AlcoholFields'
import { Badge, ConfirmDialog, Field, ScoreSlider, Stepper, TopBar, useGoBack, useToast } from '../components/ui'
import { hasSpend, isAlcohol, standardDrinks, unitStep } from '../lib/catalog'
import { atForDayPart, combine, dayPart as dayPartOf, toDateStr, toTimeStr } from '../lib/dates'
import type { Key } from '../lib/de'
import { useDraft } from '../lib/draft'
import { useI18n } from '../lib/i18n'
import { useStore } from '../lib/store'
import type { Category, DayPart, Drink } from '../lib/types'

/** Ältere Alkohol-Einträge ohne Getränkeliste: als Standardgetränke weiterführen. */
const legacyDrinks = (amount: number): Drink[] => [{ type: 'other', unit: 'standard', count: Math.max(1, Math.round(amount)) }]

const FEELINGS = ['craving', 'tension', 'mood', 'pain'] as const

function useSortedCategories() {
  const { data } = useStore()
  const { catName, lang } = useI18n()
  return useMemo(
    () => [...data.categories].sort((a, b) => catName(a).localeCompare(catName(b), lang)),
    [data.categories, catName, lang],
  )
}

function StepLabel({ n }: { n: 1 | 2 | 3 }) {
  const { t } = useI18n()
  const name = t(`new.step.${(['category', 'details', 'feeling'] as const)[n - 1]}` as Key)
  return <p className="eyebrow eyebrow--first">{t('new.step', { n, name })}</p>
}

export function WizardCategory() {
  const { t, catName, catUnitsRaw } = useI18n()
  const { draft, patch, reset } = useDraft()
  const navigate = useNavigate()
  const goBack = useGoBack('/tagebuch')
  const categories = useSortedCategories()
  const [query, setQuery] = useState('')

  const filtered = categories.filter((c) => catName(c).toLowerCase().includes(query.trim().toLowerCase()))

  const choose = (c: Category) => {
    patch({
      categoryId: c.id,
      unitIdx: 0,
      amount: unitStep(catUnitsRaw(c)[0]),
      ...(draft.categoryId === c.id ? {} : { drinkTypes: [], drinks: [] }),
    })
    navigate('/neu/details', { replace: true })
  }

  return (
    <div className="screen">
      <TopBar
        title={t('new.title')}
        left="close"
        onLeft={() => {
          reset()
          goBack()
        }}
      />
      <div className="content">
        <StepLabel n={1} />
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
        <ul className="tiles">
          {filtered.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                className={`tile${draft.categoryId === c.id ? ' is-selected' : ''}`}
                onClick={() => choose(c)}
                aria-pressed={draft.categoryId === c.id}
              >
                <Badge category={c} size="lg" />
                <span className="tile__name">{catName(c)}</span>
              </button>
            </li>
          ))}
          {!query && (
            <li>
              <Link to="/mehr/kategorien/hinzufuegen" state={{ fromWizard: true }} className="tile tile--add">
                <span className="badge badge--lg badge--add" aria-hidden="true">
                  <IconPlus size={22} />
                </span>
                <span className="tile__name">{t('new.addCategory')}</span>
              </Link>
            </li>
          )}
        </ul>
        {filtered.length === 0 && <p className="muted">{t('new.noResults')}</p>}
      </div>
    </div>
  )
}

export function WizardDetails() {
  const { t, lang, catName } = useI18n()
  const { data } = useStore()
  const { draft, patch } = useDraft()
  const navigate = useNavigate()
  const cat = data.categories.find((c) => c.id === draft.categoryId)
  const [tried, setTried] = useState(false)

  if (!cat) return <Navigate to="/neu/kategorie" replace />

  const alcohol = isAlcohol(cat)
  const futureErr = alcohol
    ? dayPartError(draft.date, draft.dayPart)
    : new Date(combine(draft.date, draft.time)) > new Date()
  const amountErr = alcohol ? standardDrinks(draft.drinks) <= 0 : draft.amount <= 0
  const valid = !!draft.date && (alcohol || !!draft.time) && !futureErr && !amountErr

  return (
    <div className="screen">
      <TopBar title={t('new.title')} left="back" onLeft={() => navigate('/neu/kategorie', { replace: true })} />
      <div className="content">
        <StepLabel n={2} />
        {alcohol && (
          <WhenFields
            date={draft.date}
            dayPart={draft.dayPart}
            onDate={(date) => patch({ date })}
            onDayPart={(dayPart) => patch({ dayPart })}
            showError={tried}
          />
        )}
        <div className="chosen">
          <Badge category={cat} />
          <span className="chosen__name">{catName(cat)}</span>
          <Link to="/neu/kategorie" replace className="chosen__change">
            {t('common.change')}
            <span className="sr-only">: {t('new.changeCategory')}</span>
          </Link>
        </div>

        {alcohol ? (
          <DrinkFields
            types={draft.drinkTypes}
            drinks={draft.drinks}
            onChange={(p) => patch(p)}
            error={tried && amountErr ? t('new.drinksError') : undefined}
          />
        ) : (
          <>
        <fieldset className="fieldset">
          <legend className="field__label">{t('new.dateTime')}</legend>
          <div className="row2">
            <input
              type="date"
              className="input"
              value={draft.date}
              max={toDateStr(new Date())}
              onChange={(e) => patch({ date: e.target.value })}
              aria-label={t('new.date')}
              aria-invalid={tried && futureErr}
              lang={lang}
            />
            <input
              type="time"
              className="input"
              value={draft.time}
              onChange={(e) => patch({ time: e.target.value })}
              aria-label={t('new.time')}
              aria-invalid={tried && futureErr}
              lang={lang}
            />
          </div>
          {futureErr && (
            <p className="field__error" role="alert">
              {t('new.futureError')}
            </p>
          )}
        </fieldset>

        <AmountFields
          cat={cat}
          amount={draft.amount}
          unitIdx={draft.unitIdx}
          spend={draft.spend}
          onAmount={(n) => patch({ amount: n })}
          onUnit={(i) => patch({ unitIdx: i })}
          onSpend={(n) => patch({ spend: n })}
          error={tried && amountErr ? t('new.amountError') : undefined}
        />
          </>
        )}

        <Field label={t('new.context')} htmlFor="ctx" optional>
          <input
            id="ctx"
            className="input"
            value={draft.context}
            onChange={(e) => patch({ context: e.target.value })}
            placeholder={t('new.contextPh')}
            maxLength={120}
          />
        </Field>
      </div>
      <div className="actions">
        <button
          type="button"
          className="btn btn--primary"
          onClick={() => {
            setTried(true)
            if (valid) navigate('/neu/befinden', { replace: true })
          }}
        >
          {t('common.next')}
        </button>
      </div>
    </div>
  )
}

export function AmountFields({
  cat,
  amount,
  unitIdx,
  spend,
  onAmount,
  onUnit,
  onSpend,
  error,
}: {
  cat: Category
  amount: number
  unitIdx: number
  spend: number
  onAmount: (n: number) => void
  onUnit: (i: number) => void
  onSpend: (n: number) => void
  error?: string
}) {
  const { t, catUnits, catUnitsRaw, unitLabel } = useI18n()
  const units = catUnits(cat)
  const rawUnits = catUnitsRaw(cat)
  const idx = Math.min(unitIdx, rawUnits.length - 1)
  const unit = unitLabel(rawUnits[idx])
  const isMoney = rawUnits[idx] === '@chf'

  return (
    <>
      <Field label={t('new.amount')} error={error}>
        <Stepper
          value={amount}
          onChange={onAmount}
          step={unitStep(rawUnits[idx])}
          label={t('new.amount')}
          suffix={t('new.unitLine', { unit })}
        />
      </Field>
      {units.length > 1 && (
        <Field label={t('new.unit')} htmlFor="unit">
          <div className="select-wrap">
            <select
              id="unit"
              className="select"
              value={idx}
              onChange={(e) => {
                onUnit(Number(e.target.value))
              }}
            >
              {units.map((u, i) => (
                <option key={i} value={i}>
                  {u}
                </option>
              ))}
            </select>
            <IconChevronDown size={20} />
          </div>
        </Field>
      )}
      {hasSpend(cat) && !isMoney && (
        <Field label={t('new.spend')} optional>
          <Stepper value={spend} onChange={onSpend} step={5} label={t('new.spend')} suffix={t('common.chf')} />
        </Field>
      )}
    </>
  )
}

export function WizardFeeling() {
  const { t } = useI18n()
  const { data, addEntry } = useStore()
  const { draft, patch, reset } = useDraft()
  const navigate = useNavigate()
  const toast = useToast()
  const saved = useRef(false)

  if (saved.current) return null
  if (!draft.categoryId || !data.categories.some((c) => c.id === draft.categoryId)) {
    return <Navigate to="/neu/kategorie" replace />
  }
  if (isAlcohol(data.categories.find((c) => c.id === draft.categoryId)) && standardDrinks(draft.drinks) <= 0) {
    return <Navigate to="/neu/details" replace />
  }

  const save = (another: boolean) => {
    saved.current = true
    const cat = data.categories.find((c) => c.id === draft.categoryId)!
    const spendNum = hasSpend(cat) ? draft.spend : 0
    const alcohol = isAlcohol(cat)
    const entry = addEntry({
      categoryId: draft.categoryId!,
      at: alcohol ? atForDayPart(draft.date, draft.dayPart) : combine(draft.date, draft.time),
      amount: alcohol ? standardDrinks(draft.drinks) : draft.amount,
      unitIdx: alcohol ? 0 : draft.unitIdx,
      spend: spendNum > 0 ? spendNum : undefined,
      ...(alcohol ? { dayPart: draft.dayPart, drinks: draft.drinks } : {}),
      context: draft.context.trim(),
      craving: draft.craving,
      tension: draft.tension,
      mood: draft.mood,
      pain: draft.pain,
      notes: draft.notes.trim(),
    })
    toast(t('entry.saved'))
    if (another) {
      reset(true)
      navigate('/neu/kategorie', { replace: true })
    } else {
      reset()
      navigate('/tagebuch', { replace: true, state: { expandDay: toDateStr(new Date(entry.at)) } })
    }
  }

  return (
    <div className="screen">
      <TopBar title={t('new.title')} left="back" onLeft={() => navigate('/neu/details', { replace: true })} />
      <div className="content">
        <StepLabel n={3} />
        {FEELINGS.map((f) => (
          <ScoreSlider
            key={f}
            label={t(`feel.${f}` as Key)}
            hint={t(`feel.hint.${f}` as Key)}
            value={draft[f]}
            onChange={(n) => patch({ [f]: n })}
          />
        ))}
        <Field label={t('new.notes')} htmlFor="notes" optional>
          <textarea
            id="notes"
            className="input textarea"
            rows={3}
            value={draft.notes}
            onChange={(e) => patch({ notes: e.target.value })}
            placeholder={t('new.notesPh')}
            maxLength={500}
          />
        </Field>
      </div>
      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={() => save(false)}>
          {t('new.save')}
        </button>
        <button type="button" className="btn btn--link" onClick={() => save(true)}>
          <IconPlus size={18} /> {t('new.saveAnother')}
        </button>
      </div>
    </div>
  )
}

export function EntryEdit() {
  const { id } = useParams()
  const { t, catName } = useI18n()
  const { data, updateEntry, deleteEntry } = useStore()
  const navigate = useNavigate()
  const toast = useToast()
  const goBack = useGoBack(`/tagebuch/eintrag/${id}`)
  const categories = useSortedCategories()
  const entry = data.entries.find((e) => e.id === id)

  const [form, setForm] = useState(() => {
    const initialDrinks: Drink[] = entry?.drinks ?? (isAlcohol(data.categories.find((c) => c.id === entry?.categoryId)) && entry ? legacyDrinks(entry.amount) : [])
    return entry
      ? {
          categoryId: entry.categoryId,
          date: toDateStr(new Date(entry.at)),
          time: toTimeStr(new Date(entry.at)),
          dayPart: (entry.dayPart ?? dayPartOf(new Date(entry.at))) as DayPart,
          drinkTypes: [...new Set(initialDrinks.map((d) => d.type))],
          drinks: initialDrinks,
          amount: entry.amount,
          unitIdx: entry.unitIdx,
          spend: entry.spend ?? 0,
          context: entry.context,
          craving: entry.craving,
          tension: entry.tension,
          mood: entry.mood,
          pain: entry.pain,
          notes: entry.notes,
        }
      : null
  })
  const [tried, setTried] = useState(false)
  const [confirm, setConfirm] = useState(false)

  if (!entry || !form) return <Navigate to="/tagebuch" replace />
  const cat = data.categories.find((c) => c.id === form.categoryId)
  if (!cat) return <Navigate to="/tagebuch" replace />

  const patch = (p: Partial<typeof form>) => setForm((f) => (f ? { ...f, ...p } : f))
  const alcohol = isAlcohol(cat)
  const futureErr = alcohol ? dayPartError(form.date, form.dayPart) : new Date(combine(form.date, form.time)) > new Date()
  const amountErr = alcohol ? standardDrinks(form.drinks) <= 0 : form.amount <= 0
  const valid = !futureErr && !amountErr && !!form.date && (alcohol || !!form.time)

  const save = () => {
    setTried(true)
    if (!valid) return
    const keepAt = toDateStr(new Date(entry.at)) === form.date && (entry.dayPart ?? dayPartOf(new Date(entry.at))) === form.dayPart
    updateEntry({
      ...entry,
      categoryId: form.categoryId,
      at: alcohol ? (keepAt ? entry.at : atForDayPart(form.date, form.dayPart)) : combine(form.date, form.time),
      amount: alcohol ? standardDrinks(form.drinks) : form.amount,
      unitIdx: alcohol ? 0 : form.unitIdx,
      dayPart: alcohol ? form.dayPart : undefined,
      drinks: alcohol ? form.drinks : undefined,
      spend: hasSpend(cat) && form.spend > 0 ? form.spend : undefined,
      context: form.context.trim(),
      craving: form.craving,
      tension: form.tension,
      mood: form.mood,
      pain: form.pain,
      notes: form.notes.trim(),
    })
    toast(t('entry.updated'))
    navigate(`/tagebuch/eintrag/${entry.id}`, { replace: true })
  }

  return (
    <div className="screen">
      <TopBar title={t('entry.edit')} left="close" onLeft={goBack} />
      <div className="content">
        {alcohol && (
          <WhenFields
            date={form.date}
            dayPart={form.dayPart}
            onDate={(date) => patch({ date })}
            onDayPart={(dayPart) => patch({ dayPart })}
            showError={tried}
          />
        )}
        <Field label={t('entry.category')} htmlFor="cat">
          <div className="select-wrap">
            <select
              id="cat"
              className="select"
              value={form.categoryId}
              onChange={(e) => patch({ categoryId: e.target.value, unitIdx: 0 })}
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {catName(c)}
                </option>
              ))}
            </select>
            <IconChevronDown size={20} />
          </div>
        </Field>

        {alcohol ? (
          <DrinkFields
            types={form.drinkTypes}
            drinks={form.drinks}
            onChange={(p) => patch(p)}
            error={tried && amountErr ? t('new.drinksError') : undefined}
          />
        ) : (
          <>
        <fieldset className="fieldset">
          <legend className="field__label">{t('new.dateTime')}</legend>
          <div className="row2">
            <input type="date" className="input" value={form.date} max={toDateStr(new Date())} onChange={(e) => patch({ date: e.target.value })} aria-label={t('new.date')} />
            <input type="time" className="input" value={form.time} onChange={(e) => patch({ time: e.target.value })} aria-label={t('new.time')} />
          </div>
          {futureErr && (
            <p className="field__error" role="alert">
              {t('new.futureError')}
            </p>
          )}
        </fieldset>

        <AmountFields
          cat={cat}
          amount={form.amount}
          unitIdx={form.unitIdx}
          spend={form.spend}
          onAmount={(n) => patch({ amount: n })}
          onUnit={(i) => patch({ unitIdx: i })}
          onSpend={(n) => patch({ spend: n })}
          error={tried && amountErr ? t('new.amountError') : undefined}
        />
          </>
        )}

        <h2 className="eyebrow">{t('feel.title')}</h2>
        {FEELINGS.map((f) => (
          <ScoreSlider
            key={f}
            label={t(`feel.${f}` as Key)}
            hint={t(`feel.hint.${f}` as Key)}
            value={form[f]}
            onChange={(n) => patch({ [f]: n })}
          />
        ))}

        <Field label={t('new.context')} htmlFor="ctx" optional>
          <input id="ctx" className="input" value={form.context} onChange={(e) => patch({ context: e.target.value })} maxLength={120} />
        </Field>
        <Field label={t('new.notes')} htmlFor="notes" optional>
          <textarea id="notes" className="input textarea" rows={3} value={form.notes} onChange={(e) => patch({ notes: e.target.value })} maxLength={500} />
        </Field>
      </div>
      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={save}>
          {t('entry.saveChanges')}
        </button>
        <button type="button" className="btn btn--link btn--link-danger" onClick={() => setConfirm(true)}>
          {t('entry.delete')}
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        title={t('entry.deleteTitle')}
        text={t('entry.deleteText')}
        confirmLabel={t('confirm.yes')}
        onConfirm={() => {
          deleteEntry(entry.id)
          setConfirm(false)
          toast(t('entry.deleted'))
          navigate('/tagebuch', { replace: true })
        }}
        onClose={() => setConfirm(false)}
      />
    </div>
  )
}
