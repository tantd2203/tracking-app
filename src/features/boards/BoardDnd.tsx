import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  pointerWithin,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useEffect, useMemo, useRef, useState, type ReactNode, type RefObject } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useMoveCard, type BoardData, type CardView } from '../../api/cards'
import { getCachedYearCounts } from '../../api/stats'
import type { ListKey } from '../../api/types'
import { setDragging } from '../../app/dragState'
import { celebrate } from '../../components/celebrate'
import { toast } from '../../components/toast'
import { afterCompletion } from '../../lib/celebrate'
import { toLocalISO } from '../../lib/date'
import { CardBody } from './CardTile'
import { COLUMNS } from './columns'
import { DragInfoContext, type DragInfo } from './dragContext'
import { DropDock } from './DropDock'
import { DOCK_PREFIX, resolveDrop } from './dropTarget'
import { markDragEnd } from './dragGuard'

const LIST_KEYS: ListKey[] = COLUMNS.map((c) => c.key)
/** Vùng mép trái/phải (px) kích hoạt tự cuộn, và tốc độ mỗi khung hình. */
const EDGE_PX = 30
const SCROLL_STEP = 9

function vibrate(ms: number) {
  if (navigator.vibrate) navigator.vibrate(ms)
}

type Props = {
  boardId: string
  data: BoardData
  scrollerRef: RefObject<HTMLDivElement | null>
  /** Gọi sau khi card đổi cột, để màn cuộn tới cột đích. */
  onMoved: (key: ListKey) => void
  children: ReactNode
}

/**
 * Bọc màn board bằng DndContext: nhấn giữ để kéo card, thả vào cột, tab hoặc thanh dưới.
 * Lưu bằng `useMoveCard` (optimistic, lỗi thì quay về chỗ cũ).
 */
export function BoardDnd({ boardId, data, scrollerRef, onMoved, children }: Props) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const [overId, setOverId] = useState<string | null>(null)
  const qc = useQueryClient()
  const move = useMoveCard()
  const edge = useRef(0)
  const frame = useRef(0)
  const today = toLocalISO(new Date())

  const sensors = useSensors(
    useSensor(TouchSensor, { activationConstraint: { delay: 280, tolerance: 10 } }),
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const indicator = activeId ? resolveDrop(activeId, data.cards, overId) : null
  const info: DragInfo = useMemo(() => ({ activeId, indicator }), [activeId, indicator])
  const activeCard: CardView | undefined = activeId
    ? LIST_KEYS.flatMap((k) => data.cards[k]).find((c) => c.id === activeId)
    : undefined

  function stopAutoScroll() {
    cancelAnimationFrame(frame.current)
    edge.current = 0
  }

  function startAutoScroll() {
    cancelAnimationFrame(frame.current)
    const tick = () => {
      const el = scrollerRef.current
      if (el && edge.current) el.scrollLeft += edge.current
      frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
  }

  function finish() {
    stopAutoScroll()
    setActiveId(null)
    setOverId(null)
    setDragging(false)
    if (scrollerRef.current) scrollerRef.current.style.scrollSnapType = ''
    markDragEnd()
  }

  // Dọn khi rời màn khi đang kéo.
  useEffect(
    () => () => {
      stopAutoScroll()
      setDragging(false)
    },
    [],
  )

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id))
    setDragging(true)
    if (scrollerRef.current) scrollerRef.current.style.scrollSnapType = 'none'
    vibrate(12)
    startAutoScroll()
  }

  function onDragMove(e: DragMoveEvent) {
    const rect = e.active.rect.current.translated
    const el = scrollerRef.current
    if (!rect || !el) return
    const bounds = el.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    if (x < bounds.left + EDGE_PX) edge.current = -SCROLL_STEP
    else if (x > bounds.right - EDGE_PX) edge.current = SCROLL_STEP
    else edge.current = 0
  }

  function onDragOver(e: DragOverEvent) {
    const next = e.over ? String(e.over.id) : null
    if (next === overId) return
    setOverId(next)
    if (next?.startsWith(DOCK_PREFIX)) vibrate(8)
  }

  function onDragEnd(e: DragEndEvent) {
    const cardId = String(e.active.id)
    const drop = resolveDrop(cardId, data.cards, e.over ? String(e.over.id) : null)
    const fromList = LIST_KEYS.find((k) => data.cards[k].some((c) => c.id === cardId))
    finish()
    if (!drop) return

    if (drop.toList !== fromList) {
      onMoved(drop.toList)
      const column = COLUMNS.find((c) => c.key === drop.toList)
      // Done có popup ăn mừng (FE-06) nên không hiện toast.
      if (column && drop.toList !== 'done') toast(`Đã chuyển sang ${column.label}`)
    }
    const title = LIST_KEYS.flatMap((k) => data.cards[k]).find((c) => c.id === cardId)?.title ?? ''
    // Đếm trước khi cache làm mới: popup hiện đúng ngay, không chờ server.
    const before = getCachedYearCounts(qc)
    move.mutate(
      { cardId, boardId, toList: drop.toList, toIndex: drop.toIndex },
      {
        onSuccess: (result) => {
          if (!result.completedNow) return
          const done = afterCompletion(before ?? {})
          celebrate({ title, first: done.first, streak: done.streak, today: done.today })
        },
      },
    )
  }

  return (
    <DragInfoContext.Provider value={info}>
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        autoScroll={false}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
        onDragCancel={finish}
      >
        {children}
        <DragOverlay dropAnimation={null}>
          {activeCard ? (
            <CardBody card={activeCard} today={today} className="w-[314px] rotate-2 shadow-lg" />
          ) : null}
        </DragOverlay>
        <DropDock />
      </DndContext>
    </DragInfoContext.Provider>
  )
}
