import { useState } from 'react'
import { Link, Navigate, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { CategoryIcon } from '../components/CategoryIcon'
import { IconPencil, IconPlus, IconTrash } from '../components/Icons'
import { Badge, ConfirmDialog, Field, TopBar, useGoBack, useToast } from '../components/ui'
import { CATALOG, catalogItem, hasSpend } from '../lib/catalog'
import type { Key } from '../lib/de'
import { useDraft } from '../lib/draft'
import { useI18n } from '../lib/i18n'
import { useStore } from '../lib/store'
import type { Category } from '../lib/types'

export function CategoriesManage() {
  const { t, lang, catName, catUnits } = useI18n()
  const { data, deleteCategory } = useStore()
  const toast = useToast()
  const [toDelete, setToDelete] = useState<Category | null>(null)
  const goBack = useGoBack('/mehr')
  const sorted = [...data.categories].sort((a, b) => catName(a).localeCompare(catName(b), lang))

  return (
    <div className="screen">
      <TopBar
        title={t('cat.manage')}
        left="back"
        onLeft={goBack}
        right={
          <Link to="/mehr/kategorien/hinzufuegen" className="icon-btn" aria-label={t('cat.add')}>
            <IconPlus />
          </Link>
        }
      />
      <div className="content content--flush">
        {sorted.length === 0 && <p className="content__pad muted">{t('cat.empty')}</p>}
        <ul className="catlist">
          {sorted.map((c) => (
            <li key={c.id} className="catrow">
              <Badge category={c} />
              <span className="catrow__main">
                <span className="catrow__name">{catName(c)}</span>
                <span className="catrow__unit">{catUnits(c).join(' / ')}</span>
              </span>
              <Link to={`/mehr/kategorien/${c.id}`} className="icon-btn icon-btn--outlined" aria-label={t('cat.editAria', { name: catName(c) })}>
                <IconPencil size={20} />
              </Link>
              <button
                type="button"
                className="icon-btn icon-btn--outlined icon-btn--danger"
                aria-label={t('cat.deleteAria', { name: catName(c) })}
                onClick={() => setToDelete(c)}
              >
                <IconTrash size={20} />
              </button>
            </li>
          ))}
        </ul>
        <Link to="/mehr/kategorien/hinzufuegen" className="addrow">
          <IconPlus size={20} /> {t('cat.add')}
        </Link>
      </div>
      <ConfirmDialog
        open={!!toDelete}
        title={t('cat.deleteTitle', { name: toDelete ? catName(toDelete) : '' })}
        text={t('cat.deleteText', {
          entries: data.entries.filter((e) => e.categoryId === toDelete?.id).length,
          goals: data.goals.filter((g) => g.categoryId === toDelete?.id).length,
        })}
        confirmLabel={t('confirm.yes')}
        onConfirm={() => {
          if (toDelete) deleteCategory(toDelete.id)
          setToDelete(null)
          toast(t('cat.deleted'))
        }}
        onClose={() => setToDelete(null)}
      />
    </div>
  )
}

export function CategoryCatalog() {
  const { t } = useI18n()
  const { data } = useStore()
  const navigate = useNavigate()
  const location = useLocation()
  const goBack = useGoBack('/mehr/kategorien')
  const have = new Set(data.categories.map((c) => c.key).filter(Boolean))
  const available = CATALOG.filter((c) => !have.has(c.key))

  const go = (search: string) =>
    navigate(`/mehr/kategorien/neu${search}`, { replace: true, state: location.state })

  return (
    <div className="screen">
      <TopBar title={t('cat.add')} left="back" onLeft={goBack} />
      <div className="content">
        <p className="eyebrow eyebrow--first">{t('cat.choose')}</p>
        {available.length === 0 && <p className="muted">{t('cat.allAdded')}</p>}
        <ul className="tiles">
          {available.map((item) => (
            <li key={item.key}>
              <button type="button" className="tile" onClick={() => go(`?vorlage=${item.key}`)}>
                <span className="badge badge--lg badge--icon" aria-hidden="true">
                  <CategoryIcon name={item.key} size={44} />
                </span>
                <span className="tile__name">{t(`cat.${item.key}` as Key)}</span>
              </button>
            </li>
          ))}
          <li>
            <button type="button" className="tile tile--add" onClick={() => go('')}>
              <span className="badge badge--lg badge--icon" aria-hidden="true">
                <CategoryIcon name="other" size={44} />
              </span>
              <span className="tile__name">{t('cat.other')}</span>
              <span className="tile__hint">{t('cat.otherHint')}</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  )
}

const parseUnits = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

const sameList = (a: string[], b: string[]) => a.length === b.length && a.every((x, i) => x === b[i])

export function CategoryForm() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const location = useLocation()
  const navigate = useNavigate()
  const goBack = useGoBack('/mehr/kategorien')
  const toast = useToast()
  const { t, catName, catUnits } = useI18n()
  const { data, addCategory, updateCategory, deleteCategory } = useStore()
  const { patch } = useDraft()

  const existing = id ? data.categories.find((c) => c.id === id) : undefined
  const templateKey = params.get('vorlage') ?? undefined
  const template = catalogItem(templateKey)
  const fromWizard = (location.state as { fromWizard?: boolean } | null)?.fromWizard

  const base: Category | undefined = existing ?? (template ? { id: '', key: template.key } : undefined)
  const [name, setName] = useState(base ? catName(base) : '')
  const [unitText, setUnitText] = useState(base ? catUnits(base).join(', ') : '')
  const [spend, setSpend] = useState(base ? hasSpend(base) : false)
  const [tried, setTried] = useState(false)
  const [confirm, setConfirm] = useState(false)

  if (id && !existing) return <Navigate to="/mehr/kategorien" replace />

  const trimmed = name.trim()
  const units = parseUnits(unitText)
  const taken = data.categories.some((c) => c.id !== existing?.id && catName(c).toLowerCase() === trimmed.toLowerCase())
  const nameErr = !trimmed ? t('cat.nameRequired') : taken ? t('cat.nameExists') : undefined
  const unitErr = units.length === 0 ? t('cat.unitRequired') : undefined

  const save = () => {
    setTried(true)
    if (nameErr || unitErr) return
    const key = existing?.key ?? template?.key
    const defaultName = key ? catName({ id: '', key }) : undefined
    const defaultUnits = key ? catUnits({ id: '', key }) : undefined
    const payload: Omit<Category, 'id'> = {
      key,
      name: key && trimmed === defaultName ? undefined : trimmed,
      units: defaultUnits && sameList(units, defaultUnits) ? undefined : units,
      spend,
    }
    if (existing) {
      updateCategory({ ...payload, id: existing.id })
      toast(t('cat.saved'))
      goBack()
    } else {
      const created = addCategory(payload)
      toast(t('cat.saved'))
      if (fromWizard) {
        patch({ categoryId: created.id, unitIdx: 0, amount: 1 })
        navigate('/neu/details', { replace: true })
      } else {
        goBack()
      }
    }
  }

  const affected = existing
    ? {
        entries: data.entries.filter((e) => e.categoryId === existing.id).length,
        goals: data.goals.filter((g) => g.categoryId === existing.id).length,
      }
    : { entries: 0, goals: 0 }

  return (
    <div className="screen">
      <TopBar title={existing ? t('cat.edit') : t('cat.new')} left="back" onLeft={goBack} />
      <div className="content">
        <Field label={t('cat.name')} htmlFor="cat-name" error={tried ? nameErr : undefined}>
          <input
            id="cat-name"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={40}
            autoFocus={!existing && !template}
            aria-invalid={tried && !!nameErr}
            aria-describedby={tried && nameErr ? 'cat-name-err' : undefined}
          />
        </Field>
        <Field
          label={t('cat.unit')}
          htmlFor="cat-unit"
          error={tried ? unitErr : undefined}
          hint={`${t('cat.unitHint')} ${t('cat.unitMulti')}`}
        >
          <input
            id="cat-unit"
            className="input"
            value={unitText}
            onChange={(e) => setUnitText(e.target.value)}
            maxLength={60}
            aria-invalid={tried && !!unitErr}
            aria-describedby={`cat-unit-hint${tried && unitErr ? ' cat-unit-err' : ''}`}
          />
        </Field>
        <label className="check">
          <input type="checkbox" checked={spend} onChange={(e) => setSpend(e.target.checked)} />
          <span>{t('cat.spend')}</span>
        </label>
      </div>
      <div className="actions">
        <button type="button" className="btn btn--primary" onClick={save}>
          {t('common.save')}
        </button>
        {existing && (
          <button type="button" className="btn btn--link btn--link-danger" onClick={() => setConfirm(true)}>
            {t('cat.delete')}
          </button>
        )}
      </div>
      {existing && (
        <ConfirmDialog
          open={confirm}
          title={t('cat.deleteTitle', { name: catName(existing) })}
          text={t('cat.deleteText', affected)}
          confirmLabel={t('confirm.yes')}
          onConfirm={() => {
            deleteCategory(existing.id)
            setConfirm(false)
            toast(t('cat.deleted'))
            navigate('/mehr/kategorien', { replace: true })
          }}
          onClose={() => setConfirm(false)}
        />
      )}
    </div>
  )
}
