import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { type ReactNode } from 'react'
import type { CardView } from '../../api/cards'
import type { ListKey } from '../../api/types'
import { AddCardInput } from './AddCardInput'
import { CardTile } from './CardTile'
import { useDragInfo } from './dragContext'
import { COLUMN_PREFIX } from './dropTarget'

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

  // Vạch chèn đặt theo vị trí trong list đã bỏ card đang kéo.
  const nodes: ReactNode[] = []
  let index = 0
  for (const card of cards) {
    if (card.id !== activeId) {
      if (dropAt === index) nodes.push(<DropBar key={`bar-${card.id}`} />)
      index++
    }
    nodes.push(<CardTile key={card.id} card={card} today={today} />)
  }
  if (dropAt === index) nodes.push(<DropBar key="bar-end" />)

  return (
    <SortableContext items={cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
      <section
        ref={setNodeRef}
        aria-label={`Cột ${listKey}`}
        className="mr-3 flex w-[338px] shrink-0 snap-start flex-col gap-3 rounded-[20px] bg-col p-3"
      >
        {nodes}

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
