import { useQueryClient } from '@tanstack/react-query'
import type { Session } from '@supabase/supabase-js'
import { useEffect, useState, type ReactNode } from 'react'
import { db } from '../api/client'
import { isSupabaseConfigured } from '../lib/supabase'
import { AuthContext, type AuthState } from './authContext'

/** Giữ session Supabase trong context. Khi đăng xuất thì xoá toàn bộ cache TanStack Query. */
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const demo = !isSupabaseConfigured
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(!demo)

  useEffect(() => {
    if (demo) return
    const client = db()
    client.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setLoading(false))

    const { data } = client.auth.onAuthStateChange((event, next) => {
      setSession(next)
      if (event === 'SIGNED_OUT') queryClient.clear()
    })
    return () => data.subscription.unsubscribe()
  }, [demo, queryClient])

  const value: AuthState = { session, loading, demo }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
