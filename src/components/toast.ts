/* ------------------------------------------------------------------
   Toast (1,8 giây) và thanh Hoàn tác (5 giây) dùng chung cho cả app.
   Gọi toast('Đã lưu') hoặc showUndo('Đã xoá board', () => khôiPhục())
   từ bất kỳ đâu, <ToastHost /> đặt một lần trong layout.
------------------------------------------------------------------- */

export type ToastState = {
  toast: string | null
  undo: { message: string; onUndo: () => void } | null
}

let state: ToastState = { toast: null, undo: null }
const listeners = new Set<() => void>()
let toastTimer: ReturnType<typeof setTimeout> | undefined
let undoTimer: ReturnType<typeof setTimeout> | undefined

function set(patch: Partial<ToastState>) {
  state = { ...state, ...patch }
  listeners.forEach((l) => l())
}

export function toast(message: string) {
  clearTimeout(toastTimer)
  set({ toast: message })
  toastTimer = setTimeout(() => set({ toast: null }), 1800)
}

export function showUndo(message: string, onUndo: () => void) {
  clearTimeout(undoTimer)
  set({ undo: { message, onUndo } })
  undoTimer = setTimeout(() => set({ undo: null }), 5000)
}

export function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function getToastState() {
  return state
}

export function dismissUndo(runUndo: boolean) {
  clearTimeout(undoTimer)
  if (runUndo) state.undo?.onUndo()
  set({ undo: null })
}
