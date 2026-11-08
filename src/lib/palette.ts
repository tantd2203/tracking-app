/** Màu board (4) và nhãn (5), theo plan/design/README.md. Đây là nơi duy nhất khai báo mã màu của board và nhãn. */
export const BOARD_COLORS = [
  { c: '#0284C7', shade: '#026199' },
  { c: 'oklch(0.62 0.17 290)', shade: 'oklch(0.5 0.17 290)' },
  { c: 'oklch(0.74 0.15 65)', shade: 'oklch(0.62 0.15 65)' },
  { c: 'oklch(0.65 0.18 340)', shade: 'oklch(0.53 0.18 340)' },
] as const

export const LABEL_COLORS = [
  { c: '#0284C7', fg: '#fff' },
  { c: 'oklch(0.58 0.17 290)', fg: '#fff' },
  { c: 'oklch(0.82 0.13 80)', fg: '#3B2A05' },
  { c: 'oklch(0.6 0.19 345)', fg: '#fff' },
  { c: 'oklch(0.52 0.14 265)', fg: '#fff' },
] as const

export const PRIORITY = {
  none: { name: 'Không', level: 0 },
  low: { name: 'Thấp', level: 1, c: '#7DD3FC', hint: 'Khi rảnh' },
  med: { name: 'Vừa', level: 2, c: '#0EA5E9', hint: 'Làm trong tuần' },
  high: { name: 'Cao', level: 3, c: 'oklch(0.72 0.15 65)', hint: 'Làm trước tiên' },
} as const

/** Màu của board theo số thứ tự `color` (0–3). */
export function boardColor(color: number) {
  return BOARD_COLORS[((color % 4) + 4) % 4]
}
