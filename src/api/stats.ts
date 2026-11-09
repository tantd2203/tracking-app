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

/**
 * Chuỗi logic thống kê (để nhớ khi sửa):
 * - Card hoàn thành có `completed_on` (ngày) và `completed_at`; xoá card = đặt `archived_at` (xoá mềm).
 * - DB: `day_counts` (heatmap, streak, báo cáo) và `day_cards` (danh sách trong một ngày) đều
 *   bỏ card có `archived_at` (migration 0003, 0004). `board_stats` cũng bỏ card đã xoá từ đầu.
 * - Client: heatmap và streak tính từ `useRangeCounts` (lib/heat.ts). Danh sách lấy từ `useDayCards`.
 * - Mọi mutation làm đổi `completed_on` hoặc `archived_at` (move, delete, restore) phải làm mới
 *   cả `['dayCounts']` và `['dayCards']` (xem src/api/cards.ts).
 */

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

export type DayCard = { id: string; title: string; boardName: string }

/** Card đã xong trong một ngày, không gồm card đã xoá mềm (RPC day_cards, migration 0003). */
export function useDayCards(day: string): UseQueryResult<DayCard[]> {
  const { demo, session } = useSession()
  return useQuery({
    queryKey: qk.dayCards(day),
    queryFn: async () => {
      const rows = unwrap(await db().rpc('day_cards', { p_day: day }))
      return rows.map((r) => ({ id: r.card_id, title: r.title, boardName: r.board_name }))
    },
    enabled: !demo && Boolean(session) && Boolean(day),
  })
}

/** Số card đang quá hạn ở mọi board (chưa xong, chưa lưu trữ, có hạn trước hôm nay). */
export function useOverdueCount(): UseQueryResult<number> {
  const { demo, session } = useSession()
  return useQuery({
    queryKey: qk.overdue,
    queryFn: async () => {
      const rows = unwrap(await db().rpc('board_stats', { p_today: toLocalISO(new Date()) }))
      return rows.reduce((sum, r) => sum + r.overdue, 0)
    },
    enabled: !demo && Boolean(session),
  })
}

export type OverdueCard = { id: string; title: string; dueDate: string; boardName: string }

/** Danh sách card quá hạn, cũ nhất trước. */
export function useOverdueCards(): UseQueryResult<OverdueCard[]> {
  const { demo, session } = useSession()
  return useQuery({
    queryKey: [...qk.overdue, 'list'],
    queryFn: async () => {
      const res = await db()
        .from('cards')
        .select('id, title, due_date, boards(name)')
        .is('archived_at', null)
        .is('completed_at', null)
        .lt('due_date', toLocalISO(new Date()))
        .order('due_date', { ascending: true })
      const rows = unwrap(res) as unknown as {
        id: string
        title: string
        due_date: string
        boards: { name: string } | null
      }[]
      return rows.map((r) => ({
        id: r.id,
        title: r.title,
        dueDate: r.due_date,
        boardName: r.boards?.name ?? '',
      }))
    },
    enabled: !demo && Boolean(session),
  })
}
