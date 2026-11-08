type Props = {
  label: string
  sub: string
  canPrev: boolean
  canNext: boolean
  onPrev: () => void
  onNext: () => void
}

const NAV =
  'grid size-10 cursor-pointer place-items-center rounded-xl border-2 border-line bg-surface text-lg font-black text-ink shadow-block-sm disabled:cursor-default disabled:opacity-40'

/** Hàng chọn kỳ: ‹ tên kỳ › và dòng phụ. Nút mờ khi hết giới hạn. */
export function PeriodPicker({ label, sub, canPrev, canNext, onPrev, onNext }: Props) {
  return (
    <div className="flex items-center justify-between gap-3">
      <button
        type="button"
        aria-label="Kỳ trước"
        disabled={!canPrev}
        onClick={onPrev}
        className={NAV}
      >
        ‹
      </button>
      <div className="min-w-0 text-center">
        <p className="truncate text-[17px] font-black">{label}</p>
        <p className="text-[13px] font-bold text-ink2">{sub}</p>
      </div>
      <button
        type="button"
        aria-label="Kỳ sau"
        disabled={!canNext}
        onClick={onNext}
        className={NAV}
      >
        ›
      </button>
    </div>
  )
}
