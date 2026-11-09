import { describe, expect, it } from 'vitest'
import { FOLD_MIN_DONE, foldChecklist } from './checklistFold'

function items(doneFlags: boolean[]) {
  return doneFlags.map((done, i) => ({ id: `i${i}`, done }))
}
const none = new Set<string>()

describe('foldChecklist', () => {
  it('ngưỡng là 5 việc đã xong', () => {
    expect(FOLD_MIN_DONE).toBe(5)
  })

  it('dưới ngưỡng thì hiện hết', () => {
    const list = items([true, true, true, true, false])
    const r = foldChecklist(list, { expanded: false, keep: none })
    expect(r.visible).toHaveLength(5)
    expect(r.hiddenCount).toBe(0)
  })

  it('đủ ngưỡng và đang gọn thì ẩn việc đã xong, giữ việc chưa xong', () => {
    const list = items([true, true, true, true, true, false, true])
    const r = foldChecklist(list, { expanded: false, keep: none })
    expect(r.visible.map((i) => i.id)).toEqual(['i5'])
    expect(r.hiddenCount).toBe(6)
  })

  it('đang mở rộng thì hiện hết', () => {
    const list = items([true, true, true, true, true, false])
    const r = foldChecklist(list, { expanded: true, keep: none })
    expect(r.visible).toHaveLength(6)
    expect(r.hiddenCount).toBe(0)
  })

  it('việc vừa tick trong phiên (keep) vẫn hiện khi đang gọn', () => {
    const list = items([true, true, true, true, true, false])
    const r = foldChecklist(list, { expanded: false, keep: new Set(['i0']) })
    expect(r.visible.map((i) => i.id)).toEqual(['i0', 'i5'])
    expect(r.hiddenCount).toBe(4)
  })

  it('danh sách rỗng không lỗi', () => {
    const r = foldChecklist([], { expanded: false, keep: none })
    expect(r).toEqual({ visible: [], hiddenCount: 0 })
  })
})
