type Props = {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: string
}

/** Công tắc bật/tắt – dùng cho Chế độ tối, Nhắc nhở. */
export function Toggle({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-[50px] flex-none cursor-pointer rounded-full transition-colors ${
        checked ? 'bg-brand' : 'bg-line'
      }`}
    >
      <span
        className="absolute top-[3px] left-[3px] size-[22px] rounded-full bg-white shadow transition-transform"
        style={{ transform: `translateX(${checked ? 22 : 0}px)` }}
      />
    </button>
  )
}
