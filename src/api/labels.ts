import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { db } from './client'
import { useSession } from './auth'
import { patchCardInBoards, type CardDetail } from './cards'
import { toastError, unwrap } from './errors'
import { qk } from './keys'
import type { Label } from './types'

/** Ghi danh sách nhãn của card vào cả cache card lẫn cache board (để thẻ Kanban cũng đổi). */
export function setCardLabels(qc: QueryClient, cardId: string, labels: Label[]) {
  qc.setQueryData<CardDetail>(qk.card(cardId), (old) => (old ? { ...old, labels } : old))
  patchCardInBoards(qc, cardId, { labels })
}

/** Nhãn của người dùng, dùng chung mọi board. */
export function useLabels(): UseQueryResult<Label[]> {
  const { demo, session } = useSession()
  return useQuery({
    queryKey: qk.labels,
    queryFn: async () =>
      unwrap(await db().from('labels').select('*').order('name', { ascending: true })),
    enabled: !demo && Boolean(session),
  })
}

type CreateVars = {
  name: string
  color: number
  /** Gắn luôn nhãn mới vào card đang mở. */
  attachTo?: { cardId: string; boardId: string }
}

/** Tạo nhãn mới, có thể gắn ngay vào một card. Nhãn tạm xuất hiện ngay, lỗi thì rollback. */
export function useCreateLabel(): UseMutationResult<
  Label,
  Error,
  CreateVars,
  { prevLabels: Label[] | undefined; prevCard: CardDetail | undefined }
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, color, attachTo }) => {
      const res = await db().from('labels').insert({ name: name.trim(), color }).select().single()
      const label = unwrap(res)
      if (attachTo) {
        const { error } = await db()
          .from('card_labels')
          .insert({ card_id: attachTo.cardId, label_id: label.id })
        if (error) throw error
      }
      return label
    },
    onMutate: async ({ name, color, attachTo }) => {
      await qc.cancelQueries({ queryKey: qk.labels })
      const prevLabels = qc.getQueryData<Label[]>(qk.labels)
      const temp: Label = { id: `temp-${Date.now()}`, user_id: '', name: name.trim(), color }
      qc.setQueryData<Label[]>(qk.labels, [...(prevLabels ?? []), temp])

      let prevCard: CardDetail | undefined
      if (attachTo) {
        prevCard = qc.getQueryData<CardDetail>(qk.card(attachTo.cardId))
        const current = prevCard?.labels ?? []
        setCardLabels(qc, attachTo.cardId, [...current, temp])
      }
      return { prevLabels, prevCard }
    },
    onError: (e, { attachTo }, ctx) => {
      if (ctx?.prevLabels) qc.setQueryData(qk.labels, ctx.prevLabels)
      if (attachTo && ctx?.prevCard) qc.setQueryData(qk.card(attachTo.cardId), ctx.prevCard)
      if (attachTo) qc.invalidateQueries({ queryKey: ['board'] })
      toastError(e)
    },
    onSettled: (_data, _err, { attachTo }) => {
      qc.invalidateQueries({ queryKey: qk.labels })
      if (attachTo) {
        qc.invalidateQueries({ queryKey: qk.card(attachTo.cardId) })
        qc.invalidateQueries({ queryKey: ['board'] })
      }
    },
  })
}

/**
 * Gắn (`on: true`) hoặc bỏ gắn (`on: false`) một nhãn cho card.
 * Bỏ gắn không xoá nhãn khỏi danh sách chung.
 */
export function useToggleCardLabel(): UseMutationResult<
  void,
  Error,
  { cardId: string; boardId: string; labelId: string; on: boolean },
  { prevCard: CardDetail | undefined }
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ cardId, labelId, on }) => {
      if (on) {
        const { error } = await db()
          .from('card_labels')
          .insert({ card_id: cardId, label_id: labelId })
        // Đã gắn rồi (khoá chính trùng) thì coi như thành công.
        if (error && error.code !== '23505') throw error
      } else {
        const { error } = await db()
          .from('card_labels')
          .delete()
          .eq('card_id', cardId)
          .eq('label_id', labelId)
        if (error) throw error
      }
    },
    onMutate: async ({ cardId, labelId, on }) => {
      await qc.cancelQueries({ queryKey: qk.card(cardId) })
      const prevCard = qc.getQueryData<CardDetail>(qk.card(cardId))
      const current = prevCard?.labels ?? []
      const label = qc.getQueryData<Label[]>(qk.labels)?.find((l) => l.id === labelId)
      let next = current
      if (on && label && !current.some((l) => l.id === labelId)) next = [...current, label]
      if (!on) next = current.filter((l) => l.id !== labelId)
      setCardLabels(qc, cardId, next)
      return { prevCard }
    },
    onError: (e, { cardId, boardId }, ctx) => {
      if (ctx?.prevCard) qc.setQueryData(qk.card(cardId), ctx.prevCard)
      qc.invalidateQueries({ queryKey: qk.board(boardId) })
      toastError(e)
    },
    onSettled: (_data, _err, { cardId }) => {
      qc.invalidateQueries({ queryKey: qk.card(cardId) })
      qc.invalidateQueries({ queryKey: ['board'] })
    },
  })
}
