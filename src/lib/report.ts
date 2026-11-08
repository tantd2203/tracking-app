import { WEEKDAY_LONG, WEEKDAY_SHORT, addDays, toLocalISO } from './date'
import { mondayOf, type DayCounts } from './heat'

export type PeriodKind = 'week' | 'month'

/** Giới hạn lùi: 50 tuần hoặc 10 tháng (không đi qua tương lai). */
export const MAX_BACK: Record<PeriodKind, number> = { week: 50, month: 10 }

/** Ngày trong tháng có nhãn trên biểu đồ, cộng thêm ngày cuối tháng. */
const MONTH_LABEL_DAYS = [1, 5, 10, 15, 20, 25]

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function fmt(d: Date): string {
  return `${d.getDate()}/${d.getMonth() + 1}`
}

/**
 * Các ngày của kỳ. Tuần: Thứ Hai → Chủ Nhật. Tháng: ngày 1 → cuối tháng.
 * `offset` 0 là kỳ hiện tại, -1 là kỳ trước.
 */
export function periodDays(kind: PeriodKind, offset: number, today: Date): Date[] {
  if (kind === 'week') {
    const start = addDays(mondayOf(today), 7 * offset)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }
  const first = new Date(today.getFullYear(), today.getMonth() + offset, 1)
  const last = new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()
  return Array.from(
    { length: last },
    (_, i) => new Date(first.getFullYear(), first.getMonth(), i + 1),
  )
}

/** Nhãn kỳ: "2/11 – 8/11/2026" hoặc "Tháng 11/2026", kèm dòng phụ "Tuần này", "Tháng trước"… */
export function periodLabel(
  kind: PeriodKind,
  offset: number,
  today: Date,
): { label: string; sub: string } {
  const days = periodDays(kind, offset, today)
  if (kind === 'week') {
    return {
      label: `${fmt(days[0])} – ${fmt(days[6])}/${days[6].getFullYear()}`,
      sub: offset === 0 ? 'Tuần này' : offset === -1 ? 'Tuần trước' : `${-offset} tuần trước`,
    }
  }
  const first = days[0]
  return {
    label: `Tháng ${first.getMonth() + 1}/${first.getFullYear()}`,
    sub:
      offset === 0
        ? `Tháng này · đến ${fmt(today)}`
        : offset === -1
          ? 'Tháng trước'
          : `${-offset} tháng trước`,
  }
}

export type ReportBar = {
  label: string
  value: number
  isToday: boolean
  /** Ngày chưa tới: cột để trống. */
  future: boolean
  isBest: boolean
}

export type Report = {
  total: number
  prevTotal: number
  delta: number
  /** Chữ hiện cạnh KPI: "+7 so với kỳ trước", "-3 so với kỳ trước" hoặc "Bằng kỳ trước". */
  deltaLabel: string
  active: number
  denom: number
  /** Trung bình mỗi ngày đã qua, dấu phẩy: "3,7". */
  avg: string
  bars: ReportBar[]
  bestDay: { date: Date; count: number } | null
}

/**
 * Số liệu một kỳ. `counts` phải có cả kỳ này và kỳ trước.
 * Ngày sau hôm nay không tính vào tổng và không tính vào số ngày đã qua.
 */
export function buildReport(
  counts: DayCounts,
  kind: PeriodKind,
  offset: number,
  today: Date,
): Report {
  const days = periodDays(kind, offset, today)
  const prevDays = periodDays(kind, offset - 1, today)
  const t = startOfDay(today).getTime()
  const isFuture = (d: Date) => startOfDay(d).getTime() > t
  const valueOf = (d: Date) => counts[toLocalISO(d)] ?? 0

  const values = days.map((d) => (isFuture(d) ? 0 : valueOf(d)))
  const total = values.reduce((sum, v) => sum + v, 0)
  const prevTotal = prevDays.reduce((sum, d) => sum + valueOf(d), 0)
  const delta = total - prevTotal
  const elapsed = days.filter((d) => !isFuture(d)).length
  const active = values.filter((v) => v > 0).length

  let bestIdx = -1
  let best = 0
  values.forEach((v, i) => {
    if (v > best) {
      best = v
      bestIdx = i
    }
  })

  const bars: ReportBar[] = days.map((d, i) => {
    const isToday = startOfDay(d).getTime() === t
    const label =
      kind === 'week'
        ? isToday
          ? 'Nay'
          : WEEKDAY_SHORT[d.getDay()]
        : isToday
          ? 'Nay'
          : MONTH_LABEL_DAYS.includes(d.getDate()) || d.getDate() === days.length
            ? String(d.getDate())
            : ''
    return {
      label,
      value: values[i],
      isToday,
      future: isFuture(d),
      isBest: i === bestIdx,
    }
  })

  return {
    total,
    prevTotal,
    delta,
    deltaLabel:
      delta > 0
        ? `+${delta} so với kỳ trước`
        : delta < 0
          ? `${delta} so với kỳ trước`
          : 'Bằng kỳ trước',
    active,
    denom: kind === 'week' ? 7 : elapsed,
    avg: elapsed ? (total / elapsed).toFixed(1).replace('.', ',') : '0',
    bars,
    bestDay: bestIdx >= 0 ? { date: days[bestIdx], count: best } : null,
  }
}

/** Câu nhận xét của Bubu theo kết quả so với kỳ trước. */
export function reportNote(total: number, prevTotal: number, delta: number): string {
  if (total === 0) return 'Kỳ này nước còn nông. Hoàn thành card đầu tiên để Bubu được bơi nhé!'
  if (delta > 0) {
    const pct = Math.round((delta / prevTotal) * 100)
    const change = prevTotal ? `${pct}%` : `${delta} card`
    return `Bạn hoàn thành nhiều hơn ${change} so với kỳ trước. Bubu tự hào lắm!`
  }
  if (delta < 0) return 'Chậm lại một chút cũng không sao. Mình cùng bơi tiếp nhé!'
  return 'Đều đặn như sóng biển. Giữ nhịp này nhé!'
}

/** Mood Bubu cho thẻ nhận xét: calm khi kỳ trống, cheer khi không giảm, happy khi giảm. */
export function reportMood(total: number, delta: number): 'calm' | 'cheer' | 'happy' {
  if (total === 0) return 'calm'
  return delta >= 0 ? 'cheer' : 'happy'
}

/** Dòng "Ngày năng suất nhất: Thứ Bảy 7/11 (6 card)", hoặc chuỗi rỗng nếu không có. */
export function bestLine(best: { date: Date; count: number } | null): string {
  if (!best) return ''
  const d = best.date
  return `Ngày năng suất nhất: ${WEEKDAY_LONG[d.getDay()]} ${fmt(d)} (${best.count} card)`
}

/** Có lùi thêm được không (chưa tới giới hạn 50 tuần / 10 tháng). */
export function canGoBack(kind: PeriodKind, offset: number): boolean {
  return offset > -MAX_BACK[kind]
}

/** Có tiến tới được không (không qua kỳ hiện tại). */
export function canGoForward(offset: number): boolean {
  return offset < 0
}
