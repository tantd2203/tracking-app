import type { Session } from '@supabase/supabase-js'
import { createContext } from 'react'

export type AuthState = {
  session: Session | null
  loading: boolean
  /** Chưa có .env.local: app chạy chế độ demo, không có session thật. */
  demo: boolean
}

export const AuthContext = createContext<AuthState | null>(null)
