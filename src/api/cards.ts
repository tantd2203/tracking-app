import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type QueryKey,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { useRef } from 'react'
import { toLocalISO } from '../lib/date'
import { positionBetween } from '../lib/position'
import { db } from './client'
import { useSession } from './auth'
import { toastError, unwrap } from './errors'
import { qk } from './keys'
import type { Board, Card, ChecklistItem, Label, List, ListKey } from './types'

export type CardView = Card & {
  list: ListKey
  labels: Label[]
  checklist: { done: number; total: number }
}

export type BoardData = {
  board: Board
  lists: Record<ListKey, List>
  /** Card đã sắp theo `position` trong từng list. Không gồm card đã xoá mềm. */
  cards: Record<ListKey, CardView[]>
}

export type CardDetail = CardView & { checklistItems: ChecklistItem[] }

export type CardPatch = Partial<Pick<Card, 'title' | 'description' | 'due_date' | 'priority'>>

export type MoveResult = Card & {
  /** True khi card vừa được chuyển vào Done từ list khác (để FE mở popup ăn mừng). */
  completedNow: boolean
}

const LIST_KEYS: ListKey[] = ['todo', 'doing', 'done']
const STEP = 1024

function emptyCards(): Record<ListKey, CardView[]> {
  return { todo: [], doing: [], done: [] }
}

type Extras = {
  labels: Map<string, Label[]>
  checklist: Map<string, { done: number; total: number }>
}

/** Nhãn và số checklist của một nhóm card. Gọi bằng `.in('card_id', ...)` nên không lấy dữ liệu thừa. */
async function fetchExtras(cardIds: string[]): Promise<Extras> {
  const client = db()
  const [labelRes, itemRes] = await Promise.all([
    client.from('card_labels').select('card_id, labels(*)').in('card_id', cardIds),
    client.from('checklist_items').select('card_id, done').in('card_id', cardIds),
  ])

  const labels = new Map<string, Label[]>()
  const labelRows = unwrap(labelRes) as unknown as { card_id: string; labels: Label | null }[]
  for (const row of labelRows) {
    if (!row.labels) continue
    labels.set(row.card_id, [...(labels.get(row.card_id) ?? []), row.labels])
  }

  const checklist = new Map<string, { done: number; total: number }>()
  for (const item of unwrap(itemRes)) {
    const cur = checklist.get(item.card_id) ?? { done: 0, total: 0 }
    checklist.set(item.card_id, {
      done: cur.done + (item.done ? 1 : 0),
      total: cur.total + 1,
    })
  }

  return { labels, checklist }
}

function toCardView(
  card: Card,
  list: ListKey,
  labels: Label[],
  checklist: { done: number; total: number },
): CardView {
  return { ...card, list, labels, checklist }
}

async function fetchBoardData(boardId: string): Promise<BoardData> {
  const client = db()
  const [boardRes, listsRes, cardsRes] = await Promise.all([
    client.from('boards').select('*').eq('id', boardId).single(),
    client.from('lists').select('*').eq('board_id', boardId),
    client
      .from('cards')
      .select('*')
      .eq('board_id', boardId)
      .is('archived_at', null)
      .order('position', { ascending: true }),
  ])
  const board = unwrap(boardRes)
  const lists = unwrap(listsRes)
  const cards = unwrap(cardsRes)

  const listsByKey = {} as Record<ListKey, List>
  const keyById = new Map<string, ListKey>()
  for (const list of lists) {
    listsByKey[list.key as ListKey] = list
    keyById.set(list.id, list.key as ListKey)
  }

  const extras = cards.length
    ? await fetchExtras(cards.map((c) => c.id))
    : {
        labels: new Map<string, Label[]>(),
        checklist: new Map<string, { done: number; total: number }>(),
      }

  const grouped = emptyCards()
  for (const card of cards) {
    const key = keyById.get(card.list_id)
    if (!key) continue
    grouped[key].push(
      toCardView(
        card,
        key,
        extras.labels.get(card.id) ?? [],
        extras.checklist.get(card.id) ?? { done: 0, total: 0 },
      ),
    )
  }

  return { board, lists: listsByKey, cards: grouped }
}

async function fetchCard(cardId: string): Promise<CardDetail> {
  const client = db()
  const cardRes = await client.from('cards').select('*').eq('id', cardId).single()
  const card = unwrap(cardRes)
  const [listRes, extras, itemRes] = await Promise.all([
    client.from('lists').select('key').eq('id', card.list_id).single(),
    fetchExtras([cardId]),
    client
      .from('checklist_items')
      .select('*')
      .eq('card_id', cardId)
      .order('position', { ascending: true }),
  ])
  const list = unwrap(listRes)

  return {
    ...toCardView(
      card,
      list.key as ListKey,
      extras.labels.get(cardId) ?? [],
      extras.checklist.get(cardId) ?? { done: 0, total: 0 },
    ),
    checklistItems: unwrap(itemRes),
  }
}

