/**
 * Chữ cái avatar: chữ đầu của 2 từ cuối trong tên (tên tiếng Việt viết họ trước).
 * "Nguyễn Minh Anh" → "MA", "bubu" → "B", tên trống → "?".
 */
export function initials(name: string): string {
  const words = name.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return '?'
  const picked = words.slice(-2)
  return picked.map((w) => [...w][0].toUpperCase()).join('')
}
