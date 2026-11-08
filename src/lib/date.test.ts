import { describe, expect, it } from 'vitest'
import { formatMonthYear } from './date'

describe('formatMonthYear', () => {
  it('định dạng MM/YYYY', () => {
    expect(formatMonthYear(new Date(2025, 10, 3))).toBe('11/2025')
    expect(formatMonthYear(new Date(2026, 0, 1))).toBe('01/2026')
  })
})
