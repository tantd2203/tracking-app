import { useState } from 'react'
import { useArchiveBoard, type BoardWithStats } from '../../api/boards'
import { toast } from '../../components/toast'

/** Mục "Đã lưu trữ": mở/đóng, mỗi board có nút Khôi phục. Chỉ hiện khi có board đã lưu trữ. */
export function ArchivedSection({ boards }: { boards: BoardWithStats[] }) {
  const [open, setOpen] = useState(false)
  const restore = useArchiveBoard()

  if (boards.length === 0) return null

  return (
    <section className="mt-5">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between px-1 py-2 text-[15px] font-black text-ink2"
      >
        <span>Đã lưu trữ · {boards.length}</span>
        <span>{open ? 'Ẩn ▴' : 'Xem ▾'}</span>
      </button>

      {open && (
        <ul className="mt-2 flex flex-col gap-2">
          {boards.map((board) => (
            <li
              key={board.id}
              className="flex items-center justify-between gap-3 rounded-card border-2 border-line bg-surface px-4 py-3"
            >
              <span className="min-w-0 flex-1 truncate font-black">{board.name}</span>
              <button
                type="button"
                disabled={restore.isPending}
                onClick={() =>
                  restore.mutate(
                    { id: board.id, archived: false },
                    { onSuccess: () => toast(`Đã khôi phục “${board.name}”`) },
                  )
                }
                className="h-9 cursor-pointer rounded-xl border-2 border-line px-3 text-sm font-black text-brand disabled:opacity-50"
              >
                Khôi phục
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
