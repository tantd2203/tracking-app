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
