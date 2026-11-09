import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const mutate = vi.hoisted(() => vi.fn())

vi.mock('../../api/cards', () => ({
  useCreateCard: () => ({ mutate }),
}))

import { AddCardInput } from './AddCardInput'

function renderInput(onDone = vi.fn()) {
  render(<AddCardInput boardId="b1" list="todo" onDone={onDone} />)
  return { input: screen.getByLabelText('Tên card mới'), onDone }
}

beforeEach(() => {
  mutate.mockReset()
  vi.spyOn(performance, 'now').mockReturnValue(10_000)
})

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('AddCardInput', () => {
  it('Enter thường thêm card và xoá ô nhập', () => {
    const { input } = renderInput()
    fireEvent.change(input, { target: { value: '  Việc mới  ' } })
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 })
    expect(mutate).toHaveBeenCalledWith({ boardId: 'b1', list: 'todo', title: 'Việc mới' })
    expect(input).toHaveValue('')
  })

  it('Enter có keyCode 229 (bàn phím ảo) không ngay sau ghép chữ vẫn thêm card', () => {
    const { input } = renderInput()
    fireEvent.change(input, { target: { value: 'abc' } })
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 })
    expect(mutate).toHaveBeenCalledTimes(1)
  })

  it('Enter chốt chữ tiếng Việt (ngay sau compositionend, keyCode 229) không thêm card sớm', () => {
    const now = vi.mocked(performance.now)
    const { input } = renderInput()
    fireEvent.change(input, { target: { value: 'Việt' } })
    now.mockReturnValue(20_000)
    fireEvent.compositionEnd(input)
    now.mockReturnValue(20_020)
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 229 })
    expect(mutate).not.toHaveBeenCalled()
    expect(input).toHaveValue('Việt')
  })

  it('Enter khi đang ghép (isComposing) không thêm card', () => {
    const { input } = renderInput()
    fireEvent.change(input, { target: { value: 'Việt' } })
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13, isComposing: true })
    expect(mutate).not.toHaveBeenCalled()
  })

  it('ô trống thì Enter không thêm card', () => {
    const { input } = renderInput()
    fireEvent.change(input, { target: { value: '   ' } })
    fireEvent.keyDown(input, { key: 'Enter', keyCode: 13 })
    expect(mutate).not.toHaveBeenCalled()
  })

  it('ô nhập có enterKeyHint="done"', () => {
    const { input } = renderInput()
    expect(input).toHaveAttribute('enterkeyhint', 'done')
  })

  it('Esc và nút ✕ đóng ô', () => {
    const { input, onDone } = renderInput()
    fireEvent.keyDown(input, { key: 'Escape' })
    fireEvent.click(screen.getByRole('button', { name: 'Đóng' }))
    expect(onDone).toHaveBeenCalledTimes(2)
  })

  it('mất focus không đóng ô (không đóng khi blur)', () => {
    const { input, onDone } = renderInput()
    fireEvent.blur(input, { relatedTarget: null })
    expect(onDone).not.toHaveBeenCalled()
  })

  it('chạm ra ngoài ô thì đóng, chạm bên trong thì không', () => {
    const { input, onDone } = renderInput()
    fireEvent.pointerDown(input)
    expect(onDone).not.toHaveBeenCalled()
    fireEvent.pointerDown(document.body)
    expect(onDone).toHaveBeenCalledTimes(1)
  })
})
