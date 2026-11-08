import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { Link } from 'react-router'
import type { CardView } from '../../api/cards'
import { dueLabel } from '../../lib/due'
import { LABEL_COLORS, PRIORITY } from '../../lib/palette'
import { wasJustDragged } from './dragGuard'

const BAR_HEIGHTS = ['h-[6px]', 'h-[10px]', 'h-[14px]']

/** 3 vạch tăng dần, số vạch sáng theo mức ưu tiên. */
function PriorityBars({ level, color }: { level: number; color: string }) {
  return (
    <span aria-hidden="true" className="flex items-end gap-[2px]">
      {BAR_HEIGHTS.map((h, i) => (
        <span
          key={h}
          className={`w-[3px] rounded-sm ${h}`}
          style={{ background: i < level ? color : 'var(--color-line)' }}
        />
      ))}
    </span>
  )
}

const CHIP = 'inline-flex h-[26px] items-center gap-1 rounded-lg px-2 text-xs font-extrabold'

type BodyProps = {
  card: CardView
  today: string
  /** Thẻ gốc lúc đang kéo: chỉ còn khung nét đứt. */
  ghost?: boolean
  /** Thêm class cho khung (dùng cho bản sao khi kéo). */
  className?: string
}

/** Nội dung và khung của thẻ card, không có liên kết hay kéo thả. */
export function CardBody({ card, today, ghost = false, className = '' }: BodyProps) {
  const inDone = card.list === 'done'
  const due = dueLabel(card.due_date, today)
  const overdue = !inDone && due?.overdue === true
  const priority = PRIORITY[card.priority as keyof typeof PRIORITY] ?? PRIORITY.none
  const priorityColor = 'c' in priority ? priority.c : ''
  const { done, total } = card.checklist
  const checklistDone = total > 0 && done === total

  const frame = ghost
    ? 'border-dashed border-line bg-transparent shadow-none'
    : `bg-surface shadow-block ${overdue ? 'border-red-line' : 'border-line'}`

  return (
    <div className={`relative block rounded-card border-2 p-3.5 ${frame} ${className}`}>
      <div className={ghost ? 'invisible' : ''}>
        {card.labels.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5 pr-6">
            {card.labels.map((label) => {
              const c = LABEL_COLORS[label.color] ?? LABEL_COLORS[0]
              return (
                <span
                  key={label.id}
                  className="rounded-md px-2 py-0.5 text-xs font-extrabold"
                  style={{ background: c.c, color: c.fg }}
                >
                  {label.name}
                </span>
              )
            })}
          </div>
        )}

        <p className="pr-6 text-[15px] leading-snug font-extrabold">{card.title}</p>

        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {due && (
            <span
              className={`${CHIP} ${
                overdue
                  ? 'bg-red-bg text-red'
                  : due.soon
                    ? 'bg-chip text-chip-ink'
                    : 'bg-bg text-ink2'
              }`}
            >
              <span aria-hidden="true">📅</span>
              {due.text}
            </span>
          )}

          {priority.level > 0 && (
            <span className={`${CHIP} bg-bg text-ink2`}>
              <PriorityBars level={priority.level} color={priorityColor} />
              {priority.name}
            </span>
          )}

          {total > 0 && (
            <span
              className={`${CHIP} ${checklistDone ? 'bg-chip text-chip-ink' : 'bg-bg text-ink2'}`}
            >
              <span aria-hidden="true">☑</span>
              {done}/{total}
            </span>
          )}

          {card.description && (
            <span aria-label="Có mô tả" className="text-sm font-black text-ink2">
              ≡
            </span>
          )}
        </div>
      </div>

      <span
        aria-hidden="true"
        className={`absolute top-3 right-3 text-[13px] leading-none font-black tracking-[-2px] text-ink2/50 ${
          ghost ? 'invisible' : ''
        }`}
      >
        ⋮⋮
      </span>
    </div>
  )
}

type Props = { card: CardView; today: string }

/**
 * Thẻ card trong cột, kéo được. Nhấn giữ 280 ms (chuột thì kéo ngay) để kéo, chạm nhanh để mở chi tiết.
 */
export function CardTile({ card, today }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
    data: { list: card.list },
  })

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
      onClickCapture={(e) => {
        if (wasJustDragged()) {
          e.preventDefault()
          e.stopPropagation()
        }
      }}
      className="touch-none [-webkit-touch-callout:none] select-none transition-transform active:scale-[0.98]"
    >
      {isDragging ? (
        <CardBody card={card} today={today} ghost />
      ) : (
        <Link to={`/cards/${card.id}`} className="block" draggable={false}>
          <CardBody card={card} today={today} />
        </Link>
      )}
    </div>
  )
}
