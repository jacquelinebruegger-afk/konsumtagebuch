import { Field, ChipGroup, Stepper } from './ui'
import { ALCOHOL_TYPES, alcoholType, sgText, standardDrinks, servingParts, type AlcoholDraft } from '../lib/alcohol'
import type { Key } from '../lib/de'
import { fmtNumber } from '../lib/dates'
import { useI18n } from '../lib/i18n'

export function AlcoholFields({
  value,
  onChange,
  error,
}: {
  value: AlcoholDraft
  onChange: (v: AlcoholDraft) => void
  error?: string
}) {
  const { t, lang } = useI18n()
  const fmt = (n: number) => fmtNumber(n, lang)
  const type = alcoholType(value.type)
  const isOther = value.type === 'other'
  const hasServing = !!type?.servings.some((s) => s.key === value.serving)
  const total = standardDrinks(value)
  const serving = servingParts(t, fmt, value.type ?? '', value.serving)

  return (
    <>
      <ChipGroup
        legend={t('alc.type')}
        value={value.type}
        onChange={(v) => onChange({ type: v as AlcoholDraft['type'], serving: undefined, count: value.count })}
        options={ALCOHOL_TYPES.map((x) => ({ value: x.key, label: t(`alc.type.${x.key}` as Key) }))}
        error={error && !value.type ? error : undefined}
      />

      {type && !isOther && (
        <ChipGroup
          legend={t('alc.serving')}
          value={value.serving}
          onChange={(v) => onChange({ ...value, serving: v })}
          options={type.servings.map((s) => {
            const parts = servingParts(t, fmt, type.key, s.key)!
            return { value: s.key, label: parts.label, sub: parts.volume }
          })}
          error={error && value.type && !hasServing ? error : undefined}
        />
      )}

      {isOther && (
        <Field label={t('alc.countOther')}>
          <Stepper value={value.count} onChange={(count) => onChange({ ...value, count })} step={1} min={0} max={99} label={t('alc.countOther')} />
        </Field>
      )}

      {type && !isOther && hasServing && (
        <Field label={t('alc.count')}>
          <Stepper
            value={value.count}
            onChange={(count) => onChange({ ...value, count })}
            step={1}
            min={1}
            max={99}
            label={t('alc.count')}
            suffix={serving ? `× ${serving.label} ${serving.volume}` : undefined}
          />
        </Field>
      )}

      {total > 0 && (
        <p className="alctotal" aria-live="polite">
          {t('alc.total', { n: sgText(t, total, fmt) })}
        </p>
      )}

      <details className="alcinfo">
        <summary>{t('alc.what')}</summary>
        <p>{t('alc.whatText')}</p>
      </details>
    </>
  )
}
