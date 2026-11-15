import type { ReactNode } from 'react'

/**
 * Einheitliches Icon-Set: 48×48, Linienstärke 2.5, runde Enden, dunkle Kontur
 * mit zwei hellen Türkistönen als Füllung (.fl hell, .fm mittel, .fw weiss, .fd dunkel).
 */
const ICONS: Record<string, ReactNode> = {
  alcohol: (
    <>
      <path className="fl" d="M15 6h18v12a9 9 0 0 1-18 0z" />
      <path className="fm" d="M15.5 15h17v3a8.5 8.5 0 0 1-17 0z" stroke="none" />
      <path d="M15 6h18v12a9 9 0 0 1-18 0z" />
      <path d="M24 27v13M16 42h16" />
    </>
  ),
  amphetamines: (
    <>
      <path className="fl" d="M8 26v11a14 5 0 0 0 28 0V26z" />
      <ellipse className="fw" cx="22" cy="26" rx="14" ry="5" />
      <path className="fw" d="M13 25c3-8 6-11 9-11s6 3 9 11" />
      <path d="M8 26v11a14 5 0 0 0 28 0V26" />
      <circle className="fd" cx="38" cy="14" r="1.4" stroke="none" />
      <circle className="fd" cx="42" cy="19" r="1.4" stroke="none" />
      <circle className="fd" cx="36" cy="20" r="1.1" stroke="none" />
    </>
  ),
  cannabis: (
    <>
      <g transform="rotate(-64 24 38) translate(24 38) scale(.62) translate(-24 -38)">
        <path className="fl" d="M24 38C19 30 19 17 24 6c5 11 5 24 0 32z" />
      </g>
      <g transform="rotate(64 24 38) translate(24 38) scale(.62) translate(-24 -38)">
        <path className="fl" d="M24 38C19 30 19 17 24 6c5 11 5 24 0 32z" />
      </g>
      <g transform="rotate(-34 24 38) translate(24 38) scale(.84) translate(-24 -38)">
        <path className="fl" d="M24 38C19 30 19 17 24 6c5 11 5 24 0 32z" />
      </g>
      <g transform="rotate(34 24 38) translate(24 38) scale(.84) translate(-24 -38)">
        <path className="fl" d="M24 38C19 30 19 17 24 6c5 11 5 24 0 32z" />
      </g>
      <path className="fm" d="M24 38C19 30 19 17 24 4c5 13 5 26 0 34z" />
      <path d="M24 38v6" />
    </>
  ),
  gaming: (
    <>
      <path
        className="fl"
        d="M13 14h22c5 0 8 3 9.5 9l2 11c.8 4-2 7-5.5 7-2.5 0-4-1.5-5.5-4l-1.5-3H15l-1.5 3c-1.5 2.5-3 4-5.5 4-3.5 0-6.3-3-5.5-7l2-11C5 17 8 14 13 14z"
      />
      <path d="M15 20v8M11 24h8" />
      <circle className="fd" cx="32" cy="27" r="2" />
      <circle className="fd" cx="37.5" cy="22.5" r="2" />
    </>
  ),
  gambling: (
    <>
      <rect className="fl" x="7" y="6" width="28" height="36" rx="4" />
      <rect className="fw" x="11" y="12" width="20" height="13" rx="2" />
      <path d="M17.7 12v13M24.3 12v13" />
      <circle className="fd" cx="14.4" cy="18.5" r="1.5" stroke="none" />
      <circle className="fd" cx="21" cy="18.5" r="1.5" stroke="none" />
      <circle className="fd" cx="27.6" cy="18.5" r="1.5" stroke="none" />
      <path d="M13 33h10M13 37h5" />
      <path d="M35 20h4a2 2 0 0 1 2 2v-9" />
      <circle className="fm" cx="41" cy="10" r="3.5" />
    </>
  ),
  ghb: (
    <>
      <path className="fl" d="M20 6h8v9a14 14 0 1 1-8 0z" />
      <path className="fm" d="M10.1 30h27.8a14 14 0 0 1-27.8 0z" stroke="none" />
      <path d="M20 6h8v9a14 14 0 1 1-8 0z" />
      <rect className="fm" x="19" y="3" width="10" height="5" rx="1.5" />
      <path className="fw" d="M24 32c-2 2.5-3 4-3 5.5a3 3 0 0 0 6 0c0-1.5-1-3-3-5.500z" />
    </>
  ),
  heroin: (
    <g transform="rotate(-45 24 24)">
      <path d="M3 24h5M8 18v12M8 24h8" />
      <rect className="fl" x="16" y="19" width="18" height="10" rx="1.5" />
      <path d="M16 16v16M21 19v3.500M26 19v3.500M31 19v3.5" />
      <path className="fm" d="M17 20h8v8h-8z" stroke="none" />
      <rect className="fw" x="34" y="21.5" width="4" height="5" />
      <path d="M38 24h8" />
    </g>
  ),
  shopping: (
    <>
      <path className="fl" d="M8 17h32l1.5 23a3 3 0 0 1-3 3h-29a3 3 0 0 1-3-3z" />
      <path d="M16 23v-8a8 8 0 0 1 16 0v8" />
      <circle className="fw" cx="24" cy="32" r="4.5" />
      <path d="M26.3 29.800a3 3 0 1 0 0 4.4" />
    </>
  ),
  ketamine: (
    <>
      <path className="fl" d="M20 15v6l-5 5v12a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V26l-5-5v-6z" />
      <path className="fw" d="M15.5 31h17v7a3.5 3.5 0 0 1-3.5 3.500H19A3.5 3.5 0 0 1 15.5 38z" stroke="none" />
      <path d="M20 15v6l-5 5v12a4 4 0 0 0 4 4h10a4 4 0 0 0 4-4V26l-5-5v-6" />
      <rect className="fm" x="18" y="8" width="12" height="7" rx="2" />
      <circle className="fd" cx="21" cy="36" r="1.2" stroke="none" />
      <circle className="fd" cx="26" cy="34" r="1.2" stroke="none" />
      <circle className="fd" cx="28" cy="38" r="1.2" stroke="none" />
    </>
  ),
  caffeine: (
    <>
      <path className="fl" d="M9 21h25v9a11 11 0 0 1-11 11h-3A11 11 0 0 1 9 30z" />
      <path d="M34 24h2.500a4.5 4.5 0 0 1 0 9H32" />
      <path d="M7 44h29" />
      <path d="M16 15c-2-2.5 2-4 0-7M24 15c-2-2.5 2-4 0-7" />
    </>
  ),
  cocaine: (
    <>
      <path className="fl" d="M11 10h26v30a3 3 0 0 1-3 3H14a3 3 0 0 1-3-3z" />
      <path d="M11 16h26" strokeDasharray="1 4" />
      <path className="fw" d="M15 41c1.5-9 5-14 9-14s7.5 5 9 14z" />
      <circle className="fd" cx="19" cy="23" r="1.3" stroke="none" />
      <circle className="fd" cx="28" cy="21.5" r="1.3" stroke="none" />
      <circle className="fd" cx="24" cy="20" r="1.3" stroke="none" />
    </>
  ),
  mdma: (
    <>
      <g transform="rotate(-40 18 17)">
        <rect className="fl" x="4" y="11" width="28" height="12" rx="6" />
        <path className="fm" d="M10 11h8v12h-8a6 6 0 0 1 0-12z" stroke="none" />
        <path d="M18 11v12" />
        <rect x="4" y="11" width="28" height="12" rx="6" />
      </g>
      <circle className="fl" cx="32" cy="32" r="10" />
      <path d="M32 22v20" />
      <path className="fm" d="M32 22a10 10 0 0 1 0 20z" stroke="none" />
      <circle cx="32" cy="32" r="10" />
    </>
  ),
  medication: (
    <>
      <rect className="fl" x="6" y="8" width="36" height="32" rx="4" />
      <rect className="fw" x="11" y="13" width="7" height="10" rx="3.5" />
      <rect className="fw" x="20.5" y="13" width="7" height="10" rx="3.5" />
      <rect className="fm" x="30" y="13" width="7" height="10" rx="3.5" />
      <rect className="fm" x="11" y="26" width="7" height="10" rx="3.5" />
      <rect className="fw" x="20.5" y="26" width="7" height="10" rx="3.5" />
      <rect className="fw" x="30" y="26" width="7" height="10" rx="3.5" />
    </>
  ),
  methamphetamine: (
    <>
      <g transform="rotate(-28 24 28)">
        <rect className="fl" x="17" y="24" width="28" height="7" rx="3.5" />
        <path d="M40 24v7" />
        <circle className="fl" cx="13" cy="27.5" r="9.5" />
        <path className="fm" d="M4 27.500h18a9.5 9.5 0 0 1-18 0z" stroke="none" />
        <circle cx="13" cy="27.5" r="9.5" />
        <path d="M11 19.500v-2.500h4v2.5" />
      </g>
      <path d="M12 13c-2-2 2-3 0-6M19 14c-2-2 2-3 0-6" />
    </>
  ),
  nicotine: (
    <>
      <path d="M33 22c-3-3 3-5 0-8s3-5 0-8M39 24c-2-2 2-4 0-6" />
      <rect className="fl" x="5" y="28" width="36" height="8" rx="1.5" />
      <path className="fm" d="M5 28h12v8H5z" stroke="none" />
      <path d="M17 28v8" />
      <rect x="5" y="28" width="36" height="8" rx="1.5" />
      <path d="M45 28v8" />
    </>
  ),
  opiates: (
    <>
      <rect className="fm" x="14" y="6" width="20" height="8" rx="2" />
      <path className="fl" d="M15 14h18v25a3 3 0 0 1-3 3H18a3 3 0 0 1-3-3z" />
      <rect className="fw" x="18" y="20" width="12" height="13" rx="1.5" />
      <path d="M24 23.500v6M21 26.500h6" />
    </>
  ),
  porn: (
    <>
      <rect className="fl" x="5" y="7" width="38" height="28" rx="4" />
      <path d="M24 35v6M16 42h16" />
      <circle className="fw" cx="24" cy="21" r="10" />
      <text
        x="24"
        y="25"
        textAnchor="middle"
        fontSize="11"
        fontWeight="800"
        fill="currentColor"
        stroke="none"
        fontFamily="var(--font-body)"
      >
        18+
      </text>
    </>
  ),
  psychedelics: (
    <>
      <path className="fl" d="M18 26v10a6 4.5 0 0 0 12 0V26z" />
      <path className="fm" d="M6 27a18 16 0 0 1 36 0z" />
      <circle className="fw" cx="16" cy="21" r="2.6" />
      <circle className="fw" cx="25" cy="15" r="2.6" />
      <circle className="fw" cx="33" cy="22" r="2.6" />
    </>
  ),
  social: (
    <>
      <rect className="fl" x="12" y="4" width="24" height="40" rx="5" />
      <rect className="fw" x="16" y="9" width="16" height="25" rx="1.5" />
      <path
        className="fm"
        d="M24 28c-4-3-5-5-5-7.200a2.9 2.9 0 0 1 5-1.8 2.9 2.9 0 0 1 5 1.800c0 2.2-1 4.2-5 7.200z"
      />
      <circle className="fd" cx="24" cy="39" r="1.5" stroke="none" />
    </>
  ),
  other: (
    <>
      <rect className="fl" x="7" y="9" width="26" height="33" rx="3" />
      <rect className="fm" x="14" y="5" width="12" height="7" rx="2" />
      <path d="M13 21h14M13 27h14M13 33h8" />
      <path
        className="fm"
        d="m36 22 2.8 5.8 6.2.8-4.6 4.3 1.2 6.2-5.6-3.1-5.6 3.1 1.2-6.200L27 28.600l6.2-.8z"
      />
    </>
  ),
}

export const hasCategoryIcon = (key?: string): boolean => !!key && key in ICONS

export function CategoryIcon({ name, size = 32 }: { name: string; size?: number }) {
  return (
    <svg
      className="cicon"
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {ICONS[name] ?? ICONS.other}
    </svg>
  )
}
