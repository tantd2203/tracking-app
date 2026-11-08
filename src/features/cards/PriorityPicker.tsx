import { useUpdateCard } from '../../api/cards'
import type { Priority } from '../../api/types'
import { PriorityBars } from '../../components/PriorityBars'
import { PRIORITY } from '../../lib/palette'

const OPTIONS: Priority[] = ['none', 'low', 'med', 'high']

const HINT: Record<Priority, string> = {
  high: 'Làm trước tiên',
  med: 'Làm trong tuần',
  low: 'Khi rảnh',
  none: 'Chưa đặt',
}

type Props = { cardId: string; value: Priority }

/** Chọn độ ưu tiên: 4 ô có 3 vạch, ô đang chọn đổi nền và viền theo mức. */
export function PriorityPicker({ cardId, value }: Props) {
  const update = useUpdateCard()
  return (
    <section>
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-xs font-black tracking-[0.8px] text-ink2 uppercase">Độ ưu tiên</h2>
        <span className="text-[13px] font-bold text-ink2">{HINT[value]}</span>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {OPTIONS.map((key) => {
          const p = PRIORITY[key]
          const on = key === value
          const color = 'c' in p ? p.c : 'var(--color-line)'
          return (
            <button
              key={key}
              type="button"
              aria-pressed={on}
              onClick={() => !on && update.mutate({ id: cardId, patch: { priority: key } })}
              className={`flex h-[66px] cursor-pointer flex-col items-center justify-center gap-1.5 rounded-2xl border-2 text-sm font-black shadow-block-sm transition-colors ${
                on ? 'bg-chip text-ink' : 'border-line bg-surface text-ink2'
              }`}
              style={on ? { borderColor: color } : undefined}
            >
              <PriorityBars level={p.level} color={color} />
              {p.name}
            </button>
          )
        })}
      </div>
    </section>
  )
}
