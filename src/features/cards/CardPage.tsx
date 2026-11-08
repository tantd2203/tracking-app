import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import {
  useBoardData,
  useCard,
  useDeleteCard,
  useRestoreCard,
  useUpdateCard,
  type CardDetail,
} from '../../api/cards'
import type { ListKey, Priority } from '../../api/types'
import { BottomSheet } from '../../components/BottomSheet'
import { Button3D } from '../../components/Button3D'
import { ConfirmDialog } from '../../components/ConfirmDialog'
import { Segmented } from '../../components/Segmented'
import { Whale } from '../../components/Whale'
import { IconBack } from '../../components/icons'
import { showUndo, toast } from '../../components/toast'
import { toLocalISO } from '../../lib/date'
import { dueLabel } from '../../lib/due'
import { useCardMove } from '../boards/useCardMove'
import { AutoTextarea } from './AutoTextarea'
import { Checklist } from './Checklist'
import { DueDateField } from './DueDateField'
import { LabelPicker } from './LabelPicker'
import { PriorityPicker } from './PriorityPicker'

/** Thời gian chờ sau lần gõ cuối trước khi lưu tiêu đề và mô tả. */
const DEBOUNCE_MS = 600
/** Thời gian hiện chữ "Đã lưu". */
const SAVED_MS = 1000

const STATUS_OPTIONS: { value: ListKey; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'doing', label: 'Doing' },
  { value: 'done', label: 'Done' },
]

/** Màn 4 – Chi tiết card: tiêu đề, trạng thái, hạn chót, mô tả. Nhãn, ưu tiên, checklist làm ở FE-08. */
export default function CardPage() {
  const { cardId = '' } = useParams()
  const query = useCard(cardId)
  const boardId = query.data?.board_id ?? ''
  const board = useBoardData(boardId)

  if (query.isPending) {
    return (
      <div className="px-5 pt-6" aria-label="Đang tải">
        <div className="mb-4 h-10 animate-pulse rounded-xl bg-surface" />
        <div className="h-24 animate-pulse rounded-card bg-surface" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <p className="px-5 pt-6 font-bold text-ink2">Không tải được card: {query.error.message}</p>
    )
  }

  return (
    <CardEditor key={query.data.id} card={query.data} boardName={board.data?.board.name ?? ''} />
  )
}

type EditorProps = { card: CardDetail; boardName: string }

/**
 * Trình sửa card. Mount lại theo từng card (`key`), nên tiêu đề và mô tả
 * lấy giá trị ban đầu từ server đúng một lần rồi do ô nhập giữ.
 */
