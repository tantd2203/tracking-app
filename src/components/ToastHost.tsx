import { useSyncExternalStore } from 'react'
import { dismissUndo, getToastState, subscribe, toast } from './toast'

/** Đặt một lần trong main.tsx để hiện toast và thanh Hoàn tác. */
export function ToastHost() {
  const s = useSyncExternalStore(subscribe, getToastState)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(7rem+env(safe-area-inset-bottom))] z-[60] flex flex-col items-center gap-2 px-4">
      {s.undo && (
        <div className="pointer-events-auto flex w-full max-w-sm animate-pop items-center justify-between gap-3 rounded-2xl bg-ink px-4 py-3 text-[15px] font-extrabold text-surface">
          <span>{s.undo.message}</span>
          <button
            className="cursor-pointer font-black text-heat-2"
            onClick={() => {
              dismissUndo(true)
              toast('Đã hoàn tác')
            }}
          >
            Hoàn tác
          </button>
        </div>
      )}
      {s.toast && (
        <div className="animate-pop rounded-full bg-ink px-4 py-2.5 text-sm font-extrabold text-surface">
          {s.toast}
        </div>
      )}
    </div>
  )
}
