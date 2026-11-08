import { useEffect, useSyncExternalStore } from 'react'
import { router } from '../app/router'
import { heatLevel } from '../lib/heat'
import { Button3D } from './Button3D'
import { dismissCelebrate, getCelebrateState, subscribeCelebrate } from './celebrate'
import { Whale } from './Whale'

/** Màu ô heatmap theo mức 0–4 (khớp `heatLevel`). */
const HEAT_BG = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4'] as const

/** Popup ăn mừng khi hoàn thành card. Đặt một lần trong main.tsx. */
export function CelebrateOverlay() {
  const s = useSyncExternalStore(subscribeCelebrate, getCelebrateState)

  useEffect(() => {
    if (s && navigator.vibrate) navigator.vibrate([20, 40, 20])
  }, [s])

  useEffect(() => {
    if (!s) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
    // close đọc `s` hiện tại nên chỉ cần đăng ký lại khi `s` đổi.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s])

  if (!s) return null

  function close() {
    const returnTo = s?.returnTo
    dismissCelebrate()
    if (returnTo) void router.navigate(returnTo)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-6">
      <button
        type="button"
        aria-label="Đóng"
        onClick={close}
        className="absolute inset-0 animate-fade-in cursor-default bg-overlay"
      />
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebrate-title"
        className="relative w-full max-w-[340px] animate-pop rounded-card border-2 border-line bg-surface px-5 pt-5 pb-6 text-center shadow-block"
      >
        <div className="mx-auto w-[190px]">
          <Whale mood="cheer" size={190} burst />
        </div>
        <h2 id="celebrate-title" className="mt-1 text-2xl font-black">
          {s.first ? 'Ô hôm nay xanh rồi!' : 'Tuyệt vời!'}
        </h2>
        <p className="mt-1 truncate text-[15px] font-bold text-ink2">{s.title}</p>

        <div className="mt-4 flex items-center justify-center gap-2">
          <span className="rounded-full bg-chip px-3 py-1.5 text-sm font-black text-chip-ink">
            Streak {s.streak} ngày
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-bg px-3 py-1.5 text-sm font-black text-ink2">
            <span
              aria-hidden="true"
              className={`size-3.5 rounded-[4px] ${HEAT_BG[heatLevel(s.today)]}`}
            />
            {s.today} card hôm nay
          </span>
        </div>

        <div className="mt-5">
          <Button3D block onClick={close}>
            TIẾP TỤC
          </Button3D>
        </div>
      </section>
    </div>
  )
}
