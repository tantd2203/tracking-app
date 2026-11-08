import type { ReactNode } from 'react'

type Props = {
  tone: 'brand' | 'surface'
  label: string
  children: ReactNode
  footer?: ReactNode
}

const TONE = {
  brand: 'bg-brand text-white shadow-[0_4px_0_var(--color-brand-shade)] border-transparent',
  surface: 'bg-surface text-ink border-line shadow-block',
} as const

/** Thẻ số liệu nhỏ trong hàng KPI của báo cáo. */
export function KpiCard({ tone, label, children, footer }: Props) {
  return (
    <div className={`flex min-w-0 flex-1 flex-col rounded-card border-2 p-3 ${TONE[tone]}`}>
      <p className="text-[12px] font-black tracking-[0.4px] uppercase opacity-80">{label}</p>
      <div className="mt-1">{children}</div>
      {footer && (
        <div className="mt-1.5 text-[12px] leading-snug font-bold opacity-90">{footer}</div>
      )}
    </div>
  )
}
