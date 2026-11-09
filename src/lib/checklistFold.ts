/** Từ ngưỡng này trở lên, việc con đã xong được gom lại để danh sách gọn hơn. */
export const FOLD_MIN_DONE = 5

type Item = { id: string; done: boolean }

/**
 * Tách việc con thành phần hiện và phần bị gom.
 * - Chưa đủ ngưỡng, hoặc đang mở rộng: hiện hết.
 * - Đủ ngưỡng và đang gọn: ẩn việc đã xong, trừ những việc vừa tick trong phiên (`keep`),
 *   để việc vừa đánh dấu không biến mất ngay dưới tay người dùng.
 */
export function foldChecklist<T extends Item>(
  items: T[],
  opts: { expanded: boolean; keep: ReadonlySet<string> },
): { visible: T[]; hiddenCount: number } {
  const doneCount = items.filter((i) => i.done).length
  if (opts.expanded || doneCount < FOLD_MIN_DONE) {
    return { visible: items, hiddenCount: 0 }
  }
  const visible = items.filter((i) => !i.done || opts.keep.has(i.id))
  return { visible, hiddenCount: items.length - visible.length }
}
