import { useState, type KeyboardEvent } from 'react'
import { useCreateLabel, useDeleteLabel, useLabels, useToggleCardLabel } from '../../api/labels'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { toast } from '../../components/toast'
import type { CardDetail } from '../../api/cards'
import type { Label } from '../../api/types'
import { LABEL_COLORS } from '../../lib/palette'
import { isEnterKey } from '../../lib/keys'

type Props = { boardId: string; card: CardDetail }

/** Gắn nhãn cho card. Nhãn dùng chung mọi board, tạo nhãn mới thì gắn luôn vào card. */
export function LabelPicker({ boardId, card }: Props) {
  const labels = useLabels()
  const toggle = useToggleCardLabel()
  const [adding, setAdding] = useState(false)
  const [deleting, setDeleting] = useState<Label | null>(null)
  const remove = useDeleteLabel()
  const attached = new Set(card.labels.map((l) => l.id))
  const count = card.labels.length

  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-xs font-black tracking-[0.8px] text-ink2 uppercase">Nhãn</h2>
        <span className="text-[13px] font-bold text-ink2">
          {count > 0 ? `${count} đã chọn` : 'Chạm để gắn'}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {(labels.data ?? []).map((label) => (
          <LabelChip
            key={label.id}
            label={label}
            on={attached.has(label.id)}
            onDelete={() => setDeleting(label)}
            onClick={() =>
              toggle.mutate({
                cardId: card.id,
                boardId,
                labelId: label.id,
                on: !attached.has(label.id),
              })
            }
          />
        ))}

        {adding ? (
          <NewLabelRow cardId={card.id} boardId={boardId} onDone={() => setAdding(false)} />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="h-10 cursor-pointer rounded-full border-2 border-dashed border-heat-2 px-4 text-sm font-black text-brand"
          >
            + Nhãn mới
          </button>
        )}
      </div>

      <ConfirmDialog
        open={deleting !== null}
        title={`Xoá nhãn “${deleting?.name ?? ''}”?`}
        text="Nhãn sẽ được gỡ khỏi mọi card đang dùng nó."
        confirmLabel="Xoá"
        onConfirm={() => {
          if (!deleting) return
          const name = deleting.name
          setDeleting(null)
          remove.mutate({ id: deleting.id }, { onSuccess: () => toast(`Đã xoá nhãn “${name}”`) })
        }}
        onClose={() => setDeleting(null)}
      />
    </section>
  )
}

function LabelChip({
  label,
  on,
  onClick,
  onDelete,
}: {
  label: Label
  on: boolean
  onClick: () => void
  onDelete: () => void
}) {
  const c = LABEL_COLORS[label.color] ?? LABEL_COLORS[0]
  return (
    <span
      className={`inline-flex h-10 items-center rounded-full border-2 pr-1 text-sm font-black transition-colors ${
        on ? 'border-transparent' : 'border-line bg-surface text-ink'
      }`}
      style={on ? { background: c.c, color: c.fg } : undefined}
    >
      <button
        type="button"
        aria-pressed={on}
        onClick={onClick}
        className="inline-flex h-full cursor-pointer items-center gap-2 pr-1 pl-4"
      >
        {on ? (
          <span aria-hidden="true">✓</span>
        ) : (
          <span aria-hidden="true" className="size-3 rounded-full" style={{ background: c.c }} />
        )}
        {label.name}
      </button>
      <button
        type="button"
        aria-label={`Xoá nhãn ${label.name}`}
        onClick={onDelete}
        className="grid size-7 cursor-pointer place-items-center rounded-full text-base leading-none font-black opacity-70 hover:opacity-100"
      >
        ×
      </button>
    </span>
  )
}

/** Hàng nhập nhãn mới: tên, 5 màu, nút Thêm. Enter thêm, Esc huỷ. */
function NewLabelRow({
  cardId,
  boardId,
  onDone,
}: {
  cardId: string
  boardId: string
  onDone: () => void
}) {
  const create = useCreateLabel()
  const [name, setName] = useState('')
  const [color, setColor] = useState(0)

  function submit() {
    const trimmed = name.trim()
    if (!trimmed) return
    create.mutate({ name: trimmed, color, attachTo: { cardId, boardId } })
    onDone()
  }

  function onKey(e: KeyboardEvent<HTMLInputElement>) {
    if (isEnterKey(e)) submit()
    if (e.key === 'Escape') onDone()
  }

  return (
    <div className="flex w-full flex-col gap-2 rounded-card border-2 border-brand bg-surface p-3">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={onKey}
        placeholder="Tên nhãn"
        aria-label="Tên nhãn mới"
        maxLength={24}
        className="h-10 bg-transparent font-extrabold outline-none placeholder:text-ink2/70"
      />
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {LABEL_COLORS.map((c, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Màu nhãn ${i + 1}`}
              aria-pressed={i === color}
              onClick={() => setColor(i)}
              className={`size-7 cursor-pointer rounded-full ${
                i === color ? 'ring-[3px] ring-ink ring-offset-2 ring-offset-surface' : ''
              }`}
              style={{ background: c.c }}
            />
          ))}
        </div>
        <button
          type="button"
          onClick={submit}
          disabled={!name.trim()}
          className="h-9 cursor-pointer rounded-xl bg-brand px-4 text-sm font-black text-white disabled:opacity-50"
        >
          Thêm
        </button>
      </div>
    </div>
  )
}
