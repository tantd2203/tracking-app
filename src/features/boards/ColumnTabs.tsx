import { useDroppable } from '@dnd-kit/core'
import type { ListKey } from '../../api/types'
import { COLUMNS, type ColumnMeta } from './columns'
import { TAB_PREFIX } from './dropTarget'

type Props = {
  counts: Record<ListKey, number>
  active: ListKey
  onSelect: (key: ListKey) => void
}

/** Ba tab cột ở đầu board. Thả card vào tab thì card vào đầu cột đó. */
export function ColumnTabs({ counts, active, onSelect }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Cột"
      className="mx-5 mb-3 flex gap-1.5 rounded-[20px] bg-col p-1.5"
    >
      {COLUMNS.map((col) => (
        <ColumnTab
          key={col.key}
          col={col}
          count={counts[col.key]}
          selected={col.key === active}
          onSelect={() => onSelect(col.key)}
        />
      ))}
    </div>
  )
}

function ColumnTab({
  col,
  count,
  selected,
  onSelect,
}: {
  col: ColumnMeta
  count: number
  selected: boolean
  onSelect: () => void
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `${TAB_PREFIX}${col.key}` })
  return (
    <button
      ref={setNodeRef}
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onSelect}
      className={[
        'flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl text-[15px] font-black transition-[transform,background-color,border-color] duration-150',
        isOver
          ? 'scale-105 border-2 border-brand bg-chip text-brand'
          : selected
            ? 'border-2 border-brand bg-surface'
            : 'border-2 border-transparent text-ink2',
      ].join(' ')}
    >
      <span aria-hidden="true" className="size-2.5 rounded-full" style={{ background: col.dot }} />
      {col.label}
      <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-surface px-1.5 text-xs font-black text-ink2">
        {count}
      </span>
    </button>
  )
}
