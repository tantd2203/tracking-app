import { Link } from 'react-router'
import type { BoardWithStats } from '../../api/boards'
import { boardColor } from '../../lib/palette'

type Props = { board: BoardWithStats; onMenu: () => void }

/** Thẻ board trong danh sách: chữ cái màu, số liệu, thanh tiến độ. */
export function BoardTile({ board, onMenu }: Props) {
  const color = boardColor(board.color)
  const inProgress = board.doing
  const subtitle = board.description || (board.total === 0 ? 'Chưa có card nào' : '')

  return (
    <div className="flex items-center gap-3 rounded-card border-2 border-line bg-surface p-3.5 shadow-block">
      <Link to={`/boards/${board.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative shrink-0">
          <div
            className="grid size-14 place-items-center rounded-2xl text-2xl font-black text-white"
            style={{ background: color.c, boxShadow: `0 4px 0 ${color.shade}` }}
          >
            {board.name.trim().charAt(0).toUpperCase() || '?'}
          </div>
          {board.pinned && (
            <span
              aria-label="Đã ghim"
              className="absolute -top-1 -right-1 size-3.5 rounded-full border-2 border-surface bg-brand"
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[17px] font-black">{board.name}</p>
          {subtitle && <p className="truncate text-[13px] font-bold text-ink2">{subtitle}</p>}
          <p className="mt-0.5 text-[13px] font-bold text-ink2">
            {board.total} card · {inProgress} đang làm
            {board.overdue > 0 && (
              <span className="ml-1.5 font-black text-red">· {board.overdue} quá hạn</span>
            )}
          </p>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
            <div
              className="h-full rounded-full transition-[width]"
              style={{ width: `${board.pct}%`, background: color.c }}
            />
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label="Tuỳ chọn board"
        onClick={onMenu}
        className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border-2 border-line text-lg font-black text-ink2"
      >
        ⋯
      </button>
    </div>
  )
}
