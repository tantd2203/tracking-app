import { describe, expect, it } from 'vitest'
import { initials } from './text'

describe('initials', () => {
  it('lấy chữ đầu của 2 từ cuối (tên tiếng Việt)', () => {
    expect(initials('Nguyễn Minh Anh')).toBe('MA')
  })

  it('một từ thì lấy một chữ', () => {
    expect(initials('bubu')).toBe('B')
  })

  it('bỏ khoảng trắng thừa', () => {
    expect(initials('  Lê   Lợi ')).toBe('LL')
  })

  it('tên trống thì trả về ?', () => {
    expect(initials('   ')).toBe('?')
  })

  it('chữ có dấu đầu từ vẫn đúng', () => {
    expect(initials('Ánh Đào')).toBe('ÁĐ')
  })
})
