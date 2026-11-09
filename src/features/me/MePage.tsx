import { useState, type ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { useSignOut, useSession } from '../../api/auth'
import { useProfile, useUpdateProfile } from '../../api/profile'
import { useStreakSummary } from '../../api/stats'
import { applyTheme } from '../../app/theme'
import { Toggle } from '../../components/Toggle'
import { toastError } from '../../api/errors'
import { ProfileCard } from './ProfileCard'
import { EditNameSheet } from './EditNameSheet'

/** Màn 8 – Tôi: hồ sơ, số liệu, cài đặt và đăng xuất. */
export default function MePage() {
  const navigate = useNavigate()
  const { demo, session } = useSession()
  const profile = useProfile()
  const update = useUpdateProfile()
  const streak = useStreakSummary()
  const signOut = useSignOut()
  const [editing, setEditing] = useState(false)

  const data = profile.data
  const dark = data?.dark_mode ?? false
  const email = data?.email ?? session?.user.email ?? ''

  function setDark(on: boolean) {
    applyTheme(on ? 'dark' : 'light')
    update.mutate({ dark_mode: on }, { onError: (e) => toastError(e) })
  }

  async function logout() {
    if (!demo) await signOut.mutateAsync()
    navigate('/login', { replace: true })
  }

  return (
    <div className="px-5 pb-10">
      <header className="safe-top pb-4">
        <h1 className="text-[30px] font-black">Tôi</h1>
      </header>

      <ProfileCard
        name={data?.display_name ?? ''}
        email={email}
        memberSince={data?.memberSince ?? ''}
        onEdit={() => setEditing(true)}
      />

      <div className="mt-4 grid grid-cols-3 gap-2">
        <Stat label="Streak" value={streak.streak} tone="brand" />
        <Stat label="Kỷ lục" value={streak.record} />
        <Stat label="Card xong" value={streak.totalYear} />
      </div>

      <ul className="mt-4 overflow-hidden rounded-card border-2 border-line bg-surface shadow-block">
        <Row icon="🌙" iconClass="bg-ink text-surface" label="Chế độ tối">
          <Toggle label="Chế độ tối" checked={dark} onChange={setDark} />
        </Row>
        <Row icon="⏰" iconClass="bg-chip" label="Nhắc nhở hằng ngày">
          <span className="flex items-center gap-2 text-sm font-black text-ink2">
            20:00
            <span className="rounded-full bg-surface2 px-2 py-0.5 text-xs text-ink2">Sắp có</span>
          </span>
        </Row>
        <Row icon="🌐" iconClass="bg-chip" label="Ngôn ngữ">
          <span className="text-sm font-black text-ink2">Tiếng Việt</span>
        </Row>
      </ul>

      <button
        type="button"
        onClick={logout}
        className="mt-4 h-12 w-full cursor-pointer rounded-2xl border-2 border-line bg-surface text-base font-black text-ink shadow-block-sm active:translate-y-[3px] active:shadow-none"
      >
        Đăng xuất
      </button>

      <p className="mt-6 text-center text-xs font-bold text-ink2">Bubu v{__APP_VERSION__}</p>

      {editing && (
        <EditNameSheet current={data?.display_name ?? ''} onClose={() => setEditing(false)} />
      )}
    </div>
  )
}

function Stat({ label, value, tone }: { label: string; value: number; tone?: 'brand' }) {
  return (
    <div className="rounded-card border-2 border-line bg-surface px-3 py-3 text-center shadow-block-sm">
      <p className={`text-2xl leading-none font-black ${tone === 'brand' ? 'text-brand' : ''}`}>
        {value}
      </p>
      <p className="mt-1 text-[12px] font-black text-ink2">{label}</p>
    </div>
  )
}

function Row({
  icon,
  iconClass,
  label,
  children,
}: {
  icon: string
  iconClass: string
  label: string
  children: ReactNode
}) {
  return (
    <li className="flex items-center justify-between gap-3 border-b-2 border-line px-4 py-3.5 last:border-b-0">
      <span className="flex items-center gap-3 text-base font-black">
        <span className={`grid size-9 place-items-center rounded-xl ${iconClass}`}>{icon}</span>
        {label}
      </span>
      {children}
    </li>
  )
}
