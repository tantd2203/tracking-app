import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../api/database.types'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

/** Đã khai báo biến môi trường Supabase trong .env.local hay chưa. */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Client Supabase dùng chung. Chưa có .env.local thì là null:
 * app vẫn chạy được để làm giao diện, phần dữ liệu sẽ báo chưa cấu hình.
 * Feature code không import file này trực tiếp, mà dùng `db()` trong `src/api/client.ts`.
 */
export const supabase: SupabaseClient<Database> | null = isSupabaseConfigured
  ? createClient<Database>(url!, anonKey!, {
      auth: { persistSession: true, autoRefreshToken: true },
    })
  : null
