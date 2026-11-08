import { useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { useMoveCard, type MoveResult } from '../../api/cards'
import { getCachedYearCounts } from '../../api/stats'
import { celebrate } from '../../components/celebrate'
import { afterCompletion } from '../../lib/celebrate'

type MoveVars = {
  cardId: string
  boardId: string
  toList: 'todo' | 'doing' | 'done'
  toIndex: number
}

/**
 * Chuyển card và mở popup ăn mừng khi card vừa vào Done.
 * Số liệu popup lấy từ cache trước khi chuyển, nên hiện ngay không chờ server.
 */
export function useCardMove(): {
  moveCard: (vars: MoveVars, title: string, returnTo?: string) => void
  isPending: boolean
} {
  const qc = useQueryClient()
  const move = useMoveCard()

  const moveCard = useCallback(
    (vars: MoveVars, title: string, returnTo?: string) => {
      const before = getCachedYearCounts(qc)
      move.mutate(vars, {
        onSuccess: (result: MoveResult) => {
          if (!result.completedNow) return
          const done = afterCompletion(before ?? {})
          celebrate({ title, first: done.first, streak: done.streak, today: done.today, returnTo })
        },
      })
    },
    [qc, move],
  )

  return { moveCard, isPending: move.isPending }
}
