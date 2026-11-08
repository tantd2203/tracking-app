import { Link, useNavigate } from 'react-router'
import { useSession, useSignOut } from '../../api/auth'
import { useTheme } from '../../app/theme'
import { Toggle } from '../../components/Toggle'

/** Màn 8 – Tôi. Chế độ tối + đăng xuất + phiên bản. */
export default function MePage() {
  const { theme, setTheme } = useTheme()
  const navigate = useNavigate()
  const { demo } = useSession()
  const signOut = useSignOut()

  async function logout() {
    if (!demo) await signOut.mutateAsync()
    navigate('/login', { replace: true })
  }

  return (
    <div className="px-5">
      <header className="safe-top pb-4">
        <h1 className="text-[30px] font-black">Tôi</h1>
      </header>

      <div className="flex items-center gap-4 rounded-card border-2 border-line bg-surface p-4 shadow-block">
        <div className="grid size-16 place-items-center rounded-2xl bg-brand text-2xl font-black text-white shadow-[0_4px_0_var(--color-brand-shade)]">
          B
        </div>
        <div>
          <p className="text-xl font-black">Bạn của Bubu</p>
          <p className="text-sm font-bold text-ink2">Thông tin tài khoản có ở giai đoạn 1</p>
        </div>
      </div>

      <ul className="mt-4 overflow-hidden rounded-card border-2 border-line bg-surface shadow-block">
        <li className="flex items-center justify-between gap-3 px-4 py-3.5">
          <span className="flex items-center gap-3 text-base font-black">
            <span className="grid size-9 place-items-center rounded-xl bg-ink text-surface">
              🌙
            </span>
            Chế độ tối
          </span>
          <Toggle
            label="Chế độ tối"
            checked={theme === 'dark'}
            onChange={(on) => setTheme(on ? 'dark' : 'light')}
          />
        </li>
      </ul>

      <button
        onClick={logout}
        className="mt-4 h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-surface text-base font-black text-ink shadow-block-sm active:translate-y-[3px] active:shadow-none"
      >
        Đăng xuất
      </button>

      <p className="mt-6 text-center text-xs font-bold text-ink2">
        Bubu v{__APP_VERSION__} ·{' '}
        <Link to="/dev/components" className="font-black">
          Xem bộ component
        </Link>
      </p>
    </div>
  )
}
