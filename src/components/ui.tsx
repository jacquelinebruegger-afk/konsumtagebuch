import { createContext, useCallback, useContext, useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { categoryAbbr } from '../lib/store'
import { useI18n } from '../lib/i18n'
import type { Category } from '../lib/types'
import { CategoryIcon, hasCategoryIcon } from './CategoryIcon'
import { IconBack, IconClose, IconMinus, IconPlus } from './Icons'

const ICON_SIZE = { sm: 22, md: 32, lg: 44 }

export function Badge({ category, size = 'md' }: { category: Category; size?: 'sm' | 'md' | 'lg' }) {
  const icon = hasCategoryIcon(category.key)
  return (
    <span className={`badge badge--${size}${icon ? ' badge--icon' : ''}`} aria-hidden="true">
      {icon ? <CategoryIcon name={category.key!} size={ICON_SIZE[size]} /> : categoryAbbr(category)}
    </span>
  )
}

export function useGoBack(fallback: string) {
  const navigate = useNavigate()
  return useCallback(() => {
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0
    if (idx > 0) navigate(-1)
    else navigate(fallback, { replace: true })
  }, [navigate, fallback])
}

interface TopBarProps {
  title: string
  left?: 'back' | 'close'
  onLeft?: () => void
  leftLabel?: string
  right?: ReactNode
  leftMobileOnly?: boolean
}

export function TopBar({ title, left, onLeft, leftLabel, right, leftMobileOnly }: TopBarProps) {
  const { t } = useI18n()
  return (
    <header className="topbar">
      <div className="topbar__side">
        {left && (
          <button type="button" className={`labelbtn${leftMobileOnly ? ' only-mobile' : ''}`} onClick={onLeft}>
            {left === 'back' ? <IconBack /> : <IconClose />}
            <span>{leftLabel ?? (left === 'back' ? t('common.back') : t('common.close'))}</span>
          </button>
        )}
      </div>
      <h1 className="topbar__title">{title}</h1>
      <div className="topbar__side topbar__side--right">{right}</div>
    </header>
  )
}

export function Stepper({
  value,
  onChange,
  step = 1,
  min = 0,
  max = 100000,
  label,
  suffix,
  id,
  describedBy,
}: {
  value: number
  onChange: (n: number) => void
  step?: number
  min?: number
  max?: number
  label: string
  suffix?: string
  id?: string
  describedBy?: string
}) {
  const { t, lang } = useI18n()
  const fmt = (n: number) => String(n).replace('.', lang === 'fr' ? ',' : '.')
  const [text, setText] = useState(fmt(value))
  const parse = (s: string) => Number(s.replace(',', '.'))

  useEffect(() => {
    if (parse(text) !== value) setText(fmt(value))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n * 100) / 100))

  return (
    <div className="stepper">
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(clamp(value - step))}
        disabled={value <= min}
        aria-label={`${t('common.less')}: ${label}`}
      >
        <IconMinus />
      </button>
      <div className="stepper__center">
        <input
          id={id}
          className="stepper__input"
          type="text"
          inputMode="decimal"
          value={text}
          aria-label={label}
          aria-describedby={describedBy}
          onChange={(e) => {
            const v = e.target.value
            if (!/^\d*[.,]?\d{0,2}$/.test(v)) return
            setText(v)
            const n = parse(v)
            if (!Number.isNaN(n)) onChange(clamp(n))
          }}
          onBlur={() => setText(fmt(value))}
          onFocus={(e) => e.target.select()}
        />
        {suffix && <span className="stepper__suffix">{suffix}</span>}
      </div>
      <button
        type="button"
        className="stepper__btn"
        onClick={() => onChange(clamp(value + step))}
        disabled={value >= max}
        aria-label={`${t('common.more')}: ${label}`}
      >
        <IconPlus />
      </button>
    </div>
  )
}

export function Switch({
  checked,
  onChange,
  labelledBy,
  describedBy,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  labelledBy: string
  describedBy?: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      className="switch"
      onClick={() => onChange(!checked)}
    >
      <span className="switch__thumb" />
    </button>
  )
}

