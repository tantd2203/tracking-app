import {
  useMutation,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import { db } from './client'
import { patchCardInBoards, type CardDetail } from './cards'
import { toastError, unwrap } from './errors'
import { qk } from './keys'
import type { ChecklistItem } from './types'

const STEP = 1024

/** Ghi danh sách việc con của card, rồi cập nhật số done/total trong cache board. */
function applyChecklist(qc: QueryClient, cardId: string, items: ChecklistItem[]) {
  const checklist = { done: items.filter((i) => i.done).length, total: items.length }
  qc.setQueryData<CardDetail>(qk.card(cardId), (old) =>
    old ? { ...old, checklistItems: items, checklist } : old,
  )
  patchCardInBoards(qc, cardId, { checklist })
}

function itemsOf(qc: QueryClient, cardId: string): ChecklistItem[] {
  return qc.getQueryData<CardDetail>(qk.card(cardId))?.checklistItems ?? []
}

type Ctx = { prev: ChecklistItem[] }

function settle(qc: QueryClient, cardId: string, boardId: string) {
  qc.invalidateQueries({ queryKey: qk.card(cardId) })
  qc.invalidateQueries({ queryKey: qk.board(boardId) })
}

/** Thêm việc con vào cuối danh sách. */
export function useAddChecklistItem(): UseMutationResult<
  ChecklistItem,
  Error,
  { cardId: string; boardId: string; text: string },
  Ctx
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ cardId, text }) => {
      // Tính trên cả bản tạm: hai lần thêm liên tiếp sẽ có vị trí tăng dần, không trùng nhau.
      const items = itemsOf(qc, cardId)
      const top = items.reduce((max, i) => Math.max(max, i.position), 0)
      const position = top + STEP
      return unwrap(
        await db()
          .from('checklist_items')
          .insert({ card_id: cardId, text: text.trim(), position })
          .select()
          .single(),
      )
    },
    onMutate: async ({ cardId, text }) => {
      await qc.cancelQueries({ queryKey: qk.card(cardId) })
      const prev = itemsOf(qc, cardId)
      const last = prev[prev.length - 1]
      const temp: ChecklistItem = {
        id: `temp-${Date.now()}`,
        card_id: cardId,
        user_id: '',
        text: text.trim(),
        done: false,
        position: (last?.position ?? 0) + STEP,
      }
      applyChecklist(qc, cardId, [...prev, temp])
      return { prev }
    },
    onError: (e, { cardId, boardId }, ctx) => {
      if (ctx) applyChecklist(qc, cardId, ctx.prev)
      qc.invalidateQueries({ queryKey: qk.board(boardId) })
      toastError(e)
    },
    onSettled: (_d, _e, { cardId, boardId }) => settle(qc, cardId, boardId),
  })
}

/** Sửa chữ hoặc tick một việc con. */
export function useUpdateChecklistItem(): UseMutationResult<
  ChecklistItem,
  Error,
  { id: string; cardId: string; boardId: string; patch: { text?: string; done?: boolean } },
  Ctx
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }) =>
      unwrap(await db().from('checklist_items').update(patch).eq('id', id).select().single()),
    onMutate: async ({ id, cardId, patch }) => {
      await qc.cancelQueries({ queryKey: qk.card(cardId) })
      const prev = itemsOf(qc, cardId)
      applyChecklist(
        qc,
        cardId,
        prev.map((i) => (i.id === id ? { ...i, ...patch } : i)),
      )
      return { prev }
    },
    onError: (e, { cardId, boardId }, ctx) => {
      if (ctx) applyChecklist(qc, cardId, ctx.prev)
      qc.invalidateQueries({ queryKey: qk.board(boardId) })
      toastError(e)
    },
    onSettled: (_d, _e, { cardId, boardId }) => settle(qc, cardId, boardId),
  })
}

/** Xoá một việc con. */
export function useDeleteChecklistItem(): UseMutationResult<
  void,
  Error,
  { id: string; cardId: string; boardId: string },
  Ctx
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }) => {
      const { error } = await db().from('checklist_items').delete().eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, cardId }) => {
      await qc.cancelQueries({ queryKey: qk.card(cardId) })
      const prev = itemsOf(qc, cardId)
      applyChecklist(
        qc,
        cardId,
        prev.filter((i) => i.id !== id),
      )
      return { prev }
    },
    onError: (e, { cardId, boardId }, ctx) => {
      if (ctx) applyChecklist(qc, cardId, ctx.prev)
      qc.invalidateQueries({ queryKey: qk.board(boardId) })
      toastError(e)
    },
    onSettled: (_d, _e, { cardId, boardId }) => settle(qc, cardId, boardId),
  })
}
