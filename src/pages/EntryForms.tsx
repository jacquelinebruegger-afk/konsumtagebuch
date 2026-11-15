import { useRef, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { IconChevronDown, IconPlus } from '../components/Icons'
import { CategoryPicker, useSortedCategories } from '../components/CategoryPicker'
import { ProductFields, WhenFields, dayPartError } from '../components/ProductFields'
import { Badge, ConfirmDialog, Field, Modal, ScoreSlider, Sheet, Stepper, TopBar, useGoBack, useToast } from '../components/ui'
import { hasSpend, legacyProducts, productSet, productTotal, unitStep } from '../lib/catalog'
import { atForDayPart, dayPart as dayPartOf, toDateStr } from '../lib/dates'
import type { Key } from '../lib/de'
import { useDraft } from '../lib/draft'
import { useI18n } from '../lib/i18n'
import { useStore } from '../lib/store'
import type { Category, DayPart, Product } from '../lib/types'

const FEELINGS = ['craving', 'tension', 'mood', 'pain'] as const

function StepLabel({ n }: { n: 1 | 2 | 3 }) {
  const { t } = useI18n()
  const name = t(`new.step.${(['category', 'details', 'feeling'] as const)[n - 1]}` as Key)
  return <p className="eyebrow eyebrow--first">{t('new.step', { n, name })}</p>
}

export function WizardCategory() {
  const { t, catUnitsRaw } = useI18n()
  const { draft, patch, reset } = useDraft()
  const navigate = useNavigate()
  const goBack = useGoBack('/tagebuch')

  const choose = (c: Category) => {
    patch({
      categoryId: c.id,
      unitIdx: 0,
      amount: unitStep(catUnitsRaw(c)[0]),
      ...(draft.categoryId === c.id ? {} : { productTypes: [], products: [] }),
    })
    navigate('/neu/details', { replace: true })
  }

  return (
    <div className="screen">
      <TopBar
        title={t('new.title')}
        left="back"
        onLeft={() => {
          reset()
          goBack()
        }}
      />
      <div className="content">
        <StepLabel n={1} />
        <CategoryPicker selectedId={draft.categoryId} onChoose={choose} addCategoryState={{ fromWizard: true }} />
      </div>
    </div>
  )
}

export function WizardDetails() {
  const { t, catName } = useI18n()
  const { data } = useStore()
  const { draft, patch } = useDraft()
  const navigate = useNavigate()
  const cat = data.categories.find((c) => c.id === draft.categoryId)
  const [tried, setTried] = useState(false)

  if (!cat) return <Navigate to="/neu/kategorie" replace />

  const set = productSet(cat)
  const futureErr = dayPartError(draft.date, draft.dayPart)
  const amountErr = set ? productTotal(draft.products) <= 0 : draft.amount <= 0
  const valid = !!draft.date && !futureErr && !amountErr

  return (
    <div className="screen">
      <TopBar title={t('new.title')} left="back" onLeft={() => navigate('/neu/kategorie', { replace: true })} />
      <div className="content">
        <StepLabel n={2} />
        <WhenFields
          date={draft.date}
          dayPart={draft.dayPart}
          onDate={(date) => patch({ date })}
          onDayPart={(dayPart) => patch({ dayPart })}
          showError={tried}
        />
        <div className="chosen">
          <Badge category={cat} />
          <span className="chosen__name">{catName(cat)}</span>
          <Link to="/neu/kategorie" replace className="chosen__change">
            {t('common.change')}
            <span className="sr-only">: {t('new.changeCategory')}</span>
          </Link>
        </div>

        {set ? (
          <ProductFields
            set={set}
            types={draft.productTypes}
            products={draft.products}
            onChange={(p) => patch(p)}
            error={tried && amountErr ? t('new.productsError') : undefined}
          />
        ) : (
          <>
            <AmountFields
              cat={cat}
              amount={draft.amount}
              unitIdx={draft.unitIdx}
              spend={draft.spend}
              onAmount={(n) => patch({ amount: n })}
              onUnit={(i, a) => patch({ unitIdx: i, amount: a })}
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
  /** Neue Einheit und passender Startwert des Zählers (z. B. 1 für Line, 10 für Milligramm). */
  onUnit: (i: number, startAmount: number) => void
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
      {units.length > 1 && (
        <Field label={t('new.unit')} htmlFor="unit">
          <div className="select-wrap">
            <select
              id="unit"
              className="select"
              value={idx}
              onChange={(e) => {
                const i = Number(e.target.value)
                onUnit(i, unitStep(rawUnits[i]))
              }}
            >
              {units.map((u, i) => (
                <option key={i} value={i}>
                  {rawUnits[i] === '@bump' ? `${u} (${t('unit.bump.hint')})` : u}
                </option>
              ))}
            </select>
            <IconChevronDown size={20} />
          </div>
        </Field>
      )}
      <Field label={t('new.amount')} error={error}>
        <Stepper
          value={amount}
          onChange={onAmount}
          step={unitStep(rawUnits[idx])}
          label={t('new.amount')}
          suffix={t('new.unitLine', { unit })}
        />
      </Field>
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
  if (productSet(data.categories.find((c) => c.id === draft.categoryId)) && productTotal(draft.products) <= 0) {
    return <Navigate to="/neu/details" replace />
  }

  const save = (another: boolean) => {
    saved.current = true
    const cat = data.categories.find((c) => c.id === draft.categoryId)!
    const spendNum = hasSpend(cat) ? draft.spend : 0
    const set = productSet(cat)
    const entry = addEntry({
      categoryId: draft.categoryId!,
      at: atForDayPart(draft.date, draft.dayPart),
      amount: set ? productTotal(draft.products) : draft.amount,
      unitIdx: set ? 0 : draft.unitIdx,
      spend: spendNum > 0 ? spendNum : undefined,
      dayPart: draft.dayPart,
      ...(set ? { products: draft.products } : {}),
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
      navigate('/tagebuch', {
        replace: true,
        state: { expandDay: toDateStr(new Date(entry.at)) },
      })
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
  const goBack = useGoBack('/tagebuch')
  const categories = useSortedCategories()
  const entry = data.entries.find((e) => e.id === id)

  const [form, setForm] = useState(() => {
    const entrySet = productSet(data.categories.find((c) => c.id === entry?.categoryId))
    const initialProducts: Product[] = entry?.products ?? (entrySet && entry ? legacyProducts(entrySet, entry.amount) : [])
    return entry
      ? {
          categoryId: entry.categoryId,
          date: toDateStr(new Date(entry.at)),
          dayPart: (entry.dayPart ?? dayPartOf(new Date(entry.at))) as DayPart,
          productTypes: [...new Set(initialProducts.map((d) => d.type))],
          products: initialProducts,
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
  const initialJson = useRef(JSON.stringify(form))
  const [tried, setTried] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [leaveAsk, setLeaveAsk] = useState(false)

  if (!entry || !form) return <Navigate to="/tagebuch" replace />
  const cat = data.categories.find((c) => c.id === form.categoryId)
  if (!cat) return <Navigate to="/tagebuch" replace />

  const patch = (p: Partial<typeof form>) => setForm((f) => (f ? { ...f, ...p } : f))
  const set = productSet(cat)
  const futureErr = dayPartError(form.date, form.dayPart)
  const amountErr = set ? productTotal(form.products) <= 0 : form.amount <= 0
  const valid = !futureErr && !amountErr && !!form.date

  const dirty = JSON.stringify(form) !== initialJson.current

  /** Speichert und schliesst das Overlay. Gibt false zurück, wenn Eingaben noch fehlen. */
  const save = (): boolean => {
    setTried(true)
    if (!valid) return false
    const keepAt = toDateStr(new Date(entry.at)) === form.date && (entry.dayPart ?? dayPartOf(new Date(entry.at))) === form.dayPart
    updateEntry({
      ...entry,
      categoryId: form.categoryId,
      at: keepAt ? entry.at : atForDayPart(form.date, form.dayPart),
      amount: set ? productTotal(form.products) : form.amount,
      unitIdx: set ? 0 : form.unitIdx,
      dayPart: form.dayPart,
      products: set ? form.products : undefined,
      spend: hasSpend(cat) && form.spend > 0 ? form.spend : undefined,
      context: form.context.trim(),
      craving: form.craving,
      tension: form.tension,
      mood: form.mood,
      pain: form.pain,
      notes: form.notes.trim(),
    })
    toast(t('entry.updated'))
    goBack()
    return true
  }

  /** Schliessen: bei ungespeicherten Änderungen zuerst nachfragen. */
  const requestClose = () => (dirty ? setLeaveAsk(true) : goBack())

  return (
    <Sheet
      title={t('entry.edit')}
      onClose={requestClose}
      actions={
        <>
          <button type="button" className="btn btn--primary" onClick={save}>
            {t('entry.saveChanges')}
          </button>
          <button type="button" className="btn btn--link btn--link-danger" onClick={() => setConfirm(true)}>
            {t('entry.delete')}
          </button>
        </>
      }
    >
      <div className="content">
        <WhenFields
          date={form.date}
          dayPart={form.dayPart}
          onDate={(date) => patch({ date })}
          onDayPart={(dayPart) => patch({ dayPart })}
          showError={tried}
        />
        <Field label={t('entry.category')} htmlFor="cat">
          <div className="select-wrap">
            <select id="cat" className="select" value={form.categoryId} onChange={(e) => patch({ categoryId: e.target.value, unitIdx: 0 })}>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {catName(c)}
                </option>
              ))}
            </select>
            <IconChevronDown size={20} />
          </div>
        </Field>

        {set ? (
          <ProductFields
            set={set}
            types={form.productTypes}
            products={form.products}
            onChange={(p) => patch(p)}
            error={tried && amountErr ? t('new.productsError') : undefined}
          />
        ) : (
          <>
            <AmountFields
              cat={cat}
              amount={form.amount}
              unitIdx={form.unitIdx}
              spend={form.spend}
              onAmount={(n) => patch({ amount: n })}
              onUnit={(i, a) => patch({ unitIdx: i, amount: a })}
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
          <textarea
            id="notes"
            className="input textarea"
            rows={3}
            value={form.notes}
            onChange={(e) => patch({ notes: e.target.value })}
            maxLength={500}
          />
        </Field>
      </div>
      <Modal
        open={leaveAsk}
        onClose={() => setLeaveAsk(false)}
        title={t('entry.unsavedTitle')}
        actions={
          <>
            <button
              type="button"
              className="btn btn--primary"
              onClick={() => {
                setLeaveAsk(false)
                save()
              }}
            >
              {t('entry.unsavedSave')}
            </button>
            <button type="button" className="btn btn--secondary" onClick={goBack}>
              {t('entry.unsavedDiscard')}
            </button>
          </>
        }
      >
        <p>{t('entry.unsavedText')}</p>
      </Modal>
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
    </Sheet>
  )
}
