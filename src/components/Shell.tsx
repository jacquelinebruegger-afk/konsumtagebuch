import { useEffect, useRef } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { useI18n } from '../lib/i18n'
import { IconBook, IconTarget, IconUser } from './Icons'

const TABS = [
  { to: '/tagebuch', key: 'nav.diary', Icon: IconBook },
  { to: '/ziele', key: 'nav.goals', Icon: IconTarget },
  { to: '/mehr', key: 'nav.more', Icon: IconUser },
] as const

const ROOTS = new Set(['/tagebuch', '/ziele', '/mehr'])

export function Shell() {
  const { t } = useI18n()
  const { pathname } = useLocation()
  const mainRef = useRef<HTMLElement>(null)
  const isRoot = ROOTS.has(pathname.replace(/\/$/, ''))

  useEffect(() => {
    window.scrollTo(0, 0)
    mainRef.current?.focus({ preventScroll: true })
  }, [pathname])

  const nav = (cls: string) => (
    <nav className={cls} aria-label={t('nav.main')}>
      {TABS.map(({ to, key, Icon }) => (
        <NavLink key={to} to={to} className={({ isActive }) => `navitem${isActive ? ' is-active' : ''}`}>
          <Icon />
          <span>{t(key)}</span>
        </NavLink>
      ))}
    </nav>
  )

  return (
    <div className={`shell${isRoot ? '' : ' is-flow'}`}>
      <a className="skip" href="#main" onClick={(e) => { e.preventDefault(); mainRef.current?.focus() }}>
        {t('nav.skip')}
      </a>
      <aside className="sidebar">
        <div className="brand">
          <span className="brand__mark" aria-hidden="true">
            <IconBook size={22} />
          </span>
          <span className="brand__name">{t('app.name')}</span>
        </div>
        {nav('sidebar__nav')}
        <p className="sidebar__proto">{t('app.proto')}</p>
      </aside>
      <main id="main" ref={mainRef} tabIndex={-1} className="main">
        <Outlet />
      </main>
      {nav('tabbar')}
    </div>
  )
}
