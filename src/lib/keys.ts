import type { KeyboardEvent } from 'react'

/**
 * Phím Enter để xác nhận nhập. Bỏ qua khi đang ghép ký tự (IME, ví dụ gõ tiếng Việt trên iPhone):
 * lúc đó Enter chỉ chốt chữ đang ghép, không được coi là thêm/lưu.
 */
export function isEnterKey(e: KeyboardEvent): boolean {
  return e.key === 'Enter' && !e.nativeEvent.isComposing && e.keyCode !== 229
}
