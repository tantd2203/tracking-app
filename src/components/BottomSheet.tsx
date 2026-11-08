import { useEffect, type ReactNode } from 'react'

type Props = {
  open: boolean
  onClose: () => void
  title?: string
  children: ReactNode
}

/** Sheet trượt từ dưới lên, nền mờ phía sau; chạm nền hoặc Esc để đóng. */
export function BottomSheet({ open, onClose, title, children }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end">
      <button
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in cursor-default bg-overlay"
      />
      <div
        role="dialog"
        aria-modal="true"
        className="safe-bottom relative animate-sheet-up rounded-t-[28px] bg-surface px-5 pt-3"
      >
        <div className="mx-auto mb-3 h-1.5 w-11 rounded-full bg-line" />
        {title && <h2 className="mb-4 text-xl font-black">{title}</h2>}
        {children}
      </div>
    </div>
  )
}