/** Board với card đã sắp theo list. Dùng cho màn Board (FE-04, FE-05). */
export function useBoardData(boardId: string): UseQueryResult<BoardData> {
  const { demo, session } = useSession()
  return useQuery({
    queryKey: qk.board(boardId),
    queryFn: () => fetchBoardData(boardId),
    enabled: !demo && Boolean(session) && Boolean(boardId),
  })
}

/** Một card kèm checklist đầy đủ. Dùng cho màn Chi tiết card (FE-07). */
export function useCard(cardId: string): UseQueryResult<CardDetail> {
  const { demo, session } = useSession()
  return useQuery({
    queryKey: qk.card(cardId),
    queryFn: () => fetchCard(cardId),
    enabled: !demo && Boolean(session) && Boolean(cardId),
  })
}

/** Thay đổi một card trong mọi cache board đang có (không cần biết boardId). */
function patchCardInBoards(qc: QueryClient, cardId: string, patch: Partial<CardView>) {
  qc.setQueriesData<BoardData>({ queryKey: ['board'] }, (data) => {
    if (!data) return data
    const cards = emptyCards()
    for (const key of LIST_KEYS) {
      cards[key] = data.cards[key].map((c) => (c.id === cardId ? { ...c, ...patch } : c))
    }
    return { ...data, cards }
  })
}

/** Thêm card vào cuối list. Card tạm xuất hiện ngay, lỗi thì rollback. */
export function useCreateCard(): UseMutationResult<
  Card,
  Error,
  { boardId: string; list: ListKey; title: string },
  { prev: BoardData | undefined }
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ boardId, list, title }) =>
      unwrap(
        await db().rpc('create_card', {
          p_board_id: boardId,
          p_list: list,
          p_title: title,
          p_local_date: toLocalISO(new Date()),
        }),
      ),
    onMutate: async ({ boardId, list, title }) => {
      await qc.cancelQueries({ queryKey: qk.board(boardId) })
      const prev = qc.getQueryData<BoardData>(qk.board(boardId))
      if (prev) {
        const inList = prev.cards[list]
        const last = inList[inList.length - 1]
        const now = new Date().toISOString()
        const temp: CardView = {
          id: `temp-${Date.now()}`,
          board_id: boardId,
          user_id: prev.board.user_id,
          list_id: prev.lists[list].id,
          title: title.trim(),
          description: '',
          due_date: null,
          priority: 'none',
          position: (last?.position ?? 0) + STEP,
          completed_at: null,
          completed_on: null,
          archived_at: null,
          created_at: now,
          updated_at: now,
          list,
          labels: [],
          checklist: { done: 0, total: 0 },
        }
        qc.setQueryData<BoardData>(qk.board(boardId), {
          ...prev,
          cards: { ...prev.cards, [list]: [...inList, temp] },
        })
      }
      return { prev }
    },
    onError: (e, { boardId }, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.board(boardId), ctx.prev)
      toastError(e)
    },
    onSettled: (_data, _err, { boardId }) => {
      qc.invalidateQueries({ queryKey: qk.board(boardId) })
      qc.invalidateQueries({ queryKey: qk.boards })
    },
  })
}

/** Sửa tiêu đề, mô tả, hạn, ưu tiên. Debounce là việc của FE. */
export function useUpdateCard(): UseMutationResult<
  Card,
  Error,
  { id: string; patch: CardPatch },
  { prevCard: CardDetail | undefined; prevBoards: [QueryKey, BoardData | undefined][] }
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }) =>
      unwrap(await db().from('cards').update(patch).eq('id', id).select().single()),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: qk.card(id) })
      await qc.cancelQueries({ queryKey: ['board'] })
      const prevCard = qc.getQueryData<CardDetail>(qk.card(id))
      const prevBoards = qc.getQueriesData<BoardData>({ queryKey: ['board'] })
      qc.setQueryData<CardDetail>(qk.card(id), (old) => (old ? { ...old, ...patch } : old))
      patchCardInBoards(qc, id, patch)
      return { prevCard, prevBoards }
    },
    onError: (e, { id }, ctx) => {
      if (ctx?.prevCard) qc.setQueryData(qk.card(id), ctx.prevCard)
      for (const [key, data] of ctx?.prevBoards ?? []) qc.setQueryData(key, data)
      toastError(e)
    },
    onSettled: (_data, _err, { id }) => {
      qc.invalidateQueries({ queryKey: qk.card(id) })
      qc.invalidateQueries({ queryKey: ['board'] })
    },
  })
}

type MoveVars = { cardId: string; boardId: string; toList: ListKey; toIndex: number }

/** Vị trí và list cũ của card, ghi lúc optimistic để mutationFn dùng lại. */
type PendingMove = { from: ListKey; position: number }

