import { describe, expect, it } from 'vitest'
import { BOARD_COLORS, boardColor } from './palette'

describe('boardColor', () => {
  it('lấy đúng màu theo số thứ tự 0–3', () => {
    expect(boardColor(0)).toBe(BOARD_COLORS[0])
    expect(boardColor(3)).toBe(BOARD_COLORS[3])
  })

  it('xoay vòng khi số lớn hơn 3 hoặc âm', () => {
    expect(boardColor(4)).toBe(BOARD_COLORS[0])
    expect(boardColor(5)).toBe(BOARD_COLORS[1])
    expect(boardColor(-1)).toBe(BOARD_COLORS[3])
  })
})
