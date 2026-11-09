import { useMutation, useQueryClient, type UseMutationResult } from '@tanstack/react-query'
import { toLocalISO } from '../lib/date'
import { db } from './client'
import type { CardDetail } from './cards'
import { toastError, unwrap } from './errors'
import { qk } from './keys'
import type { Card } from './types'

/** Khoảng cách vị trí giữa các việc con, khớp với checklist.ts. */
const STEP = 1024

/**
 * Nhân bản card: sao chép tiêu đề, mô tả, ưu tiên, nhãn và các việc con (đặt lại chưa xong).
 * Hạn chót không sao chép vì thường gắn với một ngày cụ thể. Card mới nằm ở To Do.
 *
 * Các bước làm tuần tự (tạo card, rồi ghi thêm). Nếu bước sau lỗi thì card đã tạo vẫn còn,
 * và báo lỗi để người dùng kiểm tra lại.
 */
export function useDuplicateCard(): UseMutationResult<Card, Error, { source: CardDetail }> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ source }) => {
      const copy = unwrap(
        await db().rpc('create_card', {
          p_board_id: source.board_id,
          p_list: 'todo',
          p_title: source.title,
          p_local_date: toLocalISO(new Date()),
        }),
      )

      if (source.description || source.priority !== 'none') {
        unwrap(
          await db()
            .from('cards')
            .update({ description: source.description, priority: source.priority })
            .eq('id', copy.id)
            .select()
            .single(),
        )
      }

      if (source.labels.length > 0) {
        const rows = source.labels.map((l) => ({ card_id: copy.id, label_id: l.id }))
        const { error } = await db().from('card_labels').insert(rows)
        if (error) throw error
      }

      if (source.checklistItems.length > 0) {
        const rows = source.checklistItems.map((item, i) => ({
          card_id: copy.id,
          text: item.text,
          position: (i + 1) * STEP,
          done: false,
        }))
        const { error } = await db().from('checklist_items').insert(rows)
        if (error) throw error
      }

      return copy
    },
    onSuccess: (_copy, { source }) => {
      qc.invalidateQueries({ queryKey: qk.board(source.board_id) })
      qc.invalidateQueries({ queryKey: qk.boards })
    },
    onError: (e) => toastError(e),
  })
}
