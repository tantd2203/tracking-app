/** Bỏ dấu tiếng Việt (đ → d) và viết thường, để gõ "dalat" vẫn khớp "Đà Lạt". */
export function normalizeVi(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
}

/** Board khớp khi từ khoá nằm trong tên hoặc mô tả (đã bỏ dấu). Từ khoá rỗng thì khớp tất cả. */
export function matchBoard(board: { name: string; description: string }, query: string): boolean {
  const q = normalizeVi(query.trim())
  if (!q) return true
  return normalizeVi(`${board.name} ${board.description}`).includes(q)
}
