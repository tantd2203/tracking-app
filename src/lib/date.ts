/** Ngày theo giờ máy, dạng YYYY-MM-DD – dùng làm khoá cho heatmap. */
export function toLocalISO(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${d.getFullYear()}-${m}-${day}`
}

export function parseLocalISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function addDays(d: Date, n: number): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + n)
}

export const WEEKDAY_LONG = [
  'Chủ Nhật',
  'Thứ Hai',
  'Thứ Ba',
  'Thứ Tư',
  'Thứ Năm',
  'Thứ Sáu',
  'Thứ Bảy',
]
export const WEEKDAY_SHORT = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']

/** Tháng và năm dạng MM/YYYY, ví dụ "Thành viên từ 11/2025". */
export function formatMonthYear(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0')
  return `${m}/${d.getFullYear()}`
}
