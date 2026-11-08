import type { CardView } from '../../api/cards'
import type { ListKey } from '../../api/types'
import { AddCardInput } from './AddCardInput'
import { CardTile } from './CardTile'

type Props = {
  boardId: string
  listKey: ListKey
  cards: CardView[]
  today: string
  adding: boolean
  onStartAdd: () => void
  onStopAdd: () => void
}

/** Một cột (list) của board: danh sách card và ô thêm card ở cuối. */
export function KanbanColumn({
  boardId,
  listKey,
  cards,
  today,
  adding,
  onStartAdd,
  onStopAdd,
}: Props) {
  return (
    <section
      aria-label={`Cột ${listKey}`}
      className="mr-3 flex w-[338px] shrink-0 snap-start flex-col gap-3 rounded-[20px] bg-col p-3"
    >
      {cards.map((card) => (
        <CardTile key={card.id} card={card} today={today} />
      ))}

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
  )
}
