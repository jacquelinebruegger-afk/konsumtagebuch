import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconBell, IconChevronDown, IconChevronRight, IconExternal, IconInfo } from '../components/Icons'
import { ConfirmDialog, Field, Modal, Switch, TopBar, useGoBack, useToast } from '../components/ui'
import { fmtDayFull, toDateStr } from '../lib/dates'
import { useI18n } from '../lib/i18n'
import { hashPin } from '../lib/pin'
import { useStore } from '../lib/store'
import type { Lang } from '../lib/types'

const SAFEZONE = {
  consulting: 'https://www.safezone.ch/de/',
  privacy: 'https://www.safezone.ch/de/datenschutz',
  imprint: 'https://www.safezone.ch/de/impressum',
}

export function ExternalLink({ href, children }: { href: string; children: ReactNode }) {
  const { t } = useI18n()
  return (
    <a className="extlink" href={href} target="_blank" rel="noopener noreferrer">
      <IconExternal size={20} />
      <span>{children}</span>
      <span className="sr-only"> ({t('common.external')})</span>
    </a>
  )
}

function NavRow({ to, children }: { to: string; children: ReactNode }) {
  return (
    <li>
      <Link to={to} className="listrow">
        <span>{children}</span>
        <IconChevronRight size={20} className="listrow__chev" />
      </Link>
    </li>
  )
}

export function MorePage() {
  const { t, lang } = useI18n()
  const { data, updateSettings, loadDemo, clearAll } = useStore()
  const toast = useToast()
  const [pinMode, setPinMode] = useState<null | 'set' | 'off'>(null)
  const [confirm, setConfirm] = useState<null | 'demo' | 'clear'>(null)
  const s = data.settings

  return (
    <div className="screen">
      <TopBar title={t('more.title')} />
      <div className="content content--flush">
        <h2 className="eyebrow eyebrow--pad">{t('more.diary')}</h2>
        <ul className="list">
          <NavRow to="/mehr/kategorien">{t('cat.manage')}</NavRow>
        </ul>

        <h2 className="eyebrow eyebrow--pad">{t('more.settings')}</h2>
        <ul className="list">
          <li className="listrow listrow--static">
            <label htmlFor="lang">{t('more.language')}</label>
            <span className="select-wrap select-wrap--inline">
              <select id="lang" className="select select--inline" value={lang} onChange={(e) => updateSettings({ lang: e.target.value as Lang })}>
                <option value="de">Deutsch</option>
                <option value="fr">Français</option>
                <option value="it">Italiano</option>
              </select>
              <IconChevronDown size={18} />
            </span>
          </li>
          <li className="listrow listrow--static">
            <span className="listrow__text">
              <span id="pin-l" className="listrow__title">{t('more.pin')}</span>
              <span id="pin-d" className="listrow__desc">{t('more.pinDesc')}</span>
            </span>
            <Switch checked={!!s.pinHash} onChange={(on) => setPinMode(on ? 'set' : 'off')} labelledBy="pin-l" describedBy="pin-d" />
          </li>
          <li className="listrow listrow--static">
            <span className="listrow__text">
              <span id="push-l" className="listrow__title">{t('more.push')}</span>
              <span id="push-d" className="listrow__desc">{t('more.pushDesc')}</span>
            </span>
            <Switch checked={s.push} onChange={(push) => updateSettings({ push })} labelledBy="push-l" describedBy="push-d" />
          </li>
          <li className="listrow listrow--static">
            <span className="listrow__text">
              <span id="rem-l" className="listrow__title">{t('more.reminder')}</span>
              <span id="rem-d" className="listrow__desc">{t('more.reminderDesc')}</span>
            </span>
            <Switch checked={s.reminder} onChange={(reminder) => updateSettings({ reminder })} labelledBy="rem-l" describedBy="rem-d" />
          </li>
          <li>
            <details className="preview">
              <summary>
                <IconBell size={20} /> {t('more.messages')}
              </summary>
              <p className="preview__msg">{t('diary.congrats', { name: t('cat.alcohol') })}</p>
              <p className="preview__msg">{t('diary.reminder1')}</p>
              <p className="preview__msg">{t('diary.reminder2')}</p>
            </details>
          </li>
        </ul>

        <h2 className="eyebrow eyebrow--pad">{t('more.info')}</h2>
        <ul className="list">
          <NavRow to="/mehr/teilen">{t('share.title')}</NavRow>
          <NavRow to="/mehr/unterstuetzung">{t('support.title')}</NavRow>
          <NavRow to="/mehr/datenschutz">{t('privacy.title')}</NavRow>
          <NavRow to="/mehr/impressum">{t('imprint.title')}</NavRow>
        </ul>

        <h2 className="eyebrow eyebrow--pad">{t('more.proto')}</h2>
        <div className="content__pad proto">
          <p className="muted">{t('more.protoText')}</p>
          <div className="proto__btns">
            <button type="button" className="btn btn--secondary" onClick={() => setConfirm('demo')}>
              {t('more.loadDemo')}
            </button>
            <button type="button" className="btn btn--secondary btn--secondary-danger" onClick={() => setConfirm('clear')}>
              {t('more.clear')}
            </button>
          </div>
        </div>
      </div>

      <PinSetupDialog open={pinMode === 'set'} onClose={() => setPinMode(null)} />
      <PinOffDialog open={pinMode === 'off'} onClose={() => setPinMode(null)} />
      <ConfirmDialog
        open={confirm === 'demo'}
        title={t('more.loadDemoTitle')}
        text={t('more.loadDemoText')}
        confirmLabel={t('more.loadDemo')}
        danger={false}
        onConfirm={() => {
          loadDemo()
          setConfirm(null)
          toast(t('more.demoLoaded'))
        }}
        onClose={() => setConfirm(null)}
      />
      <ConfirmDialog
        open={confirm === 'clear'}
        title={t('more.clearTitle')}
        text={t('more.clearText')}
        confirmLabel={t('confirm.yes')}
        onConfirm={() => {
          clearAll()
          setConfirm(null)
          toast(t('more.cleared'))
        }}
        onClose={() => setConfirm(null)}
      />
    </div>
  )
}

function PinSetupDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n()
  const { updateSettings } = useStore()
  const toast = useToast()
  const [a, setA] = useState('')
  const [b, setB] = useState('')
  const [err, setErr] = useState<string>()

  const close = () => {
    setA('')
    setB('')
    setErr(undefined)
    onClose()
  }

  const submit = async () => {
    if (!/^\d{4}$/.test(a)) return setErr(t('pin.invalid'))
    if (a !== b) return setErr(t('pin.mismatch'))
    updateSettings({ pinHash: await hashPin(a) })
    toast(t('pin.activated'))
    close()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={t('pin.setTitle')}
      actions={
        <>
          <button type="button" className="btn btn--primary" onClick={submit}>
            {t('pin.activate')}
          </button>
          <button type="button" className="btn btn--secondary" onClick={close}>
            {t('common.cancel')}
          </button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <p>{t('pin.setText')}</p>
        <Field label={t('pin.new')} htmlFor="pin-a">
          <input id="pin-a" className="input input--pin" type="password" inputMode="numeric" autoComplete="new-password" maxLength={4} value={a} onChange={(e) => setA(e.target.value.replace(/\D/g, ''))} autoFocus />
        </Field>
        <Field label={t('pin.repeat')} htmlFor="pin-b" error={err}>
          <input id="pin-b" className="input input--pin" type="password" inputMode="numeric" autoComplete="new-password" maxLength={4} value={b} onChange={(e) => setB(e.target.value.replace(/\D/g, ''))} aria-describedby={err ? 'pin-b-err' : undefined} />
        </Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

function PinOffDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n()
  const { data, updateSettings } = useStore()
  const toast = useToast()
  const [pin, setPin] = useState('')
  const [err, setErr] = useState<string>()

  const close = () => {
    setPin('')
    setErr(undefined)
    onClose()
  }

  const submit = async () => {
    if ((await hashPin(pin)) !== data.settings.pinHash) return setErr(t('pin.wrong'))
    updateSettings({ pinHash: undefined })
    toast(t('pin.disabled'))
    close()
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title={t('pin.offTitle')}
      actions={
        <>
          <button type="button" className="btn btn--primary" onClick={submit}>
            {t('pin.off')}
          </button>
          <button type="button" className="btn btn--secondary" onClick={close}>
            {t('common.cancel')}
          </button>
        </>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault()
          void submit()
        }}
      >
        <p>{t('pin.offText')}</p>
        <Field label={t('pin.current')} htmlFor="pin-c" error={err}>
          <input id="pin-c" className="input input--pin" type="password" inputMode="numeric" autoComplete="current-password" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} autoFocus aria-describedby={err ? 'pin-c-err' : undefined} />
        </Field>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

function SubPage({ title, children }: { title: string; children: ReactNode }) {
  const goBack = useGoBack('/mehr')
  return (
    <div className="screen">
      <TopBar title={title} left="back" onLeft={goBack} />
      <div className="content prose">{children}</div>
    </div>
  )
}

const randomCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  const pick = () => chars[Math.floor(Math.random() * chars.length)]
  return `${Array.from({ length: 4 }, pick).join('')}-${Array.from({ length: 4 }, pick).join('')}`
}

