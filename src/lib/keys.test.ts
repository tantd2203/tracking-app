import { afterEach, describe, expect, it, vi } from 'vitest'
import type { KeyboardEvent } from 'react'
import { isEnterKey } from './keys'

function ev(key: string, extra: { isComposing?: boolean; keyCode?: number } = {}) {
  return {
    key,
    keyCode: extra.keyCode ?? 13,
    nativeEvent: { isComposing: extra.isComposing ?? false },
  } as unknown as KeyboardEvent
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('isEnterKey', () => {
  it('Enter thường là true', () => {
    expect(isEnterKey(ev('Enter'))).toBe(true)
  })

  it('Enter lúc đang ghép ký tự (isComposing) là false', () => {
    expect(isEnterKey(ev('Enter', { isComposing: true }))).toBe(false)
  })

  it('Enter keyCode 229 không vừa ghép xong (iOS/Android bàn phím ảo) vẫn là true', () => {
    vi.spyOn(performance, 'now').mockReturnValue(10_000)
    expect(isEnterKey(ev('Enter', { keyCode: 229 }))).toBe(true)
  })

  it('Enter chốt chữ ngay sau compositionend (Safari, keyCode 229) là false', () => {
    const now = vi.spyOn(performance, 'now')
    now.mockReturnValue(1_000)
    document.dispatchEvent(new Event('compositionend'))
    now.mockReturnValue(1_020)
    expect(isEnterKey(ev('Enter', { keyCode: 229 }))).toBe(false)
    // Enter kế tiếp, sau khi đã qua khoảng chốt, phải thêm được.
    now.mockReturnValue(1_500)
    expect(isEnterKey(ev('Enter'))).toBe(true)
  })

  it('phím khác là false', () => {
    expect(isEnterKey(ev('a'))).toBe(false)
  })
})
