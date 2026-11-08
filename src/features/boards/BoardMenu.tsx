import {
  useArchiveBoard,
  useDuplicateBoard,
  useUpdateBoard,
  type BoardWithStats,
} from '../../api/boards'
import { toastError } from '../../api/errors'
import { BottomSheet } from '../../components/BottomSheet'
import { toast } from '../../components/toast'
import { boardColor } from '../../lib/palette'

type Props = {
  board: BoardWithStats
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}

type Item = {
  key: string
  glyph: string
  color: string
  name: string
  sub: string
  danger?: boolean
  run: () => void
}

/** Menu ⋯ của một board: sửa, ghim, nhân bản, lưu trữ, xoá. */
export function BoardMenu({ board, onClose, onEdit, onDelete }: Props) {
  const update = useUpdateBoard()
  const duplicate = useDuplicateBoard()
  const archive = useArchiveBoard()
  const color = boardColor(board.color)

  function done(message: string) {
    return {
      onSuccess: () => {
        onClose()
        toast(message)
      },
      onError: (e: Error) => toastError(e),
    }
  }

  const items: Item[] = [
    {
      key: 'edit',
      glyph: '✎',
      color: 'oklch(0.52 0.14 265)',
      name: 'Sửa board',
      sub: 'Tên, mô tả và màu',
      run: onEdit,
    },
    {
      key: 'pin',
      glyph: board.pinned ? '↓' : '↑',
      color: 'oklch(0.62 0.17 290)',
      name: board.pinned ? 'Bỏ ghim' : 'Ghim lên đầu',
      sub: board.pinned ? 'Trả về vị trí bình thường' : 'Luôn hiện trên cùng danh sách',
      run: () =>
        update.mutate(
          { id: board.id, patch: { pinned: !board.pinned } },
          done(board.pinned ? 'Đã bỏ ghim' : 'Đã ghim'),
        ),
    },
    {
      key: 'duplicate',
      glyph: '⧉',
      color: 'oklch(0.65 0.18 340)',
      name: 'Nhân bản',
      sub: 'Sao chép board kèm toàn bộ card',
      run: () => duplicate.mutate({ id: board.id }, done('Đã nhân bản')),
    },
    {
      key: 'archive',
      glyph: '▾',
      color: 'oklch(0.74 0.15 65)',
      name: 'Lưu trữ',
      sub: 'Ẩn khỏi danh sách, khôi phục bất cứ lúc nào',
      run: () =>
        archive.mutate({ id: board.id, archived: true }, done(`Đã lưu trữ “${board.name}”`)),
    },
    {
      key: 'delete',
      glyph: '×',
      color: 'var(--color-red)',
      name: 'Xoá board',
      sub: '',
      danger: true,
      run: onDelete,
    },
  ]

  return (
    <BottomSheet open onClose={onClose}>
      <div className="flex flex-col gap-3 pb-4">
        <div className="flex items-center gap-3 border-b-2 border-line pb-3">
          <div
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-2xl text-xl font-black text-white"
            style={{ background: color.c, boxShadow: `0 4px 0 ${color.shade}` }}
          >
            {board.name.trim().charAt(0).toUpperCase() || '?'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-black">{board.name}</p>
            <p className="text-[13px] font-bold text-ink2">
              {board.total} card · {board.doing} đang làm
              {board.overdue > 0 && (
                <span className="font-black text-red"> · {board.overdue} quá hạn</span>
              )}
            </p>
          </div>
        </div>

        {items.map((item) => (
          <button
            key={item.key}
            type="button"
            onClick={item.run}
            disabled={update.isPending || duplicate.isPending || archive.isPending}
            className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl px-2 py-2 text-left hover:bg-bg disabled:opacity-60"
          >
            <span
              aria-hidden="true"
              className="grid size-10 shrink-0 place-items-center rounded-xl text-lg font-black text-white"
              style={{ background: item.color }}
            >
              {item.glyph}
            </span>
            <span className="min-w-0 flex-1">
              <span className={`block text-[16px] font-black ${item.danger ? 'text-red' : ''}`}>
                {item.name}
              </span>
              {item.sub && (
                <span className="block text-[13px] font-bold text-ink2">{item.sub}</span>
              )}
            </span>
          </button>
        ))}
      </div>
    </BottomSheet>
  )
}
