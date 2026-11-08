import { useQuery, type QueryClient, type UseQueryResult } from '@tanstack/react-query'
import { addDays, toLocalISO } from '../lib/date'
import {
  bestStreak,
  currentStreak,
  whaleMood,
  type DayCounts,
  type WhaleMoodKey,
} from '../lib/heat'
import { db } from './client'
import { useSession } from './auth'
import { unwrap } from './errors'
import { qk } from './keys'

/** 364 ngày gần nhất: đủ cho heatmap 52 tuần và streak. */
export const YEAR_DAYS = 364

export function yearRange(now: Date = new Date()): { from: string; to: string } {
  return { from: toLocalISO(addDays(now, -(YEAR_DAYS - 1))), to: toLocalISO(now) }
}

/** Số card xong mỗi ngày trong khoảng [from, to]. Ngày không có thì không có key (coi như 0). */
export function useRangeCounts(from: string, to: string): UseQueryResult<DayCounts> {
  const { demo, session } = useSession()
  return useQuery({
    queryKey: qk.dayCounts(from, to),
    queryFn: async () => {
      const rows = unwrap(await db().rpc('day_counts', { p_from: from, p_to: to }))
      const counts: DayCounts = {}
      for (const row of rows) counts[row.day] = row.count
      return counts
    },
    enabled: !demo && Boolean(session),
  })
}

/** Số card xong mỗi ngày trong 364 ngày gần nhất. Tự cập nhật khi card vào Done (BE-06 invalidate). */
export function useYearCounts(): UseQueryResult<DayCounts> {
  const { from, to } = yearRange()
  return useRangeCounts(from, to)
}

/** Đọc số liệu năm đã có trong cache, không gọi mạng. Dùng để tính popup trước khi cache làm mới. */
export function getCachedYearCounts(
  qc: QueryClient,
  now: Date = new Date(),
): DayCounts | undefined {
  const { from, to } = yearRange(now)
  return qc.getQueryData<DayCounts>(qk.dayCounts(from, to))
}

export type StreakSummary = {
  streak: number
  record: number
  today: number
  totalYear: number
  activeDays: number
  mood: WhaleMoodKey
  loading: boolean
}

/** Gói số liệu streak dùng cho banner, hero và popup. */
export function useStreakSummary(): StreakSummary {
  const query = useYearCounts()
  const now = new Date()
  const counts = query.data ?? {}
  const streak = currentStreak(counts, now)
  const today = counts[toLocalISO(now)] ?? 0
  const values = Object.values(counts)
  const totalYear = values.reduce((sum, n) => sum + n, 0)
  return {
    streak,
    record: bestStreak(counts, now),
    today,
    totalYear,
    activeDays: values.filter((n) => n > 0).length,
    mood: whaleMood({ totalThisYear: totalYear, streak, today }),
    loading: query.isPending,
  }
}
