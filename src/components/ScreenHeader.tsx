import type { ReactNode } from 'react'
import { useNavigate } from 'react-router'
import { IconBack } from './icons'

type Props = {
  title: string
  subtitle?: string
  /** Có nút quay lại hay không */
  back?: boolean
  right?: ReactNode
}

export function ScreenHeader({ title, subtitle, back, right }: Props) {
  const navigate = useNavigate()
  return (
    <header className="safe-top flex items-center gap-3 px-5 pb-3">
      {back && (
        <button
          aria-label="Quay lại"
          onClick={() => navigate(-1)}
          className="grid size-10 flex-none cursor-pointer place-items-center rounded-xl border-2 border-line bg-surface text-ink shadow-block-sm active:translate-y-[3px] active:shadow-none"
        >
          <IconBack size={18} />
        </button>
      )}
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[28px] leading-tight font-black">{title}</h1>
        {subtitle && <p className="truncate text-[13px] font-bold text-ink2">{subtitle}</p>}
      </div>
      {right}
    </header>
  )
}
