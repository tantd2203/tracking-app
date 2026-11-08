import { Link } from 'react-router'
import { useOverdueCards } from '../../api/stats'
import { BottomSheet } from '../../components/BottomSheet'
import { toLocalISO } from '../../lib/date'
import { dueLabel } from '../../lib/due'

type Props = { open: boolean; onClose: () => void }

/** Danh sách card quá hạn. Chạm một dòng để mở card. */
export function OverdueSheet({ open, onClose }: Props) {
  const query = useOverdueCards()
  if (!open) return null
  const today = toLocalISO(new Date())

  return (
    <BottomSheet open onClose={onClose} title="Card quá hạn">
      <div className="flex flex-col gap-2 pb-4">
        {query.isPending && <p className="font-bold text-ink2">Đang tải…</p>}
        {query.isError && <p className="font-bold text-ink2">Không tải được danh sách.</p>}
        {query.data?.length === 0 && <p className="font-bold text-ink2">Tuyệt, không có!</p>}
        {(query.data ?? []).map((c) => (
          <Link
            key={c.id}
            to={`/cards/${c.id}`}
            onClick={onClose}
            className="rounded-2xl border-2 border-red-line bg-surface px-4 py-3 no-underline"
          >
            <p className="truncate text-[15px] font-extrabold text-ink">{c.title}</p>
            <p className="truncate text-[13px] font-bold text-ink2">{c.boardName}</p>
            <p className="text-[13px] font-black text-red">{dueLabel(c.dueDate, today)?.text}</p>
          </Link>
        ))}
      </div>
    </BottomSheet>
  )
}
