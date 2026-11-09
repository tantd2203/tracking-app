import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const h = vi.hoisted(() => ({
  updateMutate: vi.fn(),
  card: null as unknown,
}))

vi.mock('../../api/cards', () => ({
  useCard: () => ({ data: h.card, isPending: false, isError: false }),
  useBoardData: () => ({ data: { board: { name: 'Bảng' } } }),
  useUpdateCard: () => ({ mutate: h.updateMutate }),
  useDeleteCard: () => ({ mutate: vi.fn() }),
  useRestoreCard: () => ({ mutate: vi.fn() }),
}))

vi.mock('../boards/useCardMove', () => ({
  useCardMove: () => ({ moveCard: vi.fn(), isPending: false }),
}))

vi.mock('./PriorityPicker', () => ({ PriorityPicker: () => null }))
vi.mock('./LabelPicker', () => ({ LabelPicker: () => null }))
vi.mock('./Checklist', () => ({ Checklist: () => null }))
vi.mock('./DueDateField', () => ({ DueDateField: () => null }))

import CardPage from './CardPage'

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/cards/c1']}>
      <Routes>
        <Route path="/cards/:cardId" element={<CardPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

beforeEach(() => {
  vi.useFakeTimers()
  h.updateMutate.mockReset()
  h.card = {
    id: 'c1',
    board_id: 'b1',
    title: 'Việc cũ',
    description: '',
    list: 'todo',
    due_date: null,
    priority: 'none',
    labels: [],
    checklist: { done: 0, total: 0 },
  }
})

afterEach(() => {
  cleanup()
  vi.useRealTimers()
  vi.restoreAllMocks()
})

describe('CardPage – tiêu đề', () => {
  it('xoá hết tiêu đề rồi chờ debounce thì không hoàn nguyên khi đang gõ', () => {
    renderPage()
    const title = screen.getByLabelText('Tiêu đề card')
    fireEvent.change(title, { target: { value: '' } })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(title).toHaveValue('')
    expect(h.updateMutate).not.toHaveBeenCalled()
  })

  it('rời ô khi tiêu đề rỗng thì trả lại tên cũ', () => {
    renderPage()
    const title = screen.getByLabelText('Tiêu đề card')
    fireEvent.change(title, { target: { value: '' } })
    fireEvent.blur(title)
    expect(title).toHaveValue('Việc cũ')
    expect(h.updateMutate).not.toHaveBeenCalled()
  })

  it('gõ tên mới rồi chờ debounce thì lưu', () => {
    renderPage()
    const title = screen.getByLabelText('Tiêu đề card')
    fireEvent.change(title, { target: { value: 'Việc mới' } })
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(h.updateMutate).toHaveBeenCalledWith(
      { id: 'c1', patch: { title: 'Việc mới' } },
      expect.anything(),
    )
  })
})
