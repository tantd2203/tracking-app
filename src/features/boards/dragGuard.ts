/**
 * Sau khi kéo xong, trình duyệt vẫn có thể bắn `click` lên thẻ và mở chi tiết card.
 * Hàm này cho biết có vừa kết thúc một lần kéo để bỏ qua click đó.
 */
const GUARD_MS = 400
let until = 0

export function markDragEnd() {
  until = Date.now() + GUARD_MS
}

export function wasJustDragged(): boolean {
  return Date.now() < until
}
