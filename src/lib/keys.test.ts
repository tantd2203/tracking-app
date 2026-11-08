import { describe, expect, it } from 'vitest'
import type { KeyboardEvent } from 'react'
import { isEnterKey } from './keys'

function ev(key: string, extra: { isComposing?: boolean; keyCode?: number } = {}) {
  return {
    key,
    keyCode: extra.keyCode ?? 13,
    nativeEvent: { isComposing: extra.isComposing ?? false },
  } as unknown as KeyboardEvent
}

describe('isEnterKey', () => {
  it('Enter thường là true', () => {
    expect(isEnterKey(ev('Enter'))).toBe(true)
  })

  it('Enter lúc đang ghép ký tự (IME) là false', () => {
    expect(isEnterKey(ev('Enter', { isComposing: true }))).toBe(false)
    expect(isEnterKey(ev('Enter', { keyCode: 229 }))).toBe(false)
  })

  it('phím khác là false', () => {
    expect(isEnterKey(ev('a'))).toBe(false)
  })
})
