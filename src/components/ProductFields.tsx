import { useId } from 'react'
import { type ProductSet, productCount, productType, typesOf, setProductCount, sortProducts, productTotal } from '../lib/catalog'
import { DAYPART_ORDER, dayPartInFuture, fmtNumber, toDateStr } from '../lib/dates'
import type { Key } from '../lib/de'
import { useI18n } from '../lib/i18n'
import type { DayPart, Product } from '../lib/types'
import { IconMinus, IconPlus } from './Icons'

/** Label einer Einheit, z. B. «Grosses Bier (5 dl)». */
export function useProductLabels() {
  const { t } = useI18n()
  return {
    type: (type: string) => t(`product.type.${type}` as Key),
    unit: (type: string, unit: string) => t(`product.unit.${type}.${unit}` as Key),
  }
}

/** Datum und Tageszeit (Einzelauswahl), steht zuoberst im Formular. */
export function WhenFields({
  date,
  dayPart,
  onDate,
  onDayPart,
  showError,
}: {
  date: string
  dayPart: DayPart
  onDate: (d: string) => void
  onDayPart: (p: DayPart) => void
  showError?: boolean
}) {
  const { t, lang } = useI18n()
  const name = useId()
  const futureErr = !!date && dayPartInFuture(date, dayPart)

  return (
    <>
      <div className="field">
        <label className="field__label" htmlFor="alc-date">
          {t('new.date')}
        </label>
        <input
          id="alc-date"
          type="date"
          className="input"
          value={date}
          max={toDateStr(new Date())}
          onChange={(e) => onDate(e.target.value)}
          aria-invalid={showError && !date}
          lang={lang}
        />
      </div>

      <fieldset className="fieldset">
        <legend className="field__label">{t('new.dayPart')}</legend>
        <div className="choices choices--daypart">
          {DAYPART_ORDER.map((p) => (
            <label key={p} className="choice">
              <input type="radio" name={name} value={p} checked={dayPart === p} onChange={() => onDayPart(p)} />
              <span className="choice__box">
                <span className="choice__name">{t(`daypart.${p}` as Key)}</span>
                <span className="choice__hint">{t(`daypart.hint.${p}` as Key)}</span>
              </span>
            </label>
          ))}
        </div>
        {futureErr && (
          <p className="field__error" role="alert">
            {t('new.futurePart')}
          </p>
        )}
      </fieldset>
    </>
  )
}

export const dayPartError = (date: string, part: DayPart) => !!date && dayPartInFuture(date, part)

function QtyStepper({ value, onChange, label }: { value: number; onChange: (n: number) => void; label: string }) {
  const { t } = useI18n()
  return (
    <div className="qty">
      <button
        type="button"
        className="qty__btn"
        onClick={() => onChange(value - 1)}
        disabled={value <= 0}
        aria-label={`${t('common.less')}: ${label}`}
      >
        <IconMinus size={20} />
      </button>
      <output className="qty__value" aria-label={label}>
        {value}
      </output>
      <button
        type="button"
        className="qty__btn"
        onClick={() => onChange(value + 1)}
        disabled={value >= 99}
        aria-label={`${t('common.more')}: ${label}`}
      >
        <IconPlus size={20} />
      </button>
    </div>
  )
}

/**
 * Alkohol und Nikotin: mehrere Produkte wählen, pro Produkt Mengen je Einheit erfassen.
 * So lassen sich z. B. am Abend 2 grosse Biere und 2 Gläser Wein in einem Eintrag festhalten.
 */
export function ProductFields({
  set,
  types,
  products,
  onChange,
  error,
}: {
  set: ProductSet
  types: string[]
  products: Product[]
  onChange: (p: { productTypes: string[]; products: Product[] }) => void
  error?: string
}) {
  const { t, lang } = useI18n()
  const label = useProductLabels()
  const total = productTotal(products)

  const toggleType = (type: string) => {
    if (types.includes(type)) {
      onChange({ productTypes: types.filter((x) => x !== type), products: products.filter((d) => d.type !== type) })
    } else {
      onChange({ productTypes: [...types, type], products })
    }
  }

  const all = typesOf(set)
  const selected = all.filter((x) => types.includes(x.key))

  return (
    <>
      <fieldset className="fieldset">
        <legend className="field__label">{t(`new.products.${set}` as Key)}</legend>
        <p className="field__hint field__hint--top">{t('new.productsHint')}</p>
        <div className={`choices choices--types${all.length === 3 ? ' choices--three' : ''}`}>
          {all.map((x) => (
            <label key={x.key} className="choice">
              <input type="checkbox" checked={types.includes(x.key)} onChange={() => toggleType(x.key)} />
              <span className="choice__box">
                <span className="choice__name">{label.type(x.key)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      {selected.map((x) => (
        <section key={x.key} className="productcard" aria-label={label.type(x.key)}>
          <h3 className="productcard__title">{label.type(x.key)}</h3>
          <ul className="productrows">
            {x.units.map((u) => {
              const n = productCount(products, x.key, u.key)
              const text = label.unit(x.key, u.key)
              return (
                <li key={u.key} className={`productrow${n > 0 ? ' is-set' : ''}`}>
                  <span className="productrow__label">{text}</span>
                  <QtyStepper
                    value={n}
                    label={`${label.type(x.key)}, ${text}`}
                    onChange={(c) => onChange({ productTypes: types, products: setProductCount(products, x.key, u.key, c) })}
                  />
                </li>
              )
            })}
          </ul>
        </section>
      ))}

      {selected.length > 0 && (
        <div className="producttotal" aria-live="polite">
          <strong>{t(`new.total.${set}.${total === 1 ? 'one' : 'other'}` as Key, { n: fmtNumber(total, lang) })}</strong>
          <span>{t(`new.note.${set}` as Key)}</span>
        </div>
      )}
      {error && (
        <p className="field__error field__error--block" role="alert">
          {error}
        </p>
      )}
    </>
  )
}

/** Kurzform für Listen, z. B. «Bier, Wein». */
export function productTypesSummary(products: Product[], typeLabel: (t: string) => string): string {
  const keys = [...new Set(sortProducts(products).map((d) => d.type))].filter((k) => productType(k))
  return keys.map(typeLabel).join(', ')
}
