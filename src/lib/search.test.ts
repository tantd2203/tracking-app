import { describe, expect, it } from 'vitest'
import { matchBoard, normalizeVi } from './search'

describe('normalizeVi', () => {
  it('bỏ dấu và viết thường', () => {
    expect(normalizeVi('Học tiếng Nhật')).toBe('hoc tieng nhat')
  })

  it('đổi đ thành d', () => {
    expect(normalizeVi('Đà Lạt')).toBe('da lat')
  })
})

describe('matchBoard', () => {
  const board = { name: 'Học tiếng Nhật', description: 'Ôn N3 mỗi tối' }

  it('khớp tên không dấu', () => {
    expect(matchBoard(board, 'hoc tieng')).toBe(true)
  })

  it('khớp mô tả', () => {
    expect(matchBoard(board, 'n3')).toBe(true)
  })

  it('không khớp khi không có trong tên và mô tả', () => {
    expect(matchBoard(board, 'du lich')).toBe(false)
  })

  it('từ khoá rỗng khớp tất cả', () => {
    expect(matchBoard(board, '   ')).toBe(true)
  })
})
