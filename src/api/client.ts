import type { SupabaseClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Database } from './database.types'

/** Chưa khai báo VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY trong .env.local. */
export class SupabaseNotConfiguredError extends Error {
  constructor() {
    super('Chưa cấu hình Supabase: thêm .env.local rồi chạy lại npm run dev')
    this.name = 'SupabaseNotConfiguredError'
  }
}

/** Client Supabase đã kiểu hoá. Ném `SupabaseNotConfiguredError` nếu thiếu cấu hình. */
export function db(): SupabaseClient<Database> {
  if (!supabase) throw new SupabaseNotConfiguredError()
  return supabase
}
