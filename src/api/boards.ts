import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { toLocalISO } from '../lib/date'
import { db } from './client'
import { useSession } from './auth'
import { toastError, unwrap } from './errors'
import { qk } from './keys'
import type { Board } from './types'

export type BoardWithStats = Board & {
  total: number
  doing: number
  done: number
  overdue: number
  /** % card xong, làm tròn. Board chưa có card thì là 0. */
  pct: number
}

export type BoardsData = { active: BoardWithStats[]; archived: BoardWithStats[] }

type Stats = { board_id: string; total: number; doing: number; done: number; overdue: number }

/** Thời gian (ms) trước khi xoá board thật, trong thời gian đó có thể hoàn tác. */
const UNDO_DELAY_MS = 5000

function withStats(board: Board, s: Stats | undefined): BoardWithStats {
  const total = s?.total ?? 0
  const done = s?.done ?? 0
  return {
    ...board,
    total,
    doing: s?.doing ?? 0,
    done,
    overdue: s?.overdue ?? 0,
    pct: total === 0 ? 0 : Math.round((done / total) * 100),
  }
}

/** Ghim lên đầu, rồi theo created_at tăng dần. */
function sortBoards(list: BoardWithStats[]): BoardWithStats[] {
  return [...list].sort(
    (a, b) => Number(b.pinned) - Number(a.pinned) || a.created_at.localeCompare(b.created_at),
  )
}

function rebuild(all: BoardWithStats[]): BoardsData {
  const sorted = sortBoards(all)
  return {
    active: sorted.filter((b) => !b.archived_at),
    archived: sorted.filter((b) => b.archived_at),
  }
}

function allBoards(data: BoardsData): BoardWithStats[] {
  return [...data.active, ...data.archived]
}

async function fetchBoards(): Promise<BoardsData> {
  const client = db()
  const [boardsRes, statsRes] = await Promise.all([
    client.from('boards').select('*').order('created_at', { ascending: true }),
    client.rpc('board_stats', { p_today: toLocalISO(new Date()) }),
  ])
  const boards = unwrap(boardsRes)
  const stats = new Map(unwrap(statsRes).map((s) => [s.board_id, s as Stats]))
  return rebuild(boards.map((b) => withStats(b, stats.get(b.id))))
}

/** Danh sách board: `active` (đang dùng) và `archived` (đã lưu trữ), kèm thống kê card. */
export function useBoards(): UseQueryResult<BoardsData> {
  const { demo, session } = useSession()
  return useQuery({
    queryKey: qk.boards,
    queryFn: fetchBoards,
    enabled: !demo && Boolean(session),
  })
}

/**
 * Tạo board (kèm 3 list). `color` do FE truyền vào, khuyến nghị dùng `số board hiện có % 4`.
 * Board tạm xuất hiện ngay trong cache, lỗi thì rollback.
 */
export function useCreateBoard(): UseMutationResult<
  Board,
  Error,
  { name: string; description?: string; color: number },
  { prev: BoardsData | undefined }
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ name, description = '', color }) =>
      unwrap(
        await db().rpc('create_board', {
          p_name: name,
          p_description: description,
          p_color: color,
        }),
      ),
    onMutate: async ({ name, description = '', color }) => {
      await qc.cancelQueries({ queryKey: qk.boards })
      const prev = qc.getQueryData<BoardsData>(qk.boards)
      if (prev) {
        const temp = withStats(
          {
            id: `temp-${Date.now()}`,
            user_id: '',
            name,
            description,
            color,
            pinned: false,
            archived_at: null,
            created_at: new Date().toISOString(),
          },
          undefined,
        )
        qc.setQueryData<BoardsData>(qk.boards, rebuild([...allBoards(prev), temp]))
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.boards, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.boards }),
  })
}

type BoardPatch = Partial<Pick<Board, 'name' | 'description' | 'color' | 'pinned'>>

