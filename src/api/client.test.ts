import { describe, expect, it, vi } from 'vitest'

vi.mock('../lib/supabase', () => ({ supabase: null }))

import { db, SupabaseNotConfiguredError } from './client'

describe('db', () => {
  it('ném SupabaseNotConfiguredError khi thiếu .env.local', () => {
    expect(() => db()).toThrow(SupabaseNotConfiguredError)
    expect(() => db()).toThrow('Chưa cấu hình Supabase')
  })
})
