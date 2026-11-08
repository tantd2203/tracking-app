import { useState } from 'react'
import { Link } from 'react-router'
import { useBoards, useDeleteBoard, type BoardWithStats } from '../../api/boards'
import { useStreakSummary, useYearCounts } from '../../api/stats'
import { useSession } from '../../api/auth'
import { Button3D } from '../../components/Button3D'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Whale } from '../../components/Whale'
import { showUndo } from '../../components/toast'
import { WEEKDAY_SHORT, addDays, toLocalISO } from '../../lib/date'
import type { DayCounts } from '../../lib/heat'
import { matchBoard } from '../../lib/search'
import { ArchivedSection } from './ArchivedSection'
import { BoardMenu } from './BoardMenu'
import { BoardSheet } from './BoardSheet'
import { BoardTile } from './BoardTile'
import { StreakBanner, type WeekDay } from './StreakBanner'

/** Sheet đang mở: tạo mới, hoặc sửa một board. */
type SheetState = { mode: 'create' } | { mode: 'edit'; board: BoardWithStats } | null

/** Ngưỡng hiện ô tìm kiếm: chỉ hiện khi có nhiều hơn số board này. */
const SEARCH_THRESHOLD = 3

/** 7 ngày gần nhất, hôm nay ở cuối. Ngày có card xong là đã đánh dấu. */
function lastSevenDays(counts: DayCounts): WeekDay[] {
  const today = new Date()
  return Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i - 6)
    return {
      label: i === 6 ? 'Nay' : WEEKDAY_SHORT[d.getDay()],
      done: (counts[toLocalISO(d)] ?? 0) > 0,
      today: toLocalISO(d) === toLocalISO(today),
    }
  })
}

/** Câu chữ banner streak theo bảng "Banner streak" trong plan/design/README.md. */
function streakCopy(s: { streak: number; today: number; totalYear: number; loading: boolean }) {
  if (s.loading) return { title: 'Đang tải streak…', sub: '' }
  if (s.totalYear === 0)
    return { title: 'Bắt đầu streak nào!', sub: 'Xong 1 card hôm nay để bắt đầu chuỗi nhé' }
  if (s.today > 0)
    return { title: `Streak ${s.streak} ngày!`, sub: 'Hôm nay đã tô màu rồi. Giỏi quá!' }
  if (s.streak > 0)
    return { title: `Streak ${s.streak} ngày!`, sub: 'Xong 1 card hôm nay để giữ chuỗi nhé' }
  return { title: 'Mất streak rồi…', sub: 'Xong 1 card hôm nay để bơi lại nhé' }
}

function BoardsSkeleton() {
  return (
    <ul className="flex flex-col gap-3" aria-label="Đang tải">
      {[0, 1, 2].map((i) => (
        <li
          key={i}
          className="h-[88px] animate-pulse rounded-card border-2 border-line bg-surface"
        />
      ))}
    </ul>
  )
}

/**
 * Màn 2 – Danh sách board.
 * Số liệu, tìm kiếm, ghim và mục lưu trữ lấy từ `src/api/boards.ts`.
 * Chưa có .env.local thì giữ chế độ demo (danh sách trống).
 */
