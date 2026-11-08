import { forwardRef, type InputHTMLAttributes } from 'react'

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label?: string
  error?: string
  /** Hiện bộ đếm "12/40" khi có maxLength */
  showCounter?: boolean
}

export const TextField = forwardRef<HTMLInputElement, Props>(function TextField(
  { label, error, showCounter, maxLength, value, className = '', ...rest },
  ref,
) {
  const length = typeof value === 'string' ? value.length : 0
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      {(label || (showCounter && maxLength)) && (
        <span className="flex items-center justify-between text-[13px] font-extrabold text-ink2">
          <span>{label}</span>
          {showCounter && maxLength ? (
            <span>
              {length}/{maxLength}
            </span>
          ) : null}
        </span>
      )}
      <input
        ref={ref}
        value={value}
        maxLength={maxLength}
        {...rest}
        className={[
          'h-14 rounded-2xl border-2 bg-surface px-[18px] text-base font-bold text-ink outline-none',
          'placeholder:text-ink2/70 focus:border-brand',
          error ? 'border-brand' : 'border-line',
        ].join(' ')}
      />
      {error && <span className="text-[13px] font-bold text-red">{error}</span>}
    </label>
  )
})