/** Sửa tên, mô tả, màu hoặc ghim. Ghim đổi thứ tự ngay trong cache. */
export function useUpdateBoard(): UseMutationResult<
  Board,
  Error,
  { id: string; patch: BoardPatch },
  { prev: BoardsData | undefined }
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, patch }) =>
      unwrap(await db().from('boards').update(patch).eq('id', id).select().single()),
    onMutate: async ({ id, patch }) => {
      await qc.cancelQueries({ queryKey: qk.boards })
      const prev = qc.getQueryData<BoardsData>(qk.boards)
      if (prev) {
        qc.setQueryData<BoardsData>(
          qk.boards,
          rebuild(allBoards(prev).map((b) => (b.id === id ? { ...b, ...patch } : b))),
        )
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.boards, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.boards }),
  })
}

/** Lưu trữ (`archived: true`) hoặc khôi phục (`archived: false`). Board chuyển ngay giữa hai nhóm. */
export function useArchiveBoard(): UseMutationResult<
  void,
  Error,
  { id: string; archived: boolean },
  { prev: BoardsData | undefined }
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, archived }) => {
      const { error } = await db()
        .from('boards')
        .update({ archived_at: archived ? new Date().toISOString() : null })
        .eq('id', id)
      if (error) throw error
    },
    onMutate: async ({ id, archived }) => {
      await qc.cancelQueries({ queryKey: qk.boards })
      const prev = qc.getQueryData<BoardsData>(qk.boards)
      if (prev) {
        const archivedAt = archived ? new Date().toISOString() : null
        qc.setQueryData<BoardsData>(
          qk.boards,
          rebuild(
            allBoards(prev).map((b) => (b.id === id ? { ...b, archived_at: archivedAt } : b)),
          ),
        )
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.boards, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.boards }),
  })
}

/** Nhân bản board (kèm card). Có bản tạm trong cache khi đang chờ server. */
export function useDuplicateBoard(): UseMutationResult<
  Board,
  Error,
  { id: string },
  { prev: BoardsData | undefined }
> {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id }) => unwrap(await db().rpc('duplicate_board', { p_board_id: id })),
    onMutate: async ({ id }) => {
      await qc.cancelQueries({ queryKey: qk.boards })
      const prev = qc.getQueryData<BoardsData>(qk.boards)
      const source = prev && allBoards(prev).find((b) => b.id === id)
      if (prev && source) {
        const copy = withStats(
          {
            id: `temp-copy-${Date.now()}`,
            user_id: source.user_id,
            name: `${source.name} (bản sao)`.slice(0, 40),
            description: source.description,
            color: source.color,
            pinned: false,
            archived_at: null,
            created_at: new Date().toISOString(),
          },
          undefined,
        )
        qc.setQueryData<BoardsData>(qk.boards, rebuild([...allBoards(prev), copy]))
      }
      return { prev }
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) qc.setQueryData(qk.boards, ctx.prev)
    },
    onSettled: () => qc.invalidateQueries({ queryKey: qk.boards }),
  })
}

/**
 * Xoá có hoàn tác. Board biến khỏi cache ngay; sau 5 giây mới xoá thật trong DB.
 * Nếu người dùng đóng app trước 5 giây thì board không bị xoá (chấp nhận được, xem ghi chú BE-05).
 */
export function useDeleteBoard(): {
  scheduleDelete: (id: string) => { undo: () => void }
} {
  const qc = useQueryClient()

  function scheduleDelete(id: string) {
    const prev = qc.getQueryData<BoardsData>(qk.boards)
    const removed = prev && allBoards(prev).find((b) => b.id === id)
    if (prev) {
      qc.setQueryData<BoardsData>(qk.boards, rebuild(allBoards(prev).filter((b) => b.id !== id)))
    }

    const timer = setTimeout(async () => {
      try {
        const { error } = await db().from('boards').delete().eq('id', id)
        if (error) throw error
      } catch (e) {
        toastError(e)
      } finally {
        qc.invalidateQueries({ queryKey: qk.boards })
      }
    }, UNDO_DELAY_MS)

    return {
      undo: () => {
        clearTimeout(timer)
        const current = qc.getQueryData<BoardsData>(qk.boards)
        if (current && removed) {
          qc.setQueryData<BoardsData>(qk.boards, rebuild([...allBoards(current), removed]))
        }
      },
    }
  }

  return { scheduleDelete }
}
