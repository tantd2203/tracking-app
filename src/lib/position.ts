/** Khoảng cách mặc định khi chèn ở đầu hoặc cuối list. Khớp với RPC create_card (+1024). */
const STEP = 1024

/** Khoảng cách nhỏ hơn mức này thì cần đánh số lại cả list. */
const MIN_GAP = 0.0001

/**
 * Vị trí của card chèn giữa `a` (card phía trên) và `b` (card phía dưới).
 * Không có `a` thì nằm trước `b`; không có `b` thì nằm sau `a`; không có cả hai thì là vị trí đầu tiên.
 */
export function positionBetween(a?: number, b?: number): number {
  if (a === undefined && b === undefined) return STEP
  if (a === undefined) return (b as number) - STEP
  if (b === undefined) return a + STEP
  return (a + b) / 2
}

/** True khi có hai vị trí liền nhau cách nhau dưới 0.0001, lúc đó cần đánh số lại list. */
export function needsRebalance(positions: number[]): boolean {
  const sorted = [...positions].sort((x, y) => x - y)
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] - sorted[i - 1] < MIN_GAP) return true
  }
  return false
}
