import { parseLocalISO } from './date'

export type DueInfo = {
  /** Chữ hiện trên chip: "Quá hạn 3 ngày", "Ngày mai", "Hôm nay" hoặc "dd/mm". */
  text: string
  /** Hạn đã qua. */
  overdue: boolean
  /** Hạn trong hôm nay hoặc ngày mai. */
  soon: boolean
}

const DAY_MS = 86_400_000

/** Số ngày từ `today` tới `due` (âm nếu đã qua). Làm tròn để tránh lệch do giờ tiết kiệm ánh sáng. */
function daysUntil(due: string, today: string): number {
  return Math.round((parseLocalISO(due).getTime() - parseLocalISO(today).getTime()) / DAY_MS)
}

/**
 * Nhãn hạn chót của card. `due` và `today` dạng YYYY-MM-DD theo giờ máy.
 * Không có hạn thì trả về `null`.
 */
export function dueLabel(due: string | null, today: string): DueInfo | null {
  if (!due) return null
  const diff = daysUntil(due, today)
  if (diff < 0) return { text: `Quá hạn ${-diff} ngày`, overdue: true, soon: false }
  if (diff === 0) return { text: 'Hôm nay', overdue: false, soon: true }
  if (diff === 1) return { text: 'Ngày mai', overdue: false, soon: true }
  const [, m, d] = due.split('-')
  return { text: `${d}/${m}`, overdue: false, soon: false }
}
