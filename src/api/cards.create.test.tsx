import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { useBoardData, useCreateCard } from './cards'

// Máy chủ giả: danh sách card thật trong DB.
const server = vi.hoisted(() => ({ cards: [] as Record<string, unknown>[], seq: 0 }))

vi.mock('./client', () => {
  const board = {
    id: 'b1',
    user_id: 'u1',
    name: 'B',
    description: '',
    color: 0,
    pinned: false,
    archived_at: null,
    created_at: '2026-01-01T00:00:00Z',
  }
  const lists = [
    {
      id: 'l-todo',
      board_id: 'b1',
      key: 'todo',
      name: 'To Do',
      position: 1,
      is_done_list: false,
      user_id: 'u1',
    },
    {
      id: 'l-doing',
      board_id: 'b1',
      key: 'doing',
      name: 'Doing',
      position: 2,
      is_done_list: false,
      user_id: 'u1',
    },
    {
      id: 'l-done',
      board_id: 'b1',
      key: 'done',
      name: 'Done',
      position: 3,
      is_done_list: true,
      user_id: 'u1',
    },
  ]
  const result = (data: unknown) => ({ data, error: null })
  const chain = (table: string) => {
    const b: Record<string, unknown> = {}
    const self = () => b
    b.select = self
    b.eq = self
    b.is = self
    b.in = self
    b.order = self
    b.single = () => {
      if (table === 'boards') return Promise.resolve(result(board))
      return Promise.resolve(result(null))
    }
    b.then = (ok: (v: unknown) => unknown) => {
      if (table === 'lists') return Promise.resolve(result(lists)).then(ok)
      if (table === 'cards')
        return new Promise((r) => setTimeout(r, 40))
          .then(() => result(server.cards.filter((c) => c.archived_at === null)))
          .then(ok)
      return Promise.resolve(result([])).then(ok)
    }
    return b
  }
  return {
    db: () => ({
      from: (t: string) => chain(t),
      rpc: async (name: string, args: { p_title: string; p_list: string }) => {
        // Giữ chậm một chút như mạng thật
        await new Promise((r) => setTimeout(r, 20))
        if (name !== 'create_card') throw new Error('unexpected rpc ' + name)
        server.seq += 1
        const row = {
          id: `srv-${server.seq}`,
          title: args.p_title,
          list_id: args.p_list === 'todo' ? 'l-todo' : 'l-doing',
          board_id: 'b1',
          position: server.seq * 1024,
          archived_at: null,
          completed_at: null,
          completed_on: null,
          due_date: null,
          priority: 'none',
          description: '',
          created_at: '2026-01-01T00:00:00Z',
          updated_at: '2026-01-01T00:00:00Z',
          user_id: 'u1',
        }
        server.cards.push(row)
        return { data: row, error: null }
      },
    }),
    isSupabaseConfigured: true,
    SupabaseNotConfiguredError: class extends Error {},
  }
})

vi.mock('./auth', () => ({
  useSession: () => ({
    demo: false,
    session: { user: { id: 'u1', email: 'a@b.c' } },
    loading: false,
  }),
}))

describe('thêm card liên tiếp', () => {
  it('không tạo card trùng khi refetch chậm và thêm lần lượt', async () => {
    server.cards = []
    server.seq = 0
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={qc}>{children}</QueryClientProvider>
    )
    const { result } = renderHook(() => ({ board: useBoardData('b1'), create: useCreateCard() }), {
      wrapper,
    })
    await waitFor(() => expect(result.current.board.isSuccess).toBe(true))

    await act(async () => {
      await result.current.create.mutateAsync({ boardId: 'b1', list: 'todo', title: 'A' })
      await new Promise((r) => setTimeout(r, 10))
      await result.current.create.mutateAsync({ boardId: 'b1', list: 'todo', title: 'B' })
    })
    await waitFor(() => expect(qc.isFetching()).toBe(0))

    const titles = (result.current.board.data?.cards.todo ?? []).map((c) => c.title)
    expect(titles.sort()).toEqual(['A', 'B'])
  })
})
