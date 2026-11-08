import { useState } from 'react'
import { useCreateBoard, useUpdateBoard, type BoardWithStats } from '../../api/boards'
import { toastError } from '../../api/errors'
import { BottomSheet } from '../../components/BottomSheet'
import { Button3D } from '../../components/Button3D'
import { TextField } from '../../components/TextField'
import { toast } from '../../components/toast'
import { BOARD_COLORS } from '../../lib/palette'

/** Ô tên tối đa 40 ký tự, khớp với bộ đếm "12/40". */
const NAME_MAX = 40

type Props = {
  /** Board đang sửa. Không truyền thì là chế độ tạo mới. */
  board?: BoardWithStats
  /** Tên điền sẵn khi tạo (ví dụ từ khoá đang tìm). */
  initialName?: string
  /** Màu mặc định khi tạo mới: số board hiện có % 4. */
  defaultColor: number
  onClose: () => void
}

/**
 * Sheet tạo hoặc sửa board. Component được mount lại mỗi lần mở
 * nên state luôn bắt đầu từ dữ liệu hiện tại.
 */
export function BoardSheet({ board, initialName = '', defaultColor, onClose }: Props) {
  const isEdit = Boolean(board)
  const create = useCreateBoard()
  const update = useUpdateBoard()
  const [name, setName] = useState(board?.name ?? initialName)
  const [desc, setDesc] = useState(board?.description ?? '')
  const [color, setColor] = useState(board?.color ?? defaultColor)
  const [error, setError] = useState('')

  const trimmed = name.trim()
  const pending = create.isPending || update.isPending
  const preview = BOARD_COLORS[color]

  function save() {
    if (!trimmed) return setError('Đặt tên cho board nhé!')
    const done = {
      onSuccess: (saved: { name: string }) => {
        onClose()
        toast(isEdit ? 'Đã lưu thay đổi' : `Đã tạo board “${saved.name}”`)
      },
      onError: (e: Error) => toastError(e),
    }
    if (board) {
      update.mutate(
        { id: board.id, patch: { name: trimmed, description: desc.trim(), color } },
        done,
      )
    } else {
      create.mutate({ name: trimmed, description: desc.trim(), color }, done)
    }
  }

  return (
    <BottomSheet open onClose={onClose} title={isEdit ? 'Sửa board' : 'Tạo board mới'}>
      <div className="flex flex-col gap-4 pb-4">
        <TextField
          label="Tên board"
          placeholder="Ví dụ: Công việc"
          maxLength={NAME_MAX}
          showCounter
          autoFocus
          value={name}
          error={error}
          onChange={(e) => {
            setName(e.target.value)
            setError('')
          }}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />

        <TextField
          label="Mô tả"
          placeholder="Không bắt buộc"
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && save()}
        />

        <div className="flex flex-col gap-2">
          <span className="text-[13px] font-extrabold text-ink2">Màu</span>
          <div className="flex items-center gap-3">
            {BOARD_COLORS.map((c, i) => {
              const selected = i === color
              return (
                <button
                  key={i}
                  type="button"
                  aria-label={`Màu ${i + 1}`}
                  aria-pressed={selected}
                  onClick={() => setColor(i)}
                  className={[
                    'grid size-10 cursor-pointer place-items-center rounded-full text-base font-black text-white',
                    selected ? 'ring-[3px] ring-ink ring-offset-2 ring-offset-surface' : '',
                  ].join(' ')}
                  style={{ background: c.c }}
                >
                  {selected ? '✓' : ''}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-card border-2 border-line bg-bg px-4 py-3">
          <div
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-2xl text-xl font-black text-white"
            style={{ background: preview.c, boxShadow: `0 4px 0 ${preview.shade}` }}
          >
            {trimmed.charAt(0).toUpperCase() || '?'}
          </div>
          <p className="text-sm font-bold text-ink2">Xem trước</p>
        </div>

        <Button3D block onClick={save} disabled={pending} className={trimmed ? '' : 'opacity-50'}>
          {isEdit ? 'LƯU THAY ĐỔI' : 'TẠO BOARD'}
        </Button3D>
      </div>
    </BottomSheet>
  )
}
