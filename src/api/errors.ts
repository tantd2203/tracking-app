import { toast } from '../components/toast'
import { AUTH_ERROR_NAME } from './auth'
import { SupabaseNotConfiguredError } from './client'

const FRIENDLY_MESSAGE = 'Có lỗi, thử lại giúp Bubu nhé'

/**
 * Lấy `data` từ kết quả Supabase. Có lỗi hoặc không có dữ liệu thì ném `Error` tiếng Việt,
 * lỗi gốc giữ trong `cause` để debug.
 */
export function unwrap<T>({
  data,
  error,
}: {
  data: T | null
  error: { message: string } | null
}): T {
  if (error) throw new Error(FRIENDLY_MESSAGE, { cause: error })
  if (data === null) throw new Error(FRIENDLY_MESSAGE, { cause: 'data is null' })
  return data
}

/** Hiện toast báo lỗi cho người dùng. Dùng làm `onError` mặc định của mutation. */
export function toastError(e: unknown) {
  if (e instanceof Error && e.name === AUTH_ERROR_NAME) return
  if (e instanceof SupabaseNotConfiguredError) {
    toast('Chưa cấu hình Supabase – đang chạy chế độ demo')
    return
  }
  toast(FRIENDLY_MESSAGE)
}
