import { useState } from 'react'
import { useOverdueCount, useRangeCounts } from '../../api/stats'
import { Segmented } from '../../components/Segmented'
import { Whale } from '../../components/Whale'
import { toLocalISO } from '../../lib/date'
import {
  bestLine,
  buildReport,
  canGoBack,
  canGoForward,
  periodDays,
  periodLabel,
  reportMood,
  reportNote,
  type PeriodKind,
} from '../../lib/report'
import { BarChart } from './BarChart'
import { KpiCard } from './KpiCard'
import { OverdueSheet } from './OverdueSheet'
import { PeriodPicker } from './PeriodPicker'

/** Chế độ Báo cáo của màn Thống kê: chọn tuần/tháng, KPI, biểu đồ cột và nhận xét của Bubu. */
export function ReportView() {
  const [kind, setKind] = useState<PeriodKind>('week')
  const [offset, setOffset] = useState(0)
  const [overdueOpen, setOverdueOpen] = useState(false)

  const today = new Date()
  const current = periodDays(kind, offset, today)
  const previous = periodDays(kind, offset - 1, today)
  const counts = useRangeCounts(toLocalISO(previous[0]), toLocalISO(current[current.length - 1]))
  const overdue = useOverdueCount()

  const report = buildReport(counts.data ?? {}, kind, offset, today)
  const { label, sub } = periodLabel(kind, offset, today)
  const od = overdue.data ?? 0
  const best = bestLine(report.bestDay)

  return (
    <div className="flex flex-col gap-4">
      <Segmented<PeriodKind>
        value={kind}
        onChange={(k) => {
          setKind(k)
          setOffset(0)
        }}
        options={[
          { value: 'week', label: 'Tuần' },
          { value: 'month', label: 'Tháng' },
        ]}
      />

      <PeriodPicker
        label={label}
        sub={sub}
        canPrev={canGoBack(kind, offset)}
        canNext={canGoForward(offset)}
        onPrev={() => setOffset((o) => o - 1)}
        onNext={() => setOffset((o) => o + 1)}
      />

      <div className="flex gap-2">
        <KpiCard tone="brand" label="Card hoàn thành" footer={report.deltaLabel}>
          <p className="text-[34px] leading-none font-black">{report.total}</p>
        </KpiCard>
        <KpiCard tone="surface" label="Ngày hoạt động">
          <p className="text-[28px] leading-none font-black">
            {report.active}
            <span className="text-base text-ink2">/{report.denom}</span>
          </p>
          {kind === 'week' && (
            <div className="mt-2 flex gap-1">
              {report.bars.map((b, i) => (
                <span
                  key={i}
                  className={`size-2.5 rounded-[3px] ${b.value > 0 ? 'bg-heat-3' : 'bg-heat-0'}`}
                />
              ))}
            </div>
          )}
        </KpiCard>
        <button
          type="button"
          onClick={() => setOverdueOpen(true)}
          className={`flex min-w-0 flex-1 cursor-pointer flex-col rounded-card border-2 bg-surface p-3 text-left shadow-block ${
            od > 0 ? 'border-red-line' : 'border-line'
          }`}
        >
          <span className="text-[12px] font-black tracking-[0.4px] text-ink2 uppercase">
            Quá hạn
          </span>
          <span
            className={`mt-1 text-[28px] leading-none font-black ${od > 0 ? 'text-red' : 'text-ink'}`}
          >
            {od}
          </span>
          <span
            className={`mt-1.5 text-[12px] leading-snug font-bold ${od > 0 ? 'text-red' : 'text-ink2'}`}
          >
            {od > 0 ? 'Cần xử lý' : 'Tuyệt, không có!'}
          </span>
        </button>
      </div>

      <BarChart bars={report.bars} kind={kind} avg={report.avg} />

      <section className="flex items-center gap-4 rounded-card border-2 border-line bg-surface p-4 shadow-block">
        <div className="shrink-0">
          <Whale mood={reportMood(report.total, report.delta)} size={76} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[15px] font-bold">
            {reportNote(report.total, report.prevTotal, report.delta)}
          </p>
          {best && <p className="mt-2 text-[13px] font-black text-brand">{best}</p>}
        </div>
      </section>

      <OverdueSheet open={overdueOpen} onClose={() => setOverdueOpen(false)} />
    </div>
  )
}
