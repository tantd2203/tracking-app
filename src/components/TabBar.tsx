import { NavLink } from 'react-router'
import { IconBoards, IconMe, IconStats } from './icons'

const TABS = [
  { to: '/boards', label: 'Board', Icon: IconBoards },
  { to: '/stats', label: 'Thống kê', Icon: IconStats },
  { to: '/me', label: 'Tôi', Icon: IconMe },
]

/** Thanh tab dưới cùng: Board · Thống kê · Tôi. */
export function TabBar() {
  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t-2 border-line bg-surface pt-2">
      <ul className="mx-auto flex max-w-md justify-around">
        {TABS.map(({ to, label, Icon }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 text-xs font-black no-underline ${
                  isActive ? 'text-brand' : 'text-ink2'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-9 w-12 place-items-center rounded-xl border-2 ${
                      isActive ? 'border-heat-2 bg-chip' : 'border-transparent'
                    }`}
                  >
                    <Icon />
                  </span>
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