export function ScoreSlider({
  label,
  hint,
  value,
  onChange,
}: {
  label: string
  hint: string
  value: number
  onChange: (n: number) => void
}) {
  const { t } = useI18n()
  const id = useId()
  return (
    <div className="slider">
      <div className="slider__head">
        <label htmlFor={id} className="slider__label">
          {label}
        </label>
        <output htmlFor={id} className="slider__value">
          {value}/10
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={0}
        max={10}
        step={1}
        value={value}
        aria-valuetext={t('feel.value', { v: value })}
        aria-describedby={`${id}-hint`}
        style={{ ['--pct' as string]: `${value * 10}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <p id={`${id}-hint`} className="slider__hint">
        {hint}
      </p>
    </div>
  )
}

export function ScoreBar({ label, value }: { label: string; value: number }) {
  const { t } = useI18n()
  return (
    <div className="scorebar" role="img" aria-label={`${label}: ${t('feel.value', { v: value })}`}>
      <span className="scorebar__label">{label}</span>
      <span className="scorebar__track">
        <span className="scorebar__fill" style={{ width: `${value * 10}%` }} />
      </span>
      <span className="scorebar__value">{value}/10</span>
    </div>
  )
}

export function Modal({
  open,
  onClose,
  title,
  children,
  actions,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  actions?: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const titleId = useId()
  const { t } = useI18n()

  useEffect(() => {
    const d = ref.current
    if (!d) return
    if (open && !d.open) d.showModal()
    if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      className="modal"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
    >
      {open && (
        <div className="modal__body">
          <div className="modal__head">
            <h2 id={titleId} className="modal__title">
              {title}
            </h2>
            <button type="button" className="labelbtn" onClick={onClose}>
              <IconClose />
              <span>{t('common.close')}</span>
            </button>
          </div>
          <div className="modal__content">{children}</div>
          {actions && <div className="modal__actions">{actions}</div>}
        </div>
      )}
    </dialog>
  )
}

export function ConfirmDialog({
  open,
  title,
  text,
  confirmLabel,
  onConfirm,
  onClose,
  danger = true,
}: {
  open: boolean
  title: string
  text: string
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
  danger?: boolean
}) {
  const { t } = useI18n()
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      actions={
        <>
          <button type="button" className={`btn ${danger ? 'btn--danger' : 'btn--primary'}`} onClick={onConfirm}>
            {confirmLabel}
          </button>
          <button type="button" className="btn btn--secondary" onClick={onClose} autoFocus>
            {t('common.cancel')}
          </button>
        </>
      }
    >
      <p>{text}</p>
    </Modal>
  )
}

const ToastCtx = createContext<(msg: string) => void>(() => {})
export const useToast = () => useContext(ToastCtx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState<{ text: string; n: number } | null>(null)
  const show = useCallback((text: string) => setMsg((m) => ({ text, n: (m?.n ?? 0) + 1 })), [])

  useEffect(() => {
    if (!msg) return
    const id = window.setTimeout(() => setMsg(null), 4000)
    return () => window.clearTimeout(id)
  }, [msg])

  return (
    <ToastCtx.Provider value={show}>
      {children}
      <div className="toast-region" role="status" aria-live="polite">
        {msg && (
          <div className="toast" key={msg.n}>
            {msg.text}
          </div>
        )}
      </div>
    </ToastCtx.Provider>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  optional,
}: {
  label: string
  htmlFor?: string
  hint?: string
  error?: string
  children: ReactNode
  optional?: boolean
}) {
  const { t } = useI18n()
  return (
    <div className={`field${error ? ' field--error' : ''}`}>
      <label className="field__label" htmlFor={htmlFor}>
        {label}
        {optional && <span className="field__opt"> ({t('common.optional')})</span>}
      </label>
      {children}
      {hint && (
        <p className="field__hint" id={htmlFor ? `${htmlFor}-hint` : undefined}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={htmlFor ? `${htmlFor}-err` : undefined} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
