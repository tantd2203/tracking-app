/** Store popup ăn mừng, theo cùng kiểu với toast. Mở bằng `celebrate()`, đóng bằng `dismissCelebrate()`. */
export type CelebrateArgs = {
  /** Tên card vừa hoàn thành. */
  title: string
  /** Card đầu tiên trong ngày. */
  first: boolean
  /** Streak sau khi hoàn thành. */
  streak: number
  /** Số card đã xong hôm nay. */
  today: number
  /** Đường dẫn để quay về khi đóng (ví dụ từ màn chi tiết card về Board). */
  returnTo?: string
}

let state: CelebrateArgs | null = null
const listeners = new Set<() => void>()

function emit() {
  listeners.forEach((l) => l())
}

export function celebrate(args: CelebrateArgs) {
  state = args
  emit()
}

export function dismissCelebrate() {
  if (!state) return
  state = null
  emit()
}

export function getCelebrateState(): CelebrateArgs | null {
  return state
}

export function subscribeCelebrate(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
