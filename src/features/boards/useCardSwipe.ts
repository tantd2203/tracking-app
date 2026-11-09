import { useRef, useState, type PointerEvent } from 'react'
import { markDragEnd } from './dragGuard'

/** Vuốt đủ xa này (px) thì mới chuyển cột. */
export const SWIPE_THRESHOLD = 80
/** Quá khoảng này (px) mới coi là vuốt ngang; thẻ dịch theo tay tối đa MAX_OFFSET. */
const LOCK_PX = 8
const MAX_OFFSET = 120

type Start = { x: number; y: number; horizontal: boolean }

/**
 * Vuốt ngang trên thẻ (chỉ cảm ứng) để chuyển sang cột bên cạnh.
 * Vuốt chủ yếu dọc thì bỏ qua. Chuột không dùng vuốt, để kéo thả của dnd-kit vẫn hoạt động.
 */
export function useCardSwipe(
  onSwipe: (dir: -1 | 1) => void,
  enabled: boolean,
): {
  offset: number
  handlers: {
    onPointerDown: (e: PointerEvent) => void
    onPointerMove: (e: PointerEvent) => void
    onPointerUp: (e: PointerEvent) => void
    onPointerCancel: () => void
  }
} {
  const start = useRef<Start | null>(null)
  const [offset, setOffset] = useState(0)

  function reset() {
    start.current = null
    setOffset(0)
  }

  return {
    offset,
    handlers: {
      onPointerDown(e) {
        if (!enabled || e.pointerType !== 'touch') return
        start.current = { x: e.clientX, y: e.clientY, horizontal: false }
      },
      onPointerMove(e) {
        const s = start.current
        if (!s) return
        const dx = e.clientX - s.x
        const dy = e.clientY - s.y
        if (!s.horizontal) {
          if (Math.abs(dx) < LOCK_PX && Math.abs(dy) < LOCK_PX) return
          if (Math.abs(dy) > Math.abs(dx)) {
            start.current = null
            return
          }
          s.horizontal = true
        }
        setOffset(Math.max(-MAX_OFFSET, Math.min(MAX_OFFSET, dx)))
      },
      onPointerUp(e) {
        const s = start.current
        const dx = s ? e.clientX - s.x : 0
        reset()
        if (s?.horizontal && Math.abs(dx) >= SWIPE_THRESHOLD) {
          // Vuốt xong không để trình duyệt bắn click mở chi tiết card.
          markDragEnd()
          onSwipe(dx < 0 ? -1 : 1)
        }
      },
      onPointerCancel: reset,
    },
  }
}
