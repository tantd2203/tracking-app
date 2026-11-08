import { useMutation } from '@tanstack/react-query'
import { useContext } from 'react'
import { AuthContext } from '../app/authContext'
import { db } from './client'

/** Lỗi hiển thị ngay trên form, không cần toast chung. */
export const AUTH_ERROR_NAME = 'AuthError'

const MESSAGES = {
  invalid: 'Email hoặc mật khẩu chưa đúng.',
  exists: 'Email này đã có tài khoản, đăng nhập nhé.',
  network: 'Mất kết nối, thử lại giúp Bubu nhé.',
  unknown: 'Có lỗi, thử lại giúp Bubu nhé',
}

/** Đổi lỗi Supabase Auth sang câu tiếng Việt. Lỗi gốc giữ trong `cause`. */
export function mapAuthError(error: { message: string; name?: string }): Error {
  const msg = error.message.toLowerCase()
  let text: string = MESSAGES.unknown
  if (msg.includes('invalid login credentials')) text = MESSAGES.invalid
  else if (msg.includes('already registered') || msg.includes('already been registered')) {
    text = MESSAGES.exists
  } else if (
    error.name === 'AuthRetryableFetchError' ||
    msg.includes('failed to fetch') ||
    msg.includes('network')
  ) {
    text = MESSAGES.network
  }
  const err = new Error(text, { cause: error })
  err.name = AUTH_ERROR_NAME
  return err
}

export function useSession() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useSession phải nằm trong AuthProvider')
  return ctx
}

export function useSignIn() {
  return useMutation<void, Error, { email: string; password: string }>({
    mutationFn: async ({ email, password }) => {
      const { error } = await db().auth.signInWithPassword({ email, password })
      if (error) throw mapAuthError(error)
    },
  })
}

/**
 * Đăng nhập bằng Google (OAuth). Trình duyệt chuyển sang Google rồi quay về `/boards`.
 * Cần cấu hình provider Google trong Supabase (xem BE-10).
 */
export function useSignInWithGoogle() {
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const { error } = await db().auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/boards` },
      })
      if (error) throw mapAuthError(error)
    },
  })
}

/**
 * Tạo tài khoản. `needsConfirm` = true khi Supabase yêu cầu xác nhận email trước khi có session.
 * `displayName` đi vào `user_metadata.display_name`. Trigger `profiles` hiện chưa đọc giá trị này
 * (BE-09 sẽ cập nhật hồ sơ sau khi đăng nhập).
 */
export function useSignUp() {
  return useMutation<
    { needsConfirm: boolean },
    Error,
    { email: string; password: string; displayName?: string }
  >({
    mutationFn: async ({ email, password, displayName }) => {
      const { data, error } = await db().auth.signUp({
        email,
        password,
        options: { data: displayName ? { display_name: displayName } : undefined },
      })
      if (error) throw mapAuthError(error)
      return { needsConfirm: !data.session }
    },
  })
}

export function useSignOut() {
  return useMutation<void, Error, void>({
    mutationFn: async () => {
      const { error } = await db().auth.signOut()
      if (error) throw mapAuthError(error)
    },
  })
}
