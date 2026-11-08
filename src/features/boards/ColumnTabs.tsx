import type { ListKey } from '../../api/types'
import { COLUMNS } from './columns'

type Props = {
  counts: Record<ListKey, number>
  active: ListKey
  onSelect: (key: ListKey) => void
}

/** Ba tab cột ở đầu board, số đếm là số card trong cột. */
export function ColumnTabs({ counts, active, onSelect }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Cột"
      className="mx-5 mb-3 flex gap-1.5 rounded-[20px] bg-col p-1.5"
    >
      {COLUMNS.map((col) => {
        const selected = col.key === active
        return (
          <button
            key={col.key}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(col.key)}
            className={[
              'flex h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl text-[15px] font-black transition-colors',
              selected
                ? 'border-2 border-brand bg-surface'
                : 'border-2 border-transparent text-ink2',
            ].join(' ')}
          >
            <span
              aria-hidden="true"
              className="size-2.5 rounded-full"
              style={{ background: col.dot }}
            />
            {col.label}
            <span className="grid h-[22px] min-w-[22px] place-items-center rounded-full bg-surface px-1.5 text-xs font-black text-ink2">
              {counts[col.key]}
            </span>
          </button>
        )
      })}
    </div>
  )
}
