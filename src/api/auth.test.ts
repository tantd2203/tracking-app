import { describe, expect, it } from 'vitest'
import { mapAuthError } from './auth'

describe('mapAuthError', () => {
  it('sai mật khẩu', () => {
    const e = mapAuthError({ message: 'Invalid login credentials' })
    expect(e.message).toBe('Email hoặc mật khẩu chưa đúng.')
  })

  it('email đã tồn tại', () => {
    const e = mapAuthError({ message: 'User already registered' })
    expect(e.message).toBe('Email này đã có tài khoản, đăng nhập nhé.')
  })

  it('mất mạng', () => {
    const e = mapAuthError({ message: 'Failed to fetch', name: 'AuthRetryableFetchError' })
    expect(e.message).toBe('Mất kết nối, thử lại giúp Bubu nhé.')
  })

  it('lỗi khác dùng câu chung, giữ lỗi gốc trong cause', () => {
    const original = { message: 'something else' }
    const e = mapAuthError(original)
    expect(e.message).toBe('Có lỗi, thử lại giúp Bubu nhé')
    expect(e.cause).toEqual(original)
  })
})
