import { describe, expect, it } from 'vitest'
import { afterCompletion } from './celebrate'

const NOW = new Date(2026, 10, 9) // 9/11/2026

function daysAgo(n: number): string {
  const d = new Date(2026, 10, 9 - n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

describe('afterCompletion', () => {
  it('card đầu tiên trong ngày: first = true, today = 1', () => {
    const r = afterCompletion({}, NOW)
    expect(r.first).toBe(true)
    expect(r.today).toBe(1)
  })

  it('đã có card hôm nay: first = false, cộng dồn số card', () => {
    const r = afterCompletion({ [daysAgo(0)]: 2 }, NOW)
    expect(r.first).toBe(false)
    expect(r.today).toBe(3)
  })

  it('streak nối tiếp hôm qua', () => {
    const r = afterCompletion({ [daysAgo(1)]: 1, [daysAgo(2)]: 4 }, NOW)
    expect(r.streak).toBe(3)
  })

  it('hôm qua trống thì streak bắt đầu lại từ 1', () => {
    const r = afterCompletion({ [daysAgo(3)]: 1 }, NOW)
    expect(r.streak).toBe(1)
  })
})