export default function BoardsPage() {
  const { session } = useSession()
  const boards = useBoards()
  const { scheduleDelete } = useDeleteBoard()
  const [query, setQuery] = useState('')
  const counts = useYearCounts()
  const streak = useStreakSummary()
  const copy = streakCopy(streak)
  const [sheet, setSheet] = useState<SheetState>(null)
  const [menuFor, setMenuFor] = useState<BoardWithStats | null>(null)
  const [confirmFor, setConfirmFor] = useState<BoardWithStats | null>(null)

  const active = boards.data?.active ?? []
  const archived = boards.data?.archived ?? []
  const shown = active.filter((b) => matchBoard(b, query))

  function confirmDelete(board: BoardWithStats) {
    const { undo } = scheduleDelete(board.id)
    setConfirmFor(null)
    setMenuFor(null)
    showUndo(`Đã xoá “${board.name}”`, undo)
  }
  const showSearch = active.length > SEARCH_THRESHOLD || query.trim() !== ''

  const meta = session?.user.user_metadata as { display_name?: string } | undefined
  const displayName = meta?.display_name ?? session?.user.email?.split('@')[0] ?? ''

  return (
    <div className="px-5">
      <header className="safe-top flex items-start justify-between pb-4">
        <div>
          <p className="text-[15px] font-extrabold text-ink2">
            {displayName ? `Xin chào, ${displayName}` : 'Xin chào'}
          </p>
          <h1 className="text-[30px] leading-tight font-black">Board của bạn</h1>
        </div>
        <Link
          to="/stats"
          aria-label="Streak"
          className="flex items-center gap-1.5 rounded-2xl border-2 border-line bg-surface px-3 py-2 font-black shadow-block-sm"
        >
          <svg width="16" height="18" viewBox="0 0 16 18" aria-hidden="true">
            <path d="M8 1C8 1 2 8 2 11.5a6 6 0 0 0 12 0C14 8 8 1 8 1z" fill="#0284C7" />
          </svg>
          <span className="text-brand">{streak.streak}</span>
        </Link>
      </header>

      <div className="mb-4">
        <StreakBanner
          title={copy.title}
          sub={copy.sub}
          mood={streak.mood}
          week={lastSevenDays(counts.data ?? {})}
        />
      </div>

      <div className="mb-3 flex items-center justify-between">
        <p className="text-lg font-black">
          Board đang dùng <span className="text-sm text-ink2">{active.length} board</span>
        </p>
        <Button3D size="md" onClick={() => setSheet({ mode: 'create' })}>
          + Tạo
        </Button3D>
      </div>

      {showSearch && (
        <div className="relative mb-4">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm board..."
            className="h-11 w-full rounded-2xl border-2 border-line bg-surface px-4 pr-10 text-[15px] font-bold outline-none placeholder:text-ink2/70 focus:border-brand"
          />
          {query && (
            <button
              type="button"
              aria-label="Xoá tìm kiếm"
              onClick={() => setQuery('')}
              className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-lg font-black text-ink2"
            >
              ×
            </button>
          )}
        </div>
      )}

      {boards.isError && (
        <p className="mb-3 rounded-card border-2 border-line bg-surface px-4 py-3 font-bold text-ink2">
          Không tải được board: {boards.error.message}
        </p>
      )}

      {boards.isLoading ? (
        <BoardsSkeleton />
      ) : shown.length > 0 ? (
        <ul className="flex flex-col gap-3">
          {shown.map((board) => (
            <li key={board.id}>
              <BoardTile board={board} onMenu={() => setMenuFor(board)} />
            </li>
          ))}
        </ul>
      ) : active.length > 0 ? (
        <section className="flex flex-col items-center rounded-card border-2 border-line bg-surface px-6 py-8 text-center shadow-block">
          <Whale mood="happy" size={140} />
          <h2 className="mt-3 text-xl font-black">Không tìm thấy board nào</h2>
          <p className="mt-1 text-[15px] font-bold text-ink2">
            Thử từ khoá khác, hoặc tạo board mới với tên này.
          </p>
        </section>
      ) : (
        <section className="flex flex-col items-center rounded-card border-2 border-line bg-surface px-6 py-8 text-center shadow-block">
          <Whale mood="calm" size={140} />
          <h2 className="mt-3 text-xl font-black">Chưa có board nào</h2>
          <p className="mt-1 text-[15px] font-bold text-ink2">
            Tạo board đầu tiên để bắt đầu bơi cùng Bubu nhé!
          </p>
        </section>
      )}

      <ArchivedSection boards={archived} />

      {sheet && (
        <BoardSheet
          board={sheet.mode === 'edit' ? sheet.board : undefined}
          initialName={sheet.mode === 'create' ? query.trim() : ''}
          defaultColor={active.length % 4}
          onClose={() => setSheet(null)}
        />
      )}

      {menuFor && (
        <BoardMenu
          board={menuFor}
          onClose={() => setMenuFor(null)}
          onEdit={() => {
            setSheet({ mode: 'edit', board: menuFor })
            setMenuFor(null)
          }}
          onDelete={() => {
            setConfirmFor(menuFor)
            setMenuFor(null)
          }}
        />
      )}

      <ConfirmDialog
        open={confirmFor !== null}
        title={`Xoá “${confirmFor?.name ?? ''}”?`}
        text={
          confirmFor && confirmFor.total > 0
            ? `${confirmFor.total} card sẽ bị xoá vĩnh viễn.`
            : 'Board này đang trống.'
        }
        confirmLabel="Xoá"
        onConfirm={() => confirmFor && confirmDelete(confirmFor)}
        onClose={() => setConfirmFor(null)}
      />
    </div>
  )
}
