import { describe, expect, it } from 'vitest'
import { buildWeeks, mondayOf } from './heat'
import { parseLocalISO, toLocalISO } from './date'

const TODAY = new Date(2026, 10, 9) // 9/11/2026

describe('buildWeeks', () => {
  const grid = buildWeeks({}, TODAY)

  it('có 52 tuần, mỗi tuần 7 ngày', () => {
    expect(grid.weeks).toHaveLength(52)
    for (const week of grid.weeks) expect(week).toHaveLength(7)
  })

  it('mỗi tuần bắt đầu từ Thứ Hai', () => {
    for (const week of grid.weeks) {
      expect(parseLocalISO(week[0].date).getDay()).toBe(1)
    }
  })

  it('tuần cuối chứa hôm nay, và đúng một ô là hôm nay', () => {
    const last = grid.weeks[51]
    expect(last.some((d) => d.isToday)).toBe(true)
    const todays = grid.weeks.flat().filter((d) => d.isToday)
    expect(todays).toHaveLength(1)
    expect(todays[0].date).toBe(toLocalISO(TODAY))
  })

  it('ngày sau hôm nay được đánh dấu là tương lai', () => {
    for (const d of grid.weeks.flat()) {
      expect(d.future).toBe(d.date > toLocalISO(TODAY))
    }
  })

  it('ô đầu tiên là Thứ Hai cách hôm nay 51 tuần', () => {
    const expected = toLocalISO(mondayOf(TODAY))
    const first = parseLocalISO(grid.weeks[0][0].date)
    const shifted = new Date(first.getFullYear(), first.getMonth(), first.getDate() + 51 * 7)
    expect(toLocalISO(shifted)).toBe(expected)
  })

  it('điền số card và mức màu theo ngày', () => {
    const g = buildWeeks({ [toLocalISO(TODAY)]: 4 }, TODAY)
    const today = g.weeks.flat().find((d) => d.isToday)
    expect(today?.count).toBe(4)
    expect(today?.level).toBe(3)
  })

  it('nhãn tháng nằm trên cột chứa ngày 1', () => {
    const g = buildWeeks({}, TODAY)
    const labels = g.months.map((m) => m.label)
    expect(labels).toContain('Th11')
    const nov = g.months.find((m) => m.label === 'Th11')
    expect(nov && g.weeks[nov.week].some((d) => d.dayOfMonth === 1)).toBe(true)
  })
})
