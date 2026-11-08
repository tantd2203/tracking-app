import { describe, expect, it, vi } from 'vitest'

vi.mock('../components/toast', () => ({ toast: vi.fn() }))

import { unwrap } from './errors'

describe('unwrap', () => {
  it('trả về data khi không có lỗi', () => {
    expect(unwrap({ data: [{ id: 'b1' }], error: null })).toEqual([{ id: 'b1' }])
  })

  it('ném lỗi tiếng Việt khi có error, giữ lỗi gốc trong cause', () => {
    const error = { message: 'permission denied' }
    let thrown: unknown
    try {
      unwrap({ data: null, error })
    } catch (e) {
      thrown = e
    }
    expect(thrown).toBeInstanceOf(Error)
    expect((thrown as Error).message).toBe('Có lỗi, thử lại giúp Bubu nhé')
    expect((thrown as Error).cause).toEqual(error)
  })

  it('ném lỗi khi không có error nhưng data là null', () => {
    expect(() => unwrap({ data: null, error: null })).toThrow('Có lỗi, thử lại giúp Bubu nhé')
  })
})
