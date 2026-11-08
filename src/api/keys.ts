/** Query key tập trung. Mọi hook dùng key từ đây để invalidate đúng chỗ. */
export const qk = {
  session: ['session'] as const,
  profile: ['profile'] as const,
  boards: ['boards'] as const,
  board: (id: string) => ['board', id] as const,
  card: (id: string) => ['card', id] as const,
  labels: ['labels'] as const,
  dayCounts: (from: string, to: string) => ['dayCounts', from, to] as const,
  dayCards: (day: string) => ['dayCards', day] as const,
}
