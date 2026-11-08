import { useState } from 'react'
import { useCreateCard } from '../../api/cards'
import type { ListKey } from '../../api/types'
import { isEnterKey } from '../../lib/keys'

type Props = {
  boardId: string
  list: ListKey
  /** Gọi khi đóng ô (Esc hoặc bấm ra ngoài). */
  onDone: () => void
}

/**
 * Ô nhập card ngay trong cột. Enter thêm card rồi giữ ô mở để thêm tiếp,
 * Esc hoặc bấm ra ngoài thì đóng.
 */
export function AddCardInput({ boardId, list, onDone }: Props) {
  const create = useCreateCard()
  const [title, setTitle] = useState('')

  function submit() {
    const trimmed = title.trim()
    if (!trimmed) return
    create.mutate({ boardId, list, title: trimmed })
    setTitle('')
  }

  return (
    <div
      className="rounded-card border-2 border-brand bg-surface p-3"
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) onDone()
      }}
    >
      <input
        autoFocus
        value={title}
        placeholder="Tên card..."
        aria-label="Tên card mới"
        onChange={(e) => setTitle(e.target.value)}
        onKeyDown={(e) => {
          if (isEnterKey(e)) {
            e.preventDefault()
            submit()
          } else if (e.key === 'Escape') {
            onDone()
          }
        }}
        className="h-10 w-full bg-transparent text-[15px] font-extrabold text-ink outline-none placeholder:text-ink2/70"
      />
    </div>
  )
}