/** Inhalt von «Tagebuch teilen». Wird in der Profil-Seite und im Overlay im Tagebuch verwendet. */
export function ShareContent() {
  const { t, lang } = useI18n()
  const { data, setShare } = useStore()
  const toast = useToast()
  const [open, setOpen] = useState(false)
  const share = data.share

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(share?.code ?? '')
      toast(t('share.copied'))
    } catch {
      /* Zwischenablage nicht verfügbar */
    }
  }

  return (
    <>
      <p>{t('share.text')}</p>
      {share ? (
        <div className="infobox">
          <p>
            <strong>{t('share.active', { date: fmtDayFull(toDateStr(new Date(share.since)), lang) })}</strong>
          </p>
          <p>
            {t('share.code')}: <span className="code">{share.code}</span>
          </p>
          <div className="row-btns">
            <button type="button" className="btn btn--secondary btn--sm" onClick={copy}>
              {t('share.copy')}
            </button>
            <button
              type="button"
              className="btn btn--secondary btn--secondary-danger btn--sm"
              onClick={() => {
                setShare(undefined)
                toast(t('share.stopped'))
              }}
            >
              {t('share.stop')}
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          className="btn btn--outline"
          onClick={() => {
            setShare({ code: randomCode(), since: new Date().toISOString() })
            setOpen(true)
          }}
        >
          {t('share.invite')}
        </button>
      )}
      <p className="muted small">
        <IconInfo size={16} /> {t('share.proto')}
      </p>
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={t('share.invite')}
        actions={
          <>
            <button type="button" className="btn btn--primary" onClick={copy}>
              {t('share.copy')}
            </button>
            <button type="button" className="btn btn--secondary" onClick={() => setOpen(false)}>
              {t('common.close')}
            </button>
          </>
        }
      >
        <p>{t('share.dialogText')}</p>
        <p className="code code--big">{share?.code}</p>
      </Modal>
    </>
  )
}

export function SharePage() {
  const { t } = useI18n()
  return (
    <SubPage title={t('share.title')}>
      <ShareContent />
    </SubPage>
  )
}

/** Inhalt von «Sie brauchen Unterstützung?». Wird im Profil als Seite und auf der Startseite als Overlay gezeigt. */
export function SupportContent() {
  const { t } = useI18n()
  return (
    <>
      <p>{t('support.p1')}</p>
      <p>{t('support.p2')}</p>
      <ExternalLink href={SAFEZONE.consulting}>{t('support.link')}</ExternalLink>
    </>
  )
}

export function SupportPage() {
  const { t } = useI18n()
  return (
    <SubPage title={t('support.title')}>
      <SupportContent />
    </SubPage>
  )
}

export function PrivacyPage() {
  const { t } = useI18n()
  const { clearAll } = useStore()
  const toast = useToast()
  const [confirm, setConfirm] = useState(false)
  return (
    <SubPage title={t('privacy.title')}>
      <p className="infobox">{t('privacy.note')}</p>
      <h2>{t('privacy.h1')}</h2>
      <p>{t('privacy.p1')}</p>
      <h2>{t('privacy.h2')}</h2>
      <p>{t('privacy.p2')}</p>
      <h2>{t('privacy.h3')}</h2>
      <p>{t('privacy.p3')}</p>
      <button type="button" className="btn btn--secondary btn--secondary-danger" onClick={() => setConfirm(true)}>
        {t('more.clear')}
      </button>
      <ExternalLink href={SAFEZONE.privacy}>{t('privacy.link')}</ExternalLink>
      <ConfirmDialog
        open={confirm}
        title={t('more.clearTitle')}
        text={t('more.clearText')}
        confirmLabel={t('confirm.yes')}
        onConfirm={() => {
          clearAll()
          setConfirm(false)
          toast(t('more.cleared'))
        }}
        onClose={() => setConfirm(false)}
      />
    </SubPage>
  )
}

export function ImprintPage() {
  const { t } = useI18n()
  return (
    <SubPage title={t('imprint.title')}>
      <ExternalLink href={SAFEZONE.imprint}>{t('imprint.link')}</ExternalLink>
    </SubPage>
  )
}

export function LockScreen({ onUnlock }: { onUnlock: () => void }) {
  const { t } = useI18n()
  const { data, clearAll, updateSettings } = useStore()
  const [pin, setPin] = useState('')
  const [err, setErr] = useState<string>()
  const [forgot, setForgot] = useState(false)

  const submit = async () => {
    if ((await hashPin(pin)) === data.settings.pinHash) onUnlock()
    else {
      setErr(t('pin.wrong'))
      setPin('')
    }
  }

  return (
    <div className="lock">
      <main className="lock__card" aria-labelledby="lock-title">
        <h1 id="lock-title">{t('lock.title')}</h1>
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void submit()
          }}
        >
          <Field label={t('lock.text')} htmlFor="lock-pin" error={err}>
            <input
              id="lock-pin"
              className="input input--pin"
              type="password"
              inputMode="numeric"
              autoComplete="current-password"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              autoFocus
              aria-describedby={err ? 'lock-pin-err' : undefined}
            />
          </Field>
          <button type="submit" className="btn btn--primary" disabled={pin.length !== 4}>
            {t('lock.unlock')}
          </button>
        </form>
        <button type="button" className="btn btn--link" onClick={() => setForgot(true)}>
          {t('lock.forgot')}
        </button>
      </main>
      <ConfirmDialog
        open={forgot}
        title={t('lock.forgot')}
        text={t('lock.forgotText')}
        confirmLabel={t('lock.reset')}
        onConfirm={() => {
          clearAll()
          updateSettings({ pinHash: undefined })
          onUnlock()
        }}
        onClose={() => setForgot(false)}
      />
    </div>
  )
}