function CardEditor({ card, boardName }: EditorProps) {
  const navigate = useNavigate()
  const update = useUpdateCard()
  const remove = useDeleteCard()
  const restore = useRestoreCard()
  const { moveCard, isPending: moving } = useCardMove()

  const [title, setTitle] = useState(card.title)
  const [desc, setDesc] = useState(card.description)
  const [saved, setSaved] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const lastTitle = useRef(card.title)
  const lastDesc = useRef(card.description)
  const pendingTitle = useRef<string | null>(null)
  const pendingDesc = useRef<string | null>(null)
  const titleTimer = useRef<number>(0)
  const descTimer = useRef<number>(0)
  const savedTimer = useRef<number>(0)

  const today = toLocalISO(new Date())
  const boardPath = `/boards/${card.board_id}`
  const info = card.list !== 'done' ? dueLabel(card.due_date, today) : null
  const allDone =
    card.checklist.total > 0 && card.checklist.done === card.checklist.total && card.list !== 'done'

  function flashSaved() {
    setSaved(true)
    window.clearTimeout(savedTimer.current)
    savedTimer.current = window.setTimeout(() => setSaved(false), SAVED_MS)
  }

  function saveTitle(raw: string) {
    const next = raw.trim()
    if (!next) {
      setTitle(lastTitle.current)
      return
    }
    if (next === lastTitle.current) return
    const previous = lastTitle.current
    lastTitle.current = next
    update.mutate(
      { id: card.id, patch: { title: next } },
      {
        onSuccess: flashSaved,
        // Lỗi: trả lại giá trị đã lưu để lần gõ sau cùng nội dung vẫn được lưu.
        onError: () => {
          lastTitle.current = previous
          setTitle(previous)
        },
      },
    )
  }

  function saveDesc(next: string) {
    if (next === lastDesc.current) return
    const previous = lastDesc.current
    lastDesc.current = next
    update.mutate(
      { id: card.id, patch: { description: next } },
      {
        onSuccess: flashSaved,
        onError: () => {
          lastDesc.current = previous
          setDesc(previous)
        },
      },
    )
  }

  function flushTitle() {
    window.clearTimeout(titleTimer.current)
    if (pendingTitle.current === null) return
    const value = pendingTitle.current
    pendingTitle.current = null
    saveTitle(value)
  }

  function flushDesc() {
    window.clearTimeout(descTimer.current)
    if (pendingDesc.current === null) return
    const value = pendingDesc.current
    pendingDesc.current = null
    saveDesc(value)
  }

  // Lưu nốt chữ còn đang chờ khi rời màn. Hai hàm flush chỉ dùng ref và mutate ổn định nên không cần phụ thuộc.
  useEffect(() => {
    return () => {
      flushTitle()
      flushDesc()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function onTitleChange(value: string) {
    setTitle(value)
    pendingTitle.current = value
    window.clearTimeout(titleTimer.current)
    titleTimer.current = window.setTimeout(flushTitle, DEBOUNCE_MS)
  }

  function onDescChange(value: string) {
    setDesc(value)
    pendingDesc.current = value
    window.clearTimeout(descTimer.current)
    descTimer.current = window.setTimeout(flushDesc, DEBOUNCE_MS)
  }

  function changeStatus(to: ListKey) {
    if (to === card.list) return
    flushTitle()
    flushDesc()
    moveCard(
      { cardId: card.id, boardId: card.board_id, toList: to, toIndex: 0 },
      card.title,
      boardPath,
    )
  }

  function changeDue(due: string | null) {
    update.mutate({ id: card.id, patch: { due_date: due } }, { onSuccess: flashSaved })
  }

  function confirmDelete() {
    setConfirmOpen(false)
    flushTitle()
    flushDesc()
    const deleted = { id: card.id, boardId: card.board_id }
    const name = lastTitle.current
    remove.mutate(deleted, {
      onSuccess: () => {
        navigate(boardPath, { replace: true })
        showUndo(`Đã xoá “${name}”`, () =>
          restore.mutate(deleted, { onSuccess: () => toast('Đã khôi phục card') }),
        )
      },
    })
  }

  return (
    <div className="px-5 pt-3 pb-44">
      <header className="safe-top flex items-center gap-3 pb-3">
        <button
          type="button"
          aria-label="Quay lại"
          onClick={() => navigate(boardPath)}
          className="grid size-10 flex-none cursor-pointer place-items-center rounded-xl border-2 border-line bg-surface shadow-block-sm active:translate-y-[3px] active:shadow-none"
        >
          <IconBack size={18} />
        </button>
        <p className="min-w-0 flex-1 truncate text-[15px] font-extrabold text-ink2">{boardName}</p>
        {info?.overdue && (
          <span className="flex-none rounded-full bg-red-bg px-3 py-1.5 text-[13px] font-black text-red">
            {info.text}
          </span>
        )}
        <button
          type="button"
          aria-label="Tuỳ chọn card"
          onClick={() => setMenuOpen(true)}
          className="grid size-10 flex-none cursor-pointer place-items-center rounded-full border-2 border-line text-lg font-black text-ink2"
        >
          ⋯
        </button>
      </header>

      <p className="h-4 text-right text-xs font-bold text-ink2" aria-live="polite">
        {saved ? 'Đã lưu' : ''}
      </p>

      <Segmented
        options={STATUS_OPTIONS}
        value={card.list}
        onChange={changeStatus}
        className="mb-5"
      />

      <AutoTextarea
        label="Tiêu đề card"
        value={title}
        singleLine
        onChange={onTitleChange}
        onBlur={flushTitle}
        className="mb-6 text-[22px] leading-tight font-black"
      />

      <div className="mb-6">
        <DueDateField due={card.due_date} today={today} onChange={changeDue} />
      </div>

      <section className="flex flex-col gap-2">
        <h2 className="text-xs font-black tracking-[0.8px] text-ink2 uppercase">Mô tả</h2>
        <div className="rounded-card border-2 border-line bg-surface p-3.5 shadow-block">
          <AutoTextarea
            label="Mô tả"
            value={desc}
            placeholder="Thêm mô tả cho card…"
            onChange={onDescChange}
            onBlur={flushDesc}
            className="min-h-[120px] text-[15px] font-bold leading-relaxed"
          />
        </div>
      </section>

      <div className="mt-6 flex flex-col gap-6">
        <PriorityPicker cardId={card.id} value={card.priority as Priority} />
        <LabelPicker boardId={card.board_id} card={card} />
        <Checklist boardId={card.board_id} card={card} />
      </div>

      <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md border-t-2 border-line bg-surface px-5 pt-3 pb-4">
        {allDone && (
          <p className="mb-3 flex items-center gap-2 text-[13px] font-bold text-ink2">
            <Whale mood="happy" size={36} />
            Xong hết việc con rồi! Bấm HOÀN THÀNH nhé
          </p>
        )}
        {card.list === 'done' ? (
          <Button3D
            variant="secondary"
            block
            disabled={moving}
            onClick={() =>
              moveCard(
                { cardId: card.id, boardId: card.board_id, toList: 'todo', toIndex: 0 },
                card.title,
              )
            }
          >
            Mở lại card
          </Button3D>
        ) : (
          <Button3D
            block
            disabled={moving}
            onClick={() =>
              moveCard(
                { cardId: card.id, boardId: card.board_id, toList: 'done', toIndex: 0 },
                card.title,
                boardPath,
              )
            }
          >
            ✓ HOÀN THÀNH
          </Button3D>
        )}
      </div>

      <BottomSheet open={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="pb-4">
          <button
            type="button"
            onClick={() => {
              setMenuOpen(false)
              setConfirmOpen(true)
            }}
            className="flex min-h-14 w-full cursor-pointer items-center gap-3 rounded-2xl px-2 text-left text-[16px] font-black text-red"
          >
            <span
              aria-hidden="true"
              className="grid size-10 place-items-center rounded-xl bg-red text-lg text-white"
            >
              ×
            </span>
            Xoá card
          </button>
        </div>
      </BottomSheet>

      <ConfirmDialog
        open={confirmOpen}
        title={`Xoá “${card.title}”?`}
        text="Card sẽ được xoá. Bạn vẫn có thể hoàn tác ngay sau khi xoá."
        confirmLabel="Xoá"
        onConfirm={confirmDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </div>
  )
}
