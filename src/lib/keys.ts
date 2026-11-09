import type { KeyboardEvent } from 'react'

/** Thời điểm kết thúc ghép ký tự gần nhất (ms, theo performance.now). */
let lastCompositionEnd = -Infinity

if (typeof document !== 'undefined') {
  document.addEventListener(
    'compositionend',
    () => {
      lastCompositionEnd = performance.now()
    },
    true,
  )
}

/**
 * Phím Enter để xác nhận nhập. Bỏ qua khi đang ghép ký tự (IME, ví dụ gõ tiếng Việt):
 * Enter lúc đó chỉ chốt chữ đang ghép, không được coi là thêm/lưu.
 *
 * Safari (iOS) bắn compositionend TRƯỚC keydown của phím Enter chốt chữ, và keydown đó
 * có keyCode 229 nhưng isComposing = false. Nên keyCode 229 chỉ bị bỏ qua khi vừa có
 * compositionend; Enter thường (không vừa ghép xong) vẫn hoạt động trên iPhone.
 */
export function isEnterKey(e: KeyboardEvent): boolean {
  if (e.key !== 'Enter') return false
  if (e.nativeEvent.isComposing) return false
  if (e.keyCode === 229 && performance.now() - lastCompositionEnd < 100) return false
  return true
}
