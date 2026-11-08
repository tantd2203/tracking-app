import { useEffect, type ReactNode } from 'react'
import { Button3D } from './Button3D'
import { Whale } from './Whale'

type Props = {
  open: boolean
  title: string
  text: ReactNode
  confirmLabel: string
  onConfirm: () => void
  onClose: () => void
}

/** Hộp xác nhận ở giữa màn hình, có Bubu buồn. Chạm nền hoặc Esc để huỷ. */
export function ConfirmDialog({ open, title, text, confirmLabel, onConfirm, onClose }: Props) {
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <button
        aria-label="Đóng"
        onClick={onClose}
        className="absolute inset-0 animate-fade-in cursor-default bg-overlay"
      />
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative w-full max-w-[340px] animate-pop rounded-card border-2 border-line bg-surface px-5 pt-5 pb-5 text-center shadow-block"
      >
        <div className="mx-auto w-[120px]">
          <Whale mood="sad" size={120} bob={false} />
        </div>
        <h2 id="confirm-title" className="mt-2 text-xl font-black">
          {title}
        </h2>
        <p className="mt-1 text-[15px] font-bold text-ink2">{text}</p>
        <div className="mt-5 flex flex-col gap-2.5">
          <Button3D variant="danger" block onClick={onConfirm}>
            {confirmLabel}
          </Button3D>
          <Button3D variant="secondary" block onClick={onClose}>
            Huỷ
          </Button3D>
        </div>
      </div>
    </div>
  )
}
