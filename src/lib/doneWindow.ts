import { addDays, toLocalISO } from './date'

/**
 * Cột Done chỉ hiện card hoàn thành trong số ngày này (tính cả hôm nay).
 * Card cũ hơn vẫn nằm trong DB và vẫn được tính trong thống kê, chỉ bị ẩn khỏi cột.
 */
export const DONE_WINDOW_DAYS = 7

/** `completedOn` và `today` là chuỗi YYYY-MM-DD theo giờ máy. Card không có ngày thì hiện. */
export function isRecentDone(
  completedOn: string | null,
  today: string,
  days: number = DONE_WINDOW_DAYS,
): boolean {
  if (!completedOn) return true
  const [y, m, d] = today.split('-').map(Number)
  const cutoff = toLocalISO(addDays(new Date(y, m - 1, d), -(days - 1)))
  return completedOn >= cutoff
}

/**
 * Vị trí (theo danh sách đang hiện) đặt vạch chèn.
 * `fullIds` là toàn bộ card trong list, `dropAt` là vị trí tính trên toàn bộ list (không kể card đang kéo).
 * Vạch đặt trước card hiện đầu tiên có vị trí đầy đủ >= dropAt; không có thì đặt cuối.
 * Trả về null khi không có vạch.
 */
export function dropBarSlot(
  fullIds: string[],
  activeId: string | null,
  visibleIds: string[],
  dropAt: number | null,
): number | null {
  if (dropAt === null) return null
  const fullIndex = new Map<string, number>()
  let i = 0
  for (const id of fullIds) {
    if (id !== activeId) fullIndex.set(id, i++)
  }
  for (let k = 0; k < visibleIds.length; k++) {
    const id = visibleIds[k]
    if (id === activeId) continue
    if ((fullIndex.get(id) ?? Infinity) >= dropAt) return k
  }
  return visibleIds.length
}
