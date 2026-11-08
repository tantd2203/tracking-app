/** Icon đơn giản cho thanh tab – vẽ bằng SVG, theo màu chữ hiện tại. */
type IconProps = { size?: number }

export function IconBoards({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="3" width="8" height="8" rx="2.5" />
      <rect x="13" y="3" width="8" height="8" rx="2.5" />
      <rect x="3" y="13" width="8" height="8" rx="2.5" />
      <rect x="13" y="13" width="8" height="8" rx="2.5" />
    </svg>
  )
}

export function IconStats({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <rect x="3" y="12" width="4.5" height="9" rx="1.5" />
      <rect x="9.75" y="4" width="4.5" height="17" rx="1.5" />
      <rect x="16.5" y="8" width="4.5" height="13" rx="1.5" />
    </svg>
  )
}

export function IconMe({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <circle cx="12" cy="8" r="4.5" />
      <path d="M3.5 21c0-4.4 3.8-7.5 8.5-7.5s8.5 3.1 8.5 7.5z" />
    </svg>
  )
}

export function IconBack({ size = 22 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M15 5l-7 7 7 7"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
