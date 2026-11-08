import { useOnline } from '../app/useOnline'

/** Banner nhỏ phía trên khi mất mạng. Ứng dụng vẫn mở được nhờ bản đã lưu sẵn. */
export function OfflineBanner() {
  const online = useOnline()
  if (online) return null
  return (
    <div
      role="status"
      className="safe-top pointer-events-none fixed inset-x-0 top-0 z-[65] bg-ink px-4 pb-2.5 text-center text-[13px] font-extrabold text-surface"
    >
      Mất kết nối – thay đổi sẽ không được lưu
    </div>
  )
}
