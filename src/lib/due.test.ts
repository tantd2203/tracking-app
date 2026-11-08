import { describe, expect, it } from 'vitest'
import { dueLabel } from './due'

const TODAY = '2026-11-08'

describe('dueLabel', () => {
  it('không có hạn thì trả về null', () => {
    expect(dueLabel(null, TODAY)).toBeNull()
  })

  it('đã qua: "Quá hạn N ngày" và đánh dấu quá hạn', () => {
    expect(dueLabel('2026-11-05', TODAY)).toEqual({
      text: 'Quá hạn 3 ngày',
      overdue: true,
      soon: false,
    })
  })

  it('hôm nay: "Hôm nay" và sắp tới', () => {
    expect(dueLabel(TODAY, TODAY)).toEqual({ text: 'Hôm nay', overdue: false, soon: true })
  })

  it('ngày mai: "Ngày mai" và sắp tới', () => {
    expect(dueLabel('2026-11-09', TODAY)).toEqual({
      text: 'Ngày mai',
      overdue: false,
      soon: true,
    })
  })

  it('xa hơn: hiện dd/mm, không đánh dấu', () => {
    expect(dueLabel('2026-11-12', TODAY)).toEqual({ text: '12/11', overdue: false, soon: false })
  })

  it('qua tháng vẫn tính đúng số ngày', () => {
    expect(dueLabel('2026-10-30', '2026-11-02')).toEqual({
      text: 'Quá hạn 3 ngày',
      overdue: true,
      soon: false,
    })
  })
})
