import { useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useBoardData, type BoardData } from '../../api/cards'
import type { ListKey } from '../../api/types'
import { Whale } from '../../components/Whale'
import { IconBack } from '../../components/icons'
import { toLocalISO } from '../../lib/date'
import { boardColor } from '../../lib/palette'
import { ColumnTabs } from './ColumnTabs'
import { BoardDnd } from './BoardDnd'
import { COLUMNS } from './columns'
import { KanbanColumn } from './KanbanColumn'

const LIST_KEYS: ListKey[] = COLUMNS.map((c) => c.key)
/** Bề rộng một cột cộng khoảng cách với cột kế tiếp. */
const COLUMN_STEP = 350
const SCROLL_MS = 280

/** Easing cubic in-out. */
function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/**
 * Cuộn ngang mượt tới `to` trong 280 ms. Tắt scroll-snap trong lúc chạy để snap không kéo ngược.
 * Trả về hàm huỷ.
 */
function animateScrollLeft(el: HTMLElement, to: number, onDone: () => void): () => void {
  const from = el.scrollLeft
  const start = performance.now()
  let frame = 0
  el.style.scrollSnapType = 'none'

  const step = (now: number) => {
    const t = Math.min(1, (now - start) / SCROLL_MS)
    el.scrollLeft = from + (to - from) * easeInOutCubic(t)
    if (t < 1) {
      frame = requestAnimationFrame(step)
    } else {
      el.style.scrollSnapType = ''
      onDone()
    }
  }
  frame = requestAnimationFrame(step)

  return () => {
    cancelAnimationFrame(frame)
    el.style.scrollSnapType = ''
  }
}

function BoardSkeleton() {
  return (
    <div className="px-5" aria-label="Đang tải">
      <div className="mb-4 h-10 w-2/3 animate-pulse rounded-xl bg-surface" />
      <div className="mb-3 h-11 animate-pulse rounded-2xl bg-col" />
      <div className="h-[320px] animate-pulse rounded-[20px] bg-col" />
    </div>
  )
}

/** Board trống: Bubu và nút mở ô nhập ở cột To Do. */
function EmptyBoard({ onAdd }: { onAdd: () => void }) {
  return (
    <section className="mx-5 mb-4 flex flex-col items-center rounded-card border-2 border-line bg-surface px-6 py-6 text-center shadow-block">
      <Whale mood="calm" size={140} />
      <h2 className="mt-3 text-xl font-black">Board còn trống</h2>
      <button
        type="button"
        onClick={onAdd}
        className="mt-4 h-12 w-full cursor-pointer rounded-[16px] bg-brand text-[15px] font-black tracking-[0.6px] text-white shadow-[0_4px_0_var(--color-brand-shade)] active:translate-y-[4px] active:shadow-none"
      >
        THÊM CARD ĐẦU TIÊN
      </button>
    </section>
  )
}

/** Màn 3 – Board Kanban: 3 cột vuốt ngang, thêm card nhanh. Kéo thả làm ở FE-05. */
export default function BoardPage() {
  const { boardId = '' } = useParams()
  const navigate = useNavigate()
  const query = useBoardData(boardId)
  const [active, setActive] = useState<ListKey>('todo')
  const [addingIn, setAddingIn] = useState<ListKey | null>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const cancelScroll = useRef<(() => void) | null>(null)
  const animating = useRef(false)
  const today = toLocalISO(new Date())

  if (query.isPending) return <BoardSkeleton />

  if (query.isError) {
    return (
      <div className="px-5">
        <button
          type="button"
          aria-label="Quay lại"
          onClick={() => navigate('/boards')}
          className="mb-4 grid size-10 cursor-pointer place-items-center rounded-xl border-2 border-line bg-surface"
        >
          <IconBack size={18} />
        </button>
        <p className="rounded-card border-2 border-line bg-surface px-4 py-3 font-bold text-ink2">
          Không tải được board: {query.error.message}
        </p>
      </div>
    )
  }

  const data: BoardData = query.data
  const color = boardColor(data.board.color)
  const counts = {
    todo: data.cards.todo.length,
    doing: data.cards.doing.length,
    done: data.cards.done.length,
  }
  const total = counts.todo + counts.doing + counts.done

  function selectColumn(key: ListKey) {
    const el = scrollerRef.current
    setActive(key)
    if (!el) return
    cancelScroll.current?.()
    const index = LIST_KEYS.indexOf(key)
    const max = el.scrollWidth - el.clientWidth
    const to = Math.min(max, Math.max(0, index * COLUMN_STEP))
    animating.current = true
    cancelScroll.current = animateScrollLeft(el, to, () => {
      animating.current = false
    })
  }

  function onScroll() {
    const el = scrollerRef.current
    if (!el || animating.current) return
    const index = Math.min(LIST_KEYS.length - 1, Math.round(el.scrollLeft / COLUMN_STEP))
    setActive(LIST_KEYS[index])
  }

  return (
    <BoardDnd boardId={boardId} data={data} scrollerRef={scrollerRef} onMoved={selectColumn}>
      <div className="pb-4">
        <header className="safe-top flex items-center gap-3 px-5 pb-3">
          <button
            type="button"
            aria-label="Quay lại"
            onClick={() => navigate('/boards')}
            className="grid size-10 flex-none cursor-pointer place-items-center rounded-xl border-2 border-line bg-surface text-ink shadow-block-sm active:translate-y-[3px] active:shadow-none"
          >
            <IconBack size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-[22px] leading-tight font-black text-ink">
              {data.board.name}
            </h1>
            <p className="truncate text-[13px] font-bold text-ink2">
              Nhấn giữ card để kéo · vuốt ngang đổi cột
            </p>
          </div>
          <span
            aria-hidden="true"
            className="h-9 w-2 flex-none rounded-full"
            style={{ background: color.c }}
          />
        </header>

        <ColumnTabs counts={counts} active={active} onSelect={selectColumn} />

        {total === 0 && (
          <EmptyBoard
            onAdd={() => {
              setAddingIn('todo')
              selectColumn('todo')
            }}
          />
        )}

        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="flex snap-x snap-mandatory scroll-pl-5 overflow-x-auto pr-5 pl-5 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {LIST_KEYS.map((key) => (
            <KanbanColumn
              key={key}
              boardId={boardId}
              listKey={key}
              cards={data.cards[key]}
              today={today}
              adding={addingIn === key}
              onStartAdd={() => {
                setAddingIn(key)
                selectColumn(key)
              }}
              onStopAdd={() => setAddingIn(null)}
            />
          ))}
        </div>
      </div>
    </BoardDnd>
  )
}
