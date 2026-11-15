import type { ReactNode, SVGProps } from 'react'

type P = SVGProps<SVGSVGElement> & { size?: number }

function base(children: ReactNode, { size = 24, ...rest }: P) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export const IconBook = (p: P) =>
  base(
    <>
      <rect x="5" y="3" width="14" height="18" rx="2.5" />
      <path d="M9 8h6M9 12h6" />
    </>,
    p,
  )
export const IconTarget = (p: P) =>
  base(
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </>,
    p,
  )
export const IconDots = (p: P) =>
  base(
    <>
      <circle cx="5.5" cy="12" r="1.3" fill="currentColor" />
      <circle cx="12" cy="12" r="1.3" fill="currentColor" />
      <circle cx="18.5" cy="12" r="1.3" fill="currentColor" />
    </>,
    p,
  )
export const IconPlus = (p: P) => base(<path d="M12 5v14M5 12h14" />, p)
export const IconMinus = (p: P) => base(<path d="M5 12h14" />, p)
export const IconBack = (p: P) => base(<path d="m15 5-7 7 7 7" />, p)
export const IconClose = (p: P) => base(<path d="M6 6l12 12M18 6 6 18" />, p)
export const IconChevronRight = (p: P) => base(<path d="m9 5 7 7-7 7" />, p)
export const IconChevronDown = (p: P) => base(<path d="m5 9 7 7 7-7" />, p)
export const IconNote = (p: P) =>
  base(
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M9 12h7M9 16h5" />
    </>,
    p,
  )
export const IconCheck = (p: P) => base(<path d="m5 12.5 4.5 4.5L19 7.5" />, p)
export const IconCross = (p: P) => base(<path d="M7 7l10 10M17 7 7 17" />, p)
export const IconClock = (p: P) =>
  base(
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </>,
    p,
  )
export const IconPencil = (p: P) =>
  base(
    <>
      <path d="M4 20h4L19 9l-4-4L4 16z" />
      <path d="m13.5 6.5 4 4" />
    </>,
    p,
  )
export const IconTrash = (p: P) =>
  base(
    <>
      <path d="M4 7h16M10 11v6M14 11v6" />
      <path d="M6 7l1 13h10l1-13M9 7V4h6v3" />
    </>,
    p,
  )
export const IconExternal = (p: P) =>
  base(
    <>
      <path d="M14 4h6v6M20 4l-9 9" />
      <path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </>,
    p,
  )
export const IconSearch = (p: P) =>
  base(
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>,
    p,
  )
export const IconShare = (p: P) =>
  base(
    <>
      <circle cx="6" cy="12" r="2.5" />
      <circle cx="18" cy="6" r="2.5" />
      <circle cx="18" cy="18" r="2.5" />
      <path d="m8.2 10.8 7.6-3.6M8.2 13.2l7.6 3.6" />
    </>,
    p,
  )
export const IconInfo = (p: P) =>
  base(
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>,
    p,
  )
export const IconBell = (p: P) =>
  base(
    <>
      <path d="M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z" />
      <path d="M10 20.5a2 2 0 0 0 4 0" />
    </>,
    p,
  )