/**
 * Chuyển card sang list khác (hoặc đổi thứ tự trong list). Cache đổi ngay,
 * lỗi thì card quay về chỗ cũ kèm toast.
 * Hoàn thành = `toList: 'done'`, mở lại = `toList: 'todo'`, `toIndex: 0`.
 */
export function useMoveCard(): UseMutationResult<
  MoveResult,
  Error,
  MoveVars,
  { prev: BoardData | undefined }
> {
  const qc = useQueryClient()
  const pending = useRef(new Map<string, PendingMove>())

  return useMutation({
    mutationFn: async ({ cardId, toList }) => {
      const p = pending.current.get(cardId)
      if (!p) throw new Error('Thiếu thông tin vị trí card')
      const card = unwrap(
        await db().rpc('move_card', {
          p_card_id: cardId,
          p_to_list: toList,
          p_position: p.position,
          p_local_date: toLocalISO(new Date()),
        }),
      )
      return { ...card, completedNow: toList === 'done' && p.from !== 'done' }
    },
    onMutate: async ({ cardId, boardId, toList, toIndex }) => {
      await qc.cancelQueries({ queryKey: qk.board(boardId) })
      const prev = qc.getQueryData<BoardData>(qk.board(boardId))
      if (!prev) throw new Error('Chưa tải xong board')

      const from = LIST_KEYS.find((k) => prev.cards[k].some((c) => c.id === cardId))
      if (!from) throw new Error('Không tìm thấy card')

      // Vị trí tính trên list đích, không kể chính card đang kéo.
      const others = prev.cards[toList].filter((c) => c.id !== cardId)
      const index = Math.min(Math.max(toIndex, 0), others.length)
      const position = positionBetween(others[index - 1]?.position, others[index]?.position)
      pending.current.set(cardId, { from, position })

      qc.setQueryData<BoardData>(
        qk.board(boardId),
        moveInData(prev, cardId, toList, index, position),
      )
      return { prev }
    },
    onError: (e, { boardId, cardId }, ctx) => {
      pending.current.delete(cardId)
      if (ctx?.prev) qc.setQueryData(qk.board(boardId), ctx.prev)
      toastError(e)
    },
    onSuccess: (_data, { cardId }) => {
      pending.current.delete(cardId)
      qc.invalidateQueries({ queryKey: ['dayCounts'] })
      qc.invalidateQueries({ queryKey: qk.boards })
    },
    onSettled: (_data, _err, { boardId, cardId }) => {
      qc.invalidateQueries({ queryKey: qk.board(boardId) })
      qc.invalidateQueries({ queryKey: qk.card(cardId) })
    },
  })
}

/** Đổi list và vị trí card trong cache, giống logic của RPC move_card. */
function moveInData(
  data: BoardData,
  cardId: string,
  toList: ListKey,
  index: number,
  position: number,
): BoardData {
  const card = LIST_KEYS.flatMap((k) => data.cards[k]).find((c) => c.id === cardId)
  if (!card) return data

  const now = new Date()
  const toDone = toList === 'done'
  const wasDone = card.list === 'done'
  let completed_at = card.completed_at
  let completed_on = card.completed_on
  if (toDone && !wasDone) {
    completed_at = now.toISOString()
    completed_on = toLocalISO(now)
  } else if (!toDone && wasDone) {
    completed_at = null
    completed_on = null
  }
  const moved: CardView = {
    ...card,
    list: toList,
    position,
    completed_at,
    completed_on,
    updated_at: now.toISOString(),
  }

  const cards = emptyCards()
  for (const k of LIST_KEYS) cards[k] = data.cards[k].filter((c) => c.id !== cardId)
  cards[toList].splice(index, 0, moved)
  return { ...data, cards }
}

/**
 * Xoá mềm: đặt `archived_at`. Card biến khỏi board ngay (optimistic) nhưng vẫn còn trong DB
 * để heatmap các ngày cũ không bị nhạt.
 */
export function useDeleteCard(): UseMutationResult<
  void,
  Error,
  { id: string; boardId: string },
  { prev: BoardData | undefined }
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await db()
        .from('cards')
        .update({ archived_at: new Date().toISOString() })
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, boardId }) => {
      await qc.cancelQueries({ queryKey: qk.board(boardId) })
      const prev = qc.getQueryData<BoardData>(qk.board(boardId))
      if (prev) {
        const cards = emptyCards()
        for (const k of LIST_KEYS) cards[k] = prev.cards[k].filter((c) => c.id !== id)
        qc.setQueryData<BoardData>(qk.board(boardId), { ...prev, cards })
      }
      return { prev }
    },
    onError: (e, { boardId }, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.board(boardId), ctx.prev)
      toastError(e)
    },
    onSettled: (_data, _err, { boardId }) => {
      qc.invalidateQueries({ queryKey: qk.board(boardId) })
      qc.invalidateQueries({ queryKey: qk.boards })
      qc.invalidateQueries({ queryKey: ['dayCounts'] })
    },
  })
}
