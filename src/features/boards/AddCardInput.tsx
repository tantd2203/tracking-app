import { useEffect, useRef, useState } from 'react'
import { useCreateCard } from '../../api/cards'
import type { ListKey } from '../../api/types'
import { isEnterKey } from '../../lib/keys'

type Props = {
  boardId: string
  list: ListKey
  /** Gọi khi đóng ô (Esc, nút ✕ hoặc chạm ra ngoài). */
  onDone: () => void
}

/**
 * Ô nhập card ngay trong cột. Enter thêm card rồi giữ ô mở để thêm tiếp,
 * Esc, nút ✕ hoặc chạm ra ngoài thì đóng.
 *
 * Không đóng khi mất focus: trên iOS, focus có thể rơi ra ngoài (bàn phím, thanh công cụ)
 * mà người dùng không hề chạm ra ngoài, và làm mất chữ đang gõ.
 */
export function AddCardInput({ boardId, list, onDone }: Props) {
  const create = useCreateCard()
  const [title, setTitle] = useState('')
  const rootRef = useRef<HTMLDivElement>(null)

  // Chạm (pointerdown) ra ngoài ô thì đóng. Khác với blur: chỉ kích hoạt khi người dùng thật sự chạm.
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) onDone()
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [onDone])

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    create.mutate({ boardId, list, title: trimmed })
    setTitle('')
  }

  return (
    <div
      ref={rootRef}
      className="flex items-center gap-2 rounded-card border-2 border-brand bg-surface p-3"
    >
      <input
        autoFocus
        value={title}
        placeholder="Tên card..."
        aria-label="Tên card mới"
        enterKeyHint="done"
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (isEnterKey(e)) {
            e.preventDefault()
            submit()
          } else if (e.key === 'Escape') {
            onDone()
          }
        }}
        className="h-10 min-w-0 flex-1 bg-transparent text-[15px] font-extrabold text-ink outline-none placeholder:text-ink2/70"
      />
      <button
        type="button"
        aria-label="Đóng"
        onClick={onDone}
        className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[18px] font-black text-ink2"
      >
        ✕
      </button>
    </div>
  )
}
