import { useState } from 'react'
import { Link } from 'react-router'
import { useCreateBoard, useBoards } from '../../api/boards'
import { useSession } from '../../api/auth'
import { BottomSheet } from '../../components/BottomSheet'
import { Button3D } from '../../components/Button3D'
import { TextField } from '../../components/TextField'
import { Whale } from '../../components/Whale'
import { toast } from '../../components/toast'

/**
 * Màn 2 – Danh sách board.
 * Đọc và tạo board thật qua `src/api/boards.ts`. Chưa có .env.local thì giữ chế độ demo.
 */
export default function BoardsPage() {
  const { demo } = useSession()
  const boards = useBoards()
  const create = useCreateBoard()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const list = boards.data?.active ?? []

  function save() {
    const trimmed = name.trim()
    if (!trimmed) return setError('Đặt tên cho board nhé!')
    if (demo) {
      setOpen(false)
      toast(`Đã tạo board “${trimmed}” (chế độ demo)`)
      setName('')
      return
    }
    // Màu mặc định xoay vòng theo số board đang có
    create.mutate(
      { name: trimmed, color: list.length % 4 },
      {
        onSuccess: (board) => {
          setOpen(false)
          setName('')
          toast(`Đã tạo board “${board.name}”`)
        },
      },
    )
  }

  return (
    <div className="px-5">
      <header className="safe-top pb-4">
        <p className="text-[15px] font-extrabold text-ink2">Xin chào 👋</p>
        <h1 className="text-[30px] leading-tight font-black">Board của bạn</h1>
      </header>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-lg font-black">
          Board đang dùng <span className="text-sm text-ink2">{list.length} board</span>
        </p>
        <Button3D size="md" onClick={() => setOpen(true)}>
          + Tạo
        </Button3D>
      </div>

      {boards.isError && (
        <p className="mb-3 rounded-card border-2 border-line bg-surface px-4 py-3 font-bold text-ink2">
          Không tải được board: {boards.error.message}
        </p>
      )}

      {list.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {list.map((board) => (
            <li key={board.id}>
              <Link
                to={`/boards/${board.id}`}
                className="block rounded-card border-2 border-line bg-surface px-4 py-3 font-black shadow-block"
              >
                {board.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <section className="flex flex-col items-center rounded-card border-2 border-line bg-surface px-6 py-8 text-center shadow-block">
          <Whale mood="calm" size={140} />
          <h2 className="mt-3 text-xl font-black">Chưa có board nào</h2>
          <p className="mt-1 text-[15px] font-bold text-ink2">
            Tạo board đầu tiên để bắt đầu bơi cùng Bubu nhé!
          </p>
        </section>
      )}

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Tạo board mới">
        <div className="flex flex-col gap-4 pb-4">
          <TextField
            label="Tên board"
            placeholder="Ví dụ: Công việc"
            maxLength={40}
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
          <Button3D onClick={save} disabled={create.isPending}>
            TẠO BOARD
          </Button3D>
        </div>
      </BottomSheet>
    </div>
  )
}
