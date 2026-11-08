import { useEffect, useRef } from 'react'
import type { HeatGrid } from '../../lib/heat'

const HEAT = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4'] as const
const ROW_LABELS: Record<number, string> = { 0: 'T2', 2: 'T4', 4: 'T6', 6: 'CN' }

type Props = {
  grid: HeatGrid
  total: number
  activeDays: number
  selected: string
  onSelect: (date: string) => void
}

/** Lưới 52 tuần × 7 ngày. Mở ra là cuộn tới tuần hiện tại. */
export function Heatmap({ grid, total, activeDays, selected, onSelect }: Props) {
  const scroller = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = scroller.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  const monthAt = new Map(grid.months.map((m) => [m.week, m.label]))

  return (
    <section className="rounded-card border-2 border-line bg-surface p-4 shadow-block">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="text-lg font-black">52 tuần qua</h2>
        <span className="text-[13px] font-bold text-ink2">
          {total} card · {activeDays} ngày
        </span>
      </div>

      <div className="flex gap-1.5">
        <div className="flex flex-col gap-[3px] pt-[17px] text-[10px] font-extrabold text-ink2">
          {Array.from({ length: 7 }, (_, row) => (
            <span key={row} className="h-[11px] leading-[11px]">
              {ROW_LABELS[row] ?? ''}
            </span>
          ))}
        </div>

        <div ref={scroller} className="overflow-x-auto pb-1 [scrollbar-width:none]">
          <div className="flex w-max flex-col gap-[3px]">
            <div className="flex gap-[3px] text-[10px] font-extrabold text-ink2">
              {grid.weeks.map((_, w) => (
                <span key={w} className="w-[11px] shrink-0 whitespace-nowrap">
                  {monthAt.get(w) ?? ''}
                </span>
              ))}
            </div>
            <div className="flex gap-[3px]">
              {grid.weeks.map((week, w) => (
                <div key={w} className="flex flex-col gap-[3px]">
                  {week.map((day) => (
                    <button
                      key={day.date}
                      type="button"
                      aria-label={`${day.date}: ${day.count} card`}
                      aria-pressed={selected === day.date}
                      disabled={day.future}
                      onClick={() => onSelect(day.date)}
                      className={[
                        'size-[11px] cursor-pointer rounded-[3px] p-0 disabled:cursor-default',
                        day.future ? 'opacity-0' : HEAT[day.level],
                        day.isToday && day.count === 0 ? 'animate-pulse-ring' : '',
                        selected === day.date ? 'ring-2 ring-ink' : '',
                      ].join(' ')}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-bold text-ink2">
        <span>Chạm ô để xem chi tiết</span>
        <span className="flex items-center gap-1.5">
          Ít
          {HEAT.map((c) => (
            <span key={c} className={`size-3 rounded-[3px] ${c}`} />
          ))}
          Nhiều
        </span>
      </div>
    </section>
  )
}
