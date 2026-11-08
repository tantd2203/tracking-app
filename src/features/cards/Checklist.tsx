import { useState } from 'react'
import {
  useAddChecklistItem,
  useDeleteChecklistItem,
  useUpdateChecklistItem,
} from '../../api/checklist'
import type { CardDetail } from '../../api/cards'
import type { ChecklistItem } from '../../api/types'

type Props = { boardId: string; card: CardDetail }

/** Việc con của card: tick, sửa chữ, xoá, thêm mới. */
export function Checklist({ boardId, card }: Props) {
  const add = useAddChecklistItem()
  const [draft, setDraft] = useState('')
  const { done, total } = card.checklist
  const pct = total > 0 ? Math.round((done / total) * 100) : 0

  function submit() {
    const text = draft.trim()
    if (!text) return
    add.mutate({ cardId: card.id, boardId, text })
    setDraft('')
  }

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-xs font-black tracking-[0.8px] text-ink2 uppercase">Checklist</h2>
        <span className={`text-[13px] font-black ${total > 0 ? 'text-brand' : 'text-ink2'}`}>
          {total > 0 ? `${done}/${total} xong` : 'Chia nhỏ việc để dễ bắt đầu'}
        </span>
      </div>

      {total > 0 && (
        <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-line" aria-hidden="true">
          <div
            className="h-full rounded-full bg-brand transition-[width]"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <ul className="flex flex-col gap-2">
        {card.checklistItems.map((item) => (
          <ChecklistRow
            key={`${item.id}:${item.text}`}
            item={item}
            cardId={card.id}
            boardId={boardId}
          />
        ))}
      </ul>

      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && submit()}
        placeholder="Thêm việc con…"
        aria-label="Thêm việc con"
        className="mt-2 h-11 w-full rounded-2xl border-2 border-dashed border-heat-2 bg-surface px-4 text-[15px] font-bold outline-none placeholder:text-ink2/70 focus:border-brand"
      />
    </section>
  )
}

function ChecklistRow({
  item,
  cardId,
  boardId,
}: {
  item: ChecklistItem
  cardId: string
  boardId: string
}) {
  const update = useUpdateChecklistItem()
  const remove = useDeleteChecklistItem()
  const [text, setText] = useState(item.text)

  function toggle() {
    if (navigator.vibrate) navigator.vibrate(8)
    update.mutate({ id: item.id, cardId, boardId, patch: { done: !item.done } })
  }

  function commit() {
    const next = text.trim()
    if (!next) return setText(item.text)
    if (next !== item.text) update.mutate({ id: item.id, cardId, boardId, patch: { text: next } })
  }

  return (
    <li className="group flex items-center gap-3 rounded-2xl border-2 border-line bg-surface px-3 py-2.5">
      <button
        type="button"
        aria-label={item.done ? 'Bỏ đánh dấu' : 'Đánh dấu xong'}
        aria-pressed={item.done}
        onClick={toggle}
        className={`grid size-7 shrink-0 cursor-pointer place-items-center rounded-full border-2 text-sm font-black transition-transform active:scale-[1.06] ${
          item.done ? 'border-brand bg-brand text-white' : 'border-line text-transparent'
        }`}
      >
        ✓
      </button>
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
        aria-label="Nội dung việc con"
        className={`min-w-0 flex-1 bg-transparent font-bold outline-none ${
          item.done ? 'text-ink2 line-through' : ''
        }`}
      />
      <button
        type="button"
        aria-label="Xoá việc con"
        onClick={() => remove.mutate({ id: item.id, cardId, boardId })}
        className="grid size-8 shrink-0 cursor-pointer place-items-center rounded-full text-lg font-black text-ink2 opacity-0 transition-opacity group-focus-within:opacity-100 group-hover:opacity-100"
      >
        ×
      </button>
    </li>
  )
}
