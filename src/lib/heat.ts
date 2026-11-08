import { addDays, toLocalISO } from './date'

/** Số card hoàn thành theo ngày: { '2026-11-08': 3, ... } */
export type DayCounts = Record<string, number>

/**
 * Mức màu heatmap theo thiết kế Bubu:
 * 0 card → 0 · 1 → 1 · 2–3 → 2 · 4–5 → 3 · từ 6 → 4
 */
export function heatLevel(count: number): 0 | 1 | 2 | 3 | 4 {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

/**
 * Streak hiện tại: số ngày liên tiếp có ít nhất 1 card xong, đếm lùi từ hôm nay.
 * Hôm nay chưa xong card nào thì chuỗi vẫn giữ tới hôm qua (chưa đứt cho tới hết ngày).
 */
export function currentStreak(counts: DayCounts, today: Date = new Date()): number {
  let streak = (counts[toLocalISO(today)] ?? 0) > 0 ? 1 : 0
  for (let i = 1; i < 3660; i++) {
    if ((counts[toLocalISO(addDays(today, -i))] ?? 0) > 0) streak++
    else break
  }
  return streak
}

/** Kỷ lục: chuỗi dài nhất trong `days` ngày gần nhất (mặc định 364 như thiết kế). */
export function bestStreak(counts: DayCounts, today: Date = new Date(), days = 364): number {
  let best = 0
  let run = 0
  for (let i = days - 1; i >= 0; i--) {
    if ((counts[toLocalISO(addDays(today, -i))] ?? 0) > 0) {
      run++
      best = Math.max(best, run)
    } else run = 0
  }
  return best
}

export type WhaleMoodKey = 'calm' | 'cheer' | 'happy' | 'sad'

/** Tâm trạng Bubu ở màn Thống kê. */
export function whaleMood(opts: {
  totalThisYear: number
  streak: number
  today: number
}): WhaleMoodKey {
  if (opts.totalThisYear === 0) return 'calm' // tài khoản mới
  if (opts.streak > 0 && opts.today > 0) return 'cheer' // hôm nay đã tô màu
  if (opts.streak > 0) return 'happy' // còn giữ chuỗi, chưa xong hôm nay
  return 'sad' // mất streak
}

export type HeatDay = {
  /** YYYY-MM-DD theo giờ máy. */
  date: string
  dayOfMonth: number
  count: number
  level: 0 | 1 | 2 | 3 | 4
  /** Ngày sau hôm nay: ô để trống. */
  future: boolean
  isToday: boolean
}

/** Một tuần, từ Thứ Hai đến Chủ Nhật (quy tắc 9). */
export type HeatWeek = HeatDay[]

export type HeatGrid = {
  weeks: HeatWeek[]
  /** Nhãn tháng đặt trên cột chứa ngày 1, ví dụ { week: 3, label: 'Th8' }. */
  months: { week: number; label: string }[]
}

/** Thứ Hai của tuần chứa `d`. */
export function mondayOf(d: Date): Date {
  const offset = (d.getDay() + 6) % 7
  return addDays(d, -offset)
}

/**
 * Lưới heatmap: `weekCount` tuần (mặc định 52) kết thúc ở tuần chứa hôm nay.
 * Mỗi tuần có 7 ngày, bắt đầu từ Thứ Hai.
 */
export function buildWeeks(counts: DayCounts, today: Date = new Date(), weekCount = 52): HeatGrid {
  const todayISO = toLocalISO(today)
  const start = addDays(mondayOf(today), -(weekCount - 1) * 7)
  const weeks: HeatWeek[] = []
  const months: { week: number; label: string }[] = []

  for (let w = 0; w < weekCount; w++) {
    const week: HeatWeek = []
    for (let i = 0; i < 7; i++) {
      const d = addDays(start, w * 7 + i)
      const date = toLocalISO(d)
      const count = counts[date] ?? 0
      week.push({
        date,
        dayOfMonth: d.getDate(),
        count,
        level: heatLevel(count),
        future: date > todayISO,
        isToday: date === todayISO,
      })
      if (d.getDate() === 1) months.push({ week: w, label: `Th${d.getMonth() + 1}` })
    }
    weeks.push(week)
  }
  return { weeks, months }
}
