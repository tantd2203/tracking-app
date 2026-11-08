import { useLayoutEffect, useRef } from 'react'
import { isEnterKey } from '../../lib/keys'

type Props = {
  value: string
  onChange: (value: string) => void
  onBlur?: () => void
  placeholder?: string
  label: string
  /** Một dòng: Enter thì bỏ focus, xuống dòng bị đổi thành khoảng trắng. */
  singleLine?: boolean
  className?: string
}

/** Ô nhập nhiều dòng tự giãn theo nội dung. */
export function AutoTextarea({
  value,
  onChange,
  onBlur,
  placeholder,
  label,
  singleLine = false,
  className = '',
}: Props) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])

  return (
    <textarea
      ref={ref}
      rows={1}
      aria-label={label}
      value={value}
      placeholder={placeholder}
      onChange={(e) =>
        onChange(singleLine ? e.target.value.replace(/\r?\n/g, ' ') : e.target.value)
      }
      onBlur={onBlur}
      onKeyDown={(e) => {
        if (singleLine && isEnterKey(e)) {
          e.preventDefault()
          e.currentTarget.blur()
        }
      }}
      className={`w-full resize-none bg-transparent outline-none placeholder:text-ink2/70 ${className}`}
    />
  )
}
