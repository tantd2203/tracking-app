import type { PeriodKind, ReportBar } from '../../lib/report'

const W = 350
const H = 170
const BASE = 150
const MAX_H = 118

type Props = { bars: ReportBar[]; kind: PeriodKind; avg: string }

/** Biểu đồ cột "Card xong theo ngày", vẽ bằng SVG, co theo chiều ngang màn hình. */
export function BarChart({ bars, kind, avg }: Props) {
  const n = bars.length
  const pitch = W / n
  const barW = Math.max(4, pitch - (n > 10 ? 3 : 10))
  const radius = kind === 'week' ? Math.min(barW / 2, 8) : 2
  const max = Math.max(1, ...bars.map((b) => b.value))

  return (
    <section className="rounded-card border-2 border-line bg-surface p-4 shadow-block">
      <div className="mb-2 flex items-baseline justify-between">
        <h2 className="text-lg font-black">Card xong theo ngày</h2>
        <span className="text-[13px] font-black text-ink2">TB {avg}/ngày</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width="100%"
        role="img"
        aria-label="Biểu đồ card xong theo ngày"
      >
        {bars.map((b, i) => {
          const h =
            b.future || b.value === 0 ? 6 : Math.max(10, Math.round((b.value / max) * MAX_H))
          const x = i * pitch + (pitch - barW) / 2
          const fill = b.isBest
            ? 'var(--color-heat-4)'
            : b.value > 0
              ? 'var(--color-heat-3)'
              : 'var(--color-heat-0)'
          const showValue = kind === 'week' ? b.value > 0 : b.isBest
          return (
            <g key={i}>
              <rect x={x} y={BASE - h} width={barW} height={h} rx={radius} style={{ fill }} />
              {showValue && (
                <text
                  x={x + barW / 2}
                  y={BASE - h - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="900"
                  style={{ fill: 'var(--color-ink)' }}
                >
                  {b.value}
                </text>
              )}
              {b.label && (
                <text
                  x={x + barW / 2}
                  y={H - 4}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="800"
                  style={{ fill: b.isToday ? 'var(--color-brand)' : 'var(--color-ink2)' }}
                >
                  {b.label}
                </text>
              )}
            </g>
          )
        })}
      </svg>
    </section>
  )
}
