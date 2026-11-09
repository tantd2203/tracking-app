import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useState, type ReactNode } from 'react'
import type { CardView } from '../../api/cards'
import type { ListKey } from '../../api/types'
import { AddCardInput } from './AddCardInput'
import { CardTile } from './CardTile'
import { useDragInfo } from './dragContext'
import { COLUMN_PREFIX } from './dropTarget'
import { DONE_WINDOW_DAYS, dropBarSlot, isRecentDone } from '../../lib/doneWindow'

type Props = {
  boardId: string
  listKey: ListKey
  cards: CardView[]
  today: string
  adding: boolean
  onStartAdd: () => void
  onStopAdd: () => void
}

/** Vạch brand dày 3px chỉ vị trí sẽ thả. */
function DropBar() {
  return <div aria-hidden="true" className="h-[3px] rounded-full bg-brand" />
}

/** Một cột (list) của board: thẻ có thể sắp xếp lại, vùng thả và ô thêm card ở cuối. */
export function KanbanColumn({
  boardId,
  listKey,
  cards,
  today,
  adding,
  onStartAdd,
  onStopAdd,
}: Props) {
  const { activeId, indicator } = useDragInfo()
  const { setNodeRef } = useDroppable({ id: `${COLUMN_PREFIX}${listKey}` })
  const dropAt = indicator?.toList === listKey ? indicator.toIndex : null

  // Cột Done ẩn card hoàn thành cũ; bấm "Xem thêm" để hiện lại.
  const [showOlderDone, setShowOlderDone] = useState(false)
  const isDoneList = listKey === 'done'
  const visible =
    isDoneList && !showOlderDone ? cards.filter((c) => isRecentDone(c.completed_on, today)) : cards
  const olderCount = cards.length - visible.length

  // Vạch chèn tính theo toàn bộ list (đúng với resolveDrop), rồi đặt vào vị trí trong các card đang hiện.
  const slot = dropBarSlot(
    cards.map((c) => c.id),
    activeId,
    visible.map((c) => c.id),
    dropAt,
  )
  const nodes: ReactNode[] = []
  visible.forEach((card, i) => {
    if (slot === i && card.id !== activeId) nodes.push(<DropBar key={`bar-${card.id}`} />)
    nodes.push(<CardTile key={card.id} card={card} today={today} />)
  })
  if (slot === visible.length) nodes.push(<DropBar key="bar-end" />)

  return (
    <SortableContext items={visible.map((c) => c.id)} strategy={verticalListSortingStrategy}>
      <section
        ref={setNodeRef}
        aria-label={`Cột ${listKey}`}
        className="mr-3 flex w-[338px] shrink-0 snap-start flex-col gap-3 rounded-[20px] bg-col p-3"
      >
        {nodes}

        {isDoneList && olderCount > 0 && (
          <button
            type="button"
            onClick={() => setShowOlderDone(true)}
            className="flex h-11 w-full cursor-pointer items-center justify-center rounded-card text-[14px] font-extrabold text-brand"
          >
            Xem thêm {olderCount} card cũ hơn {DONE_WINDOW_DAYS} ngày
          </button>
        )}
        {isDoneList && showOlderDone && olderCount === 0 && (
          <button
            type="button"
            onClick={() => setShowOlderDone(false)}
            className="flex h-11 w-full cursor-pointer items-center justify-center rounded-card text-[14px] font-extrabold text-ink2"
          >
            Ẩn card cũ
          </button>
        )}

        {adding ? (
          <AddCardInput boardId={boardId} list={listKey} onDone={onStopAdd} />
        ) : (
          <button
            type="button"
            onClick={onStartAdd}
            className="mt-auto flex h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-card border-2 border-dashed border-heat-2 bg-surface text-[15px] font-black text-brand"
          >
            <span aria-hidden="true">+</span> Thêm card
          </button>
        )}
      </section>
    </SortableContext>
  )
}
