import { Navigate, Outlet } from 'react-router'
import { useSession } from '../api/auth'
import { Whale } from '../components/Whale'

/** Chặn route khi chưa đăng nhập. Chế độ demo (chưa có .env.local) cho qua. */
export function RequireAuth() {
  const { session, loading, demo } = useSession()
  if (loading) {
    return (
      <div className="grid min-h-full place-items-center">
        <div className="animate-bob">
          <Whale mood="calm" size={140} />
        </div>
      </div>
    )
  }
  if (!session && !demo) return <Navigate to="/login" replace />
  return <Outlet />
}

/** Đã đăng nhập thì không vào /login hay /register nữa. */
export function GuestOnly() {
  const { session, loading } = useSession()
  if (loading) return null
  if (session) return <Navigate to="/boards" replace />
  return <Outlet />
}
