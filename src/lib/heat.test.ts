import { describe, expect, it } from 'vitest'
import { addDays, toLocalISO } from './date'
import { bestStreak, currentStreak, heatLevel, whaleMood, type DayCounts } from './heat'

const TODAY = new Date(2026, 10, 8) // 08/11/2026

/** Tạo dữ liệu: mảng số card, phần tử cuối là hôm nay. */
function counts(...values: number[]): DayCounts {
  const out: DayCounts = {}
  values.forEach((v, i) => {
    out[toLocalISO(addDays(TODAY, i - (values.length - 1)))] = v
  })
  return out
}

describe('heatLevel', () => {
  it.each([
    [0, 0],
    [1, 1],
    [2, 2],
    [3, 2],
    [4, 3],
    [5, 3],
    [6, 4],
    [20, 4],
  ])('%i card → mức %i', (count, level) => {
    expect(heatLevel(count)).toBe(level)
  })
})

describe('currentStreak', () => {
  it('đếm cả hôm nay khi hôm nay đã xong card', () => {
    expect(currentStreak(counts(0, 2, 1, 3), TODAY)).toBe(3)
  })

  it('hôm nay chưa xong thì vẫn giữ chuỗi tới hôm qua', () => {
    expect(currentStreak(counts(1, 1, 1, 0), TODAY)).toBe(3)
  })

  it('đứt chuỗi khi hôm qua và hôm nay đều trống', () => {
    expect(currentStreak(counts(4, 4, 0, 0), TODAY)).toBe(0)
  })
})

describe('bestStreak', () => {
  it('lấy chuỗi dài nhất trong năm', () => {
    expect(bestStreak(counts(1, 1, 1, 1, 0, 1, 1, 0, 1), TODAY)).toBe(4)
  })
})

describe('whaleMood', () => {
  it('tài khoản mới → bình thản', () => {
    expect(whaleMood({ totalThisYear: 0, streak: 0, today: 0 })).toBe('calm')
  })
  it('đã xong hôm nay → vui', () => {
    expect(whaleMood({ totalThisYear: 10, streak: 4, today: 1 })).toBe('cheer')
  })
  it('mất streak → buồn', () => {
    expect(whaleMood({ totalThisYear: 10, streak: 0, today: 0 })).toBe('sad')
  })
})
