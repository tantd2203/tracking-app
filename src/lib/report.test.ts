import { describe, expect, it } from 'vitest'
import { toLocalISO } from './date'
import {
  bestLine,
  buildReport,
  canGoBack,
  canGoForward,
  periodDays,
  periodLabel,
  reportMood,
  reportNote,
} from './report'

// 8/11/2026 là Chủ Nhật.
const SUNDAY = new Date(2026, 10, 8)
// 4/11/2026 là Thứ Tư.
const WEDNESDAY = new Date(2026, 10, 4)

describe('periodDays', () => {
  it('tuần chứa Chủ Nhật bắt đầu từ Thứ Hai và kết thúc ở Chủ Nhật', () => {
    const days = periodDays('week', 0, SUNDAY)
    expect(days).toHaveLength(7)
    expect(days[0].getDay()).toBe(1)
    expect(toLocalISO(days[0])).toBe('2026-11-02')
    expect(toLocalISO(days[6])).toBe('2026-11-08')
  })

  it('tuần trước lùi đúng 7 ngày', () => {
    expect(toLocalISO(periodDays('week', -1, SUNDAY)[0])).toBe('2026-10-26')
  })

  it('tháng 2 năm nhuận có 29 ngày, không nhuận có 28', () => {
    const feb2028 = new Date(2028, 1, 15)
    expect(periodDays('month', 0, feb2028)).toHaveLength(29)
    const feb2027 = new Date(2027, 1, 15)
    expect(periodDays('month', 0, feb2027)).toHaveLength(28)
  })

  it('tháng 30 và 31 ngày', () => {
    expect(periodDays('month', 0, new Date(2026, 3, 10))).toHaveLength(30) // tháng 4
    expect(periodDays('month', 0, new Date(2026, 0, 10))).toHaveLength(31) // tháng 1
  })
})

describe('periodLabel', () => {
  it('tuần hiện tại và tuần trước', () => {
    expect(periodLabel('week', 0, SUNDAY)).toEqual({ label: '2/11 – 8/11/2026', sub: 'Tuần này' })
    expect(periodLabel('week', -1, SUNDAY).sub).toBe('Tuần trước')
    expect(periodLabel('week', -3, SUNDAY).sub).toBe('3 tuần trước')
  })

  it('tháng hiện tại ghi ngày hôm nay', () => {
    expect(periodLabel('month', 0, SUNDAY)).toEqual({
      label: 'Tháng 11/2026',
      sub: 'Tháng này · đến 8/11',
    })
    expect(periodLabel('month', -1, SUNDAY).sub).toBe('Tháng trước')
  })
})

describe('buildReport', () => {
  const counts = {
    '2026-10-26': 2, // tuần trước
    '2026-11-02': 3,
    '2026-11-03': 0,
    '2026-11-04': 6, // hôm nay (thứ Tư)
    '2026-11-05': 9, // tương lai, không được tính
  }

  it('kỳ đang diễn ra: tổng, chênh lệch, số ngày đã qua và trung bình', () => {
    const r = buildReport(counts, 'week', 0, WEDNESDAY)
    expect(r.total).toBe(9) // 3 + 0 + 6
    expect(r.prevTotal).toBe(2 + 0 * 6) // tuần trước chỉ có 2
    expect(r.delta).toBe(7)
    expect(r.deltaLabel).toBe('+7 so với kỳ trước')
    expect(r.active).toBe(2)
    expect(r.denom).toBe(7)
    expect(r.avg).toBe('3,0') // 9 / 3 ngày đã qua
  })

  it('bỏ qua ngày tương lai khi vẽ cột', () => {
    const r = buildReport(counts, 'week', 0, WEDNESDAY)
    // Thứ Hai 2/11 là bars[0], nên thứ Tư 4/11 là bars[2]
    expect(r.bars[2].isToday).toBe(true)
    expect(r.bars[2].label).toBe('Nay')
    expect(r.bars[3].future).toBe(true)
    expect(r.bars[3].value).toBe(0)
  })

  it('kỳ trống: tổng 0, trung bình 0, không có ngày tốt nhất', () => {
    const r = buildReport({}, 'week', -2, SUNDAY)
    expect(r.total).toBe(0)
    expect(r.avg).toBe('0,0')
    expect(r.deltaLabel).toBe('Bằng kỳ trước')
    expect(r.bestDay).toBeNull()
  })

  it('delta âm', () => {
    const r = buildReport({ '2026-10-27': 5 }, 'week', 0, WEDNESDAY)
    expect(r.delta).toBe(-5)
    expect(r.deltaLabel).toBe('-5 so với kỳ trước')
  })

  it('ngày tốt nhất là ngày có nhiều card nhất', () => {
    const r = buildReport(counts, 'week', 0, WEDNESDAY)
    expect(r.bestDay?.count).toBe(6)
    expect(toLocalISO(r.bestDay!.date)).toBe('2026-11-04')
    expect(r.bars[2].isBest).toBe(true)
  })

  it('tháng: nhãn chỉ ở 1, 5, 10, 15, 20, 25 và ngày cuối', () => {
    const r = buildReport({}, 'month', -1, SUNDAY) // tháng 10 có 31 ngày
    const labels = r.bars.filter((b) => b.label !== '').map((b) => b.label)
    expect(labels).toEqual(['1', '5', '10', '15', '20', '25', '31'])
    expect(r.denom).toBe(31)
  })
})

describe('nhận xét và tâm trạng', () => {
  it('nhận xét theo delta', () => {
    expect(reportNote(0, 0, 0)).toContain('Hoàn thành card đầu tiên')
    expect(reportNote(9, 2, 7)).toBe(
      'Bạn hoàn thành nhiều hơn 350% so với kỳ trước. Bubu tự hào lắm!',
    )
    expect(reportNote(3, 0, 3)).toBe(
      'Bạn hoàn thành nhiều hơn 3 card so với kỳ trước. Bubu tự hào lắm!',
    )
    expect(reportNote(1, 5, -4)).toContain('Chậm lại')
    expect(reportNote(5, 5, 0)).toContain('Đều đặn')
  })

  it('tâm trạng: calm khi trống, cheer khi không giảm, happy khi giảm', () => {
    expect(reportMood(0, 0)).toBe('calm')
    expect(reportMood(4, 0)).toBe('cheer')
    expect(reportMood(4, -2)).toBe('happy')
  })

  it('dòng ngày năng suất nhất', () => {
    expect(bestLine({ date: new Date(2026, 10, 7), count: 6 })).toBe(
      'Ngày năng suất nhất: Thứ Bảy 7/11 (6 card)',
    )
    expect(bestLine(null)).toBe('')
  })

  it('giới hạn lùi và tiến', () => {
    expect(canGoBack('week', -49)).toBe(true)
    expect(canGoBack('week', -50)).toBe(false)
    expect(canGoBack('month', -9)).toBe(true)
    expect(canGoBack('month', -10)).toBe(false)
    expect(canGoForward(0)).toBe(false)
    expect(canGoForward(-1)).toBe(true)
  })
})
