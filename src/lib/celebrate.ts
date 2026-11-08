import { toLocalISO } from './date'
import { currentStreak, type DayCounts } from './heat'

export type Completion = {
  /** Đây là card đầu tiên hoàn thành trong ngày. */
  first: boolean
  /** Số card đã xong hôm nay, kể cả card vừa hoàn thành. */
  today: number
  /** Streak sau khi tính card vừa hoàn thành. */
  streak: number
}

/**
 * Số liệu cho popup ăn mừng, tính từ dữ liệu trước khi hoàn thành (không chờ server).
 * `counts` là số card xong theo ngày trước khi card được chuyển vào Done.
 */
export function afterCompletion(counts: DayCounts, now: Date = new Date()): Completion {
  const key = toLocalISO(now)
  const before = counts[key] ?? 0
  const next: DayCounts = { ...counts, [key]: before + 1 }
  return {
    first: before === 0,
    today: before + 1,
    streak: currentStreak(next, now),
  }
}
