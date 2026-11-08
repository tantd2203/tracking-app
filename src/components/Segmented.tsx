type Option<T extends string> = { value: T; label: string }

type Props<T extends string> = {
  options: Option<T>[]
  value: T
  onChange: (value: T) => void
  className?: string
}

/** Nút chuyển kiểu Heatmap / Báo cáo, Tuần / Tháng, To Do / Doing / Done. */
export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className = '',
}: Props<T>) {
  return (
    <div className={`flex gap-1 rounded-[14px] bg-surface2 p-1 ${className}`} role="tablist">
      {options.map((o) => {
        const on = o.value === value
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={on}
            onClick={() => onChange(o.value)}
            className={[
              'h-9 flex-1 cursor-pointer rounded-[10px] px-3 text-sm font-black transition-colors',
              on ? 'bg-surface text-brand shadow-block-sm' : 'text-ink2',
            ].join(' ')}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
