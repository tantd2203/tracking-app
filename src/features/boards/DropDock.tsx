import { useDroppable } from '@dnd-kit/core'
import { useIsDragging } from '../../app/dragState'
import { COLUMNS, type ColumnMeta } from './columns'
import { DOCK_PREFIX } from './dropTarget'

/**
 * Thanh thả dưới đáy, thay chỗ TabBar lúc đang kéo. Luôn được mount để dnd-kit đo vị trí sẵn,
 * chỉ hiện khi kéo.
 */
export function DropDock() {
  const dragging = useIsDragging()
  return (
    <nav
      aria-hidden={!dragging}
      className={`safe-bottom fixed inset-x-0 bottom-0 z-40 border-t-2 border-line bg-surface pt-2 transition-opacity duration-150 ${
        dragging ? 'opacity-100' : 'pointer-events-none invisible opacity-0'
      }`}
    >
      <div className="mx-auto flex max-w-md gap-2 px-4 pb-2">
        {COLUMNS.map((col) => (
          <DockSlot key={col.key} col={col} />
        ))}
      </div>
    </nav>
  )
}

function DockSlot({ col }: { col: ColumnMeta }) {
  const { setNodeRef, isOver } = useDroppable({ id: `${DOCK_PREFIX}${col.key}` })
  const label = col.key === 'done' ? 'Done ✓' : col.label
  return (
    <div
      ref={setNodeRef}
      className={[
        'grid h-14 flex-1 place-items-center rounded-2xl border-2 text-[15px] font-black transition-[transform,background-color,border-color] duration-150',
        isOver ? 'scale-105 border-brand bg-chip text-brand' : 'border-line bg-surface text-ink2',
      ].join(' ')}
    >
      {label}
    </div>
  )
}
