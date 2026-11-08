import { describe, expect, it } from 'vitest'
import { needsRebalance, positionBetween } from './position'

describe('positionBetween', () => {
  it('không có a: đứng trước b, cách 1024', () => {
    expect(positionBetween(undefined, 2048)).toBe(1024)
  })

  it('không có b: đứng sau a, cách 1024', () => {
    expect(positionBetween(1024, undefined)).toBe(2048)
  })

  it('có cả a và b: lấy trung bình', () => {
    expect(positionBetween(1024, 3072)).toBe(2048)
  })

  it('không có cả hai (list trống): vị trí đầu tiên là 1024', () => {
    expect(positionBetween(undefined, undefined)).toBe(1024)
  })
})

describe('needsRebalance', () => {
  it('false khi các vị trí cách nhau đủ xa', () => {
    expect(needsRebalance([1024, 2048, 3072])).toBe(false)
  })

  it('true khi hai vị trí cách nhau dưới 0.0001', () => {
    expect(needsRebalance([1024, 1024.00001])).toBe(true)
  })

  it('không tuỳ thuộc thứ tự truyền vào', () => {
    expect(needsRebalance([1024.00001, 1024])).toBe(true)
  })
})
