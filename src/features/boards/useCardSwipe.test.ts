import { act, renderHook } from '@testing-library/react'
import type { PointerEvent } from 'react'
import { describe, expect, it, vi } from 'vitest'
import { SWIPE_THRESHOLD, useCardSwipe } from './useCardSwipe'
import { wasJustDragged } from './dragGuard'

function pe(x: number, y: number, pointerType = 'touch') {
  return { clientX: x, clientY: y, pointerType } as unknown as PointerEvent
}

function swipe(
  h: ReturnType<typeof useCardSwipe>['handlers'],
  from: [number, number],
  to: [number, number],
  pointerType = 'touch',
) {
  act(() => {
    h.onPointerDown(pe(from[0], from[1], pointerType))
    h.onPointerMove(pe(to[0], to[1], pointerType))
    h.onPointerUp(pe(to[0], to[1], pointerType))
  })
}

describe('useCardSwipe', () => {
  it('vuốt sang phải đủ xa thì gọi onSwipe(1)', () => {
    const onSwipe = vi.fn()
    const { result } = renderHook(() => useCardSwipe(onSwipe, true))
    swipe(result.current.handlers, [100, 300], [100 + SWIPE_THRESHOLD + 10, 302])
    expect(onSwipe).toHaveBeenCalledWith(1)
  })

  it('vuốt sang trái đủ xa thì gọi onSwipe(-1)', () => {
    const onSwipe = vi.fn()
    const { result } = renderHook(() => useCardSwipe(onSwipe, true))
    swipe(result.current.handlers, [300, 300], [300 - SWIPE_THRESHOLD - 10, 300])
    expect(onSwipe).toHaveBeenCalledWith(-1)
  })

  it('vuốt chưa đủ ngưỡng thì không chuyển', () => {
    const onSwipe = vi.fn()
    const { result } = renderHook(() => useCardSwipe(onSwipe, true))
    swipe(result.current.handlers, [100, 300], [100 + SWIPE_THRESHOLD - 10, 300])
    expect(onSwipe).not.toHaveBeenCalled()
  })

  it('vuốt chủ yếu dọc thì không chuyển (để trình duyệt xử lý)', () => {
    const onSwipe = vi.fn()
    const { result } = renderHook(() => useCardSwipe(onSwipe, true))
    swipe(result.current.handlers, [100, 100], [120, 300])
    expect(onSwipe).not.toHaveBeenCalled()
  })

  it('chuột không kích hoạt vuốt (để kéo thả chuột hoạt động)', () => {
    const onSwipe = vi.fn()
    const { result } = renderHook(() => useCardSwipe(onSwipe, true))
    swipe(result.current.handlers, [100, 300], [300, 300], 'mouse')
    expect(onSwipe).not.toHaveBeenCalled()
  })

  it('khi enabled = false (đang kéo thả) thì không vuốt', () => {
    const onSwipe = vi.fn()
    const { result } = renderHook(() => useCardSwipe(onSwipe, false))
    swipe(result.current.handlers, [100, 300], [300, 300])
    expect(onSwipe).not.toHaveBeenCalled()
  })

  it('thẻ dịch theo tay và bị kẹp trong ±120 px', () => {
    const { result } = renderHook(() => useCardSwipe(vi.fn(), true))
    act(() => result.current.handlers.onPointerDown(pe(100, 300)))
    act(() => result.current.handlers.onPointerMove(pe(160, 300)))
    expect(result.current.offset).toBe(60)
    act(() => result.current.handlers.onPointerMove(pe(400, 300)))
    expect(result.current.offset).toBe(120)
    act(() => result.current.handlers.onPointerUp(pe(400, 300)))
    expect(result.current.offset).toBe(0)
  })

  it('sau khi vuốt xong, click kế tiếp bị bỏ qua (không mở chi tiết)', () => {
    const { result } = renderHook(() => useCardSwipe(vi.fn(), true))
    swipe(result.current.handlers, [100, 300], [100 + SWIPE_THRESHOLD + 10, 300])
    expect(wasJustDragged()).toBe(true)
  })
})
