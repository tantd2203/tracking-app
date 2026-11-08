import { useSyncExternalStore } from 'react'

/** Trạng thái đang kéo card trên board. Dùng để ẩn TabBar và hiện thanh thả. */
let dragging = false
const listeners = new Set<() => void>()

export function setDragging(value: boolean) {
  if (dragging === value) return
  dragging = value
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function useIsDragging(): boolean {
  return useSyncExternalStore(subscribe, () => dragging)
}
