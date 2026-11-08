import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router'
import { useStreakSummary, useYearCounts } from '../../api/stats'
import { Segmented } from '../../components/Segmented'
import { toLocalISO } from '../../lib/date'
import { buildWeeks } from '../../lib/heat'
import { DayDetail } from './DayDetail'
import { EmptyStats } from './EmptyStats'
import { Heatmap } from './Heatmap'
import { StreakHero } from './StreakHero'

type View = 'heatmap' | 'report'

/**
 * Màn Thống kê. Chế độ Heatmap có streak, lưới 52 tuần và chi tiết ngày.
 * Chế độ Báo cáo (`?view=report`) làm ở FE-10.
 */
export default function StatsPage() {
  const [params, setParams] = useSearchParams()
  const view: View = params.get('view') === 'report' ? 'report' : 'heatmap'
  const counts = useYearCounts()
  const summary = useStreakSummary()
  const [picked, setPicked] = useState<string | null>(null)

  const today = toLocalISO(new Date())
  const selected = picked ?? today
  const grid = useMemo(() => buildWeeks(counts.data ?? {}, new Date()), [counts.data])
  const dayCount = counts.data?.[selected] ?? 0

  return (
    <div className="px-5 pb-32">
      <header className="safe-top flex items-center justify-between gap-3 pb-4">
        <h1 className="text-[30px] font-black">Thống kê</h1>
        <Segmented<View>
          className="w-48"
          value={view}
          onChange={(v) => setParams(v === 'report' ? { view: 'report' } : {})}
          options={[
            { value: 'heatmap', label: 'Heatmap' },
            { value: 'report', label: 'Báo cáo' },
          ]}
        />
      </header>

      {view === 'heatmap' ? (
        <div className="flex flex-col gap-4">
          {counts.isPending ? (
            <div
              className="h-[260px] animate-pulse rounded-card bg-surface"
              aria-label="Đang tải"
            />
          ) : summary.totalYear === 0 ? (
            <EmptyStats />
          ) : (
            <StreakHero streak={summary.streak} record={summary.record} mood={summary.mood} />
          )}

          <Heatmap
            grid={grid}
            total={summary.totalYear}
            activeDays={summary.activeDays}
            selected={selected}
            onSelect={setPicked}
          />

          <DayDetail date={selected} count={dayCount} isToday={selected === today} />
        </div>
      ) : (
        <section className="rounded-card border-2 border-line bg-surface p-6 text-center font-bold text-ink2 shadow-block">
          Báo cáo tuần / tháng sẽ được làm ở FE-10.
        </section>
      )}
    </div>
  )
}
