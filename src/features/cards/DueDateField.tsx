import { parseLocalISO } from '../../lib/date'
import { dueLabel } from '../../lib/due'

const WEEKDAY = ['CN', 'THỨ 2', 'THỨ 3', 'THỨ 4', 'THỨ 5', 'THỨ 6', 'THỨ 7']

type Props = {
  due: string | null
  today: string
  onChange: (due: string | null) => void
}

/**
 * Hạn chót: ô lịch bên trái, ngày dd/mm/yyyy, dòng đỏ nếu quá hạn.
 * Chạm vào hàng để mở ô chọn ngày gốc của trình duyệt (trên iPhone là bộ chọn ngày của iOS).
 */
export function DueDateField({ due, today, onChange }: Props) {
  const info = dueLabel(due, today)
  const date = due ? parseLocalISO(due) : null
  const [y, m, d] = due ? due.split('-') : []

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-black tracking-[0.8px] text-ink2 uppercase">Hạn chót</h2>
      <div
        className={`relative flex items-center gap-3 rounded-card border-2 bg-surface p-3 shadow-block ${
          info?.overdue ? 'border-red-line' : 'border-line'
        }`}
      >
        {date ? (
          <>
            <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-brand text-white shadow-[0_4px_0_var(--color-brand-shade)]">
              <span className="text-[10px] leading-none font-black">{WEEKDAY[date.getDay()]}</span>
              <span className="text-2xl leading-none font-black">{date.getDate()}</span>
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-black">{`${d}/${m}/${y}`}</span>
              {info?.overdue && (
                <span className="block text-[13px] font-black text-red">{info.text}</span>
              )}
            </span>
            <button
              type="button"
              aria-label="Xoá hạn chót"
              onClick={() => onChange(null)}
              className="relative z-10 grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border-2 border-line text-lg font-black text-ink2"
            >
              ×
            </button>
          </>
        ) : (
          <span className="flex-1 font-black text-ink2">Chọn hạn chót</span>
        )}

        <input
          type="date"
          aria-label="Chọn hạn chót"
          value={due ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </div>
    </section>
  )
}
