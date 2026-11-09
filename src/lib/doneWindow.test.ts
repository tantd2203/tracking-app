import { describe, expect, it } from 'vitest'
import { DONE_WINDOW_DAYS, dropBarSlot, isRecentDone } from './doneWindow'

describe('isRecentDone', () => {
  const today = '2026-11-09'

  it('cửa sổ mặc định là 7 ngày', () => {
    expect(DONE_WINDOW_DAYS).toBe(7)
  })

  it('hôm nay và 6 ngày trước là gần đây', () => {
    expect(isRecentDone('2026-11-09', today)).toBe(true)
    expect(isRecentDone('2026-11-03', today)).toBe(true)
  })

  it('cũ hơn 7 ngày thì không gần đây', () => {
    expect(isRecentDone('2026-11-02', today)).toBe(false)
  })

  it('không có ngày hoàn thành thì hiện', () => {
    expect(isRecentDone(null, today)).toBe(true)
  })

  it('qua tháng mới vẫn đúng', () => {
    expect(isRecentDone('2026-10-30', '2026-11-03')).toBe(true)
    expect(isRecentDone('2026-10-27', '2026-11-03')).toBe(false)
  })
})

describe('dropBarSlot', () => {
  it('không có vạch khi dropAt là null', () => {
    expect(dropBarSlot(['a', 'b'], null, ['a', 'b'], null)).toBeNull()
  })

  it('khi không có card ẩn, vị trí giống cũ', () => {
    // thả vào vị trí 1 (giữa a và b)
    expect(dropBarSlot(['a', 'b', 'c'], null, ['a', 'b', 'c'], 1)).toBe(1)
    // thả cuối
    expect(dropBarSlot(['a', 'b'], null, ['a', 'b'], 2)).toBe(2)
  })

  it('bỏ qua card đang kéo khi đếm vị trí', () => {
    // full: a, X(đang kéo), b. dropAt 1 (không kể X) = trước b, mà b là phần tử thứ 2 của danh sách hiện (X vẫn hiện mờ)
    expect(dropBarSlot(['a', 'X', 'b'], 'X', ['a', 'X', 'b'], 1)).toBe(2)
  })

  it('card ẩn đứng trước vị trí thả thì vạch đặt đúng theo card hiện', () => {
    // full: h1(ẩn), h2(ẩn), a, b. Hiện a, b. dropAt 3 (sau h1, h2, a) = trước b.
    expect(dropBarSlot(['h1', 'h2', 'a', 'b'], null, ['a', 'b'], 3)).toBe(1)
  })

  it('thả vào vị trí nằm trong phần ẩn thì vạch đặt trước card hiện kế tiếp', () => {
    // full: a, h1(ẩn), b. Thả sau a (dropAt 1) -> trước b (card hiện đầu tiên có vị trí >= 1).
    expect(dropBarSlot(['a', 'h1', 'b'], null, ['a', 'b'], 1)).toBe(1)
  })

  it('thả sau mọi card hiện thì vạch ở cuối', () => {
    expect(dropBarSlot(['a', 'h1', 'h2'], null, ['a'], 2)).toBe(1)
  })
})
