import { useDayCards } from '../../api/stats'
import { WEEKDAY_LONG, parseLocalISO } from '../../lib/date'
import { heatLevel } from '../../lib/heat'

const HEAT = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4'] as const

type Props = { date: string; count: number; isToday: boolean }

/** Chi tiết một ngày đã chọn trên heatmap: số card và danh sách tên card. */
export function DayDetail({ date, count, isToday }: Props) {
  const d = parseLocalISO(date)
  const cards = useDayCards(date)
  const heading = `${WEEKDAY_LONG[d.getDay()]}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`

  const summary =
    count > 0
      ? `${count} card đã hoàn thành`
      : isToday
        ? 'Chưa có card nào xong hôm nay'
        : 'Không có hoạt động'

  return (
    <section className="rounded-card border-2 border-line bg-surface p-4 shadow-block">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className={`size-10 shrink-0 rounded-[10px] ${HEAT[heatLevel(count)]}`}
        />
        <div className="min-w-0">
          <p className="text-[15px] font-black">
            {heading}
            {isToday && <span className="text-brand"> · Hôm nay</span>}
          </p>
          <p className="text-[13px] font-bold text-ink2">{summary}</p>
        </div>
      </div>

      {count > 0 && (
        <ul className="mt-3 flex flex-col gap-2">
          {(cards.data ?? []).map((c) => (
            <li key={c.id} className="rounded-2xl bg-bg px-3 py-2">
              <p className="truncate text-[15px] font-extrabold">{c.title}</p>
              <p className="truncate text-xs font-bold text-ink2">{c.boardName}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
