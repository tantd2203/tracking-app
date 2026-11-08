import { describe, expect, it } from 'vitest'
import { resolveDrop, type Lists } from './dropTarget'

const lists: Lists = {
  todo: [{ id: 'a' }, { id: 'b' }, { id: 'c' }],
  doing: [{ id: 'd' }],
  done: [{ id: 'e' }],
}

describe('resolveDrop', () => {
  it('không có đích thì không làm gì', () => {
    expect(resolveDrop('a', lists, null)).toBeNull()
  })

  it('thả lên chính nó hoặc đúng chỗ cũ thì không làm gì', () => {
    expect(resolveDrop('a', lists, 'a')).toBeNull()
    expect(resolveDrop('a', lists, 'tab:todo')).toBeNull()
  })

  it('cùng cột, kéo xuống: chèn sau thẻ đích', () => {
    // [a,b,c] kéo a lên c -> [b,c,a]
    expect(resolveDrop('a', lists, 'c')).toEqual({ toList: 'todo', toIndex: 2 })
  })

  it('cùng cột, kéo lên: chèn trước thẻ đích', () => {
    // [a,b,c] kéo c lên a -> [c,a,b]
    expect(resolveDrop('c', lists, 'a')).toEqual({ toList: 'todo', toIndex: 0 })
  })

  it('sang cột khác: chèn trước thẻ đích', () => {
    expect(resolveDrop('a', lists, 'd')).toEqual({ toList: 'doing', toIndex: 0 })
  })

  it('thả vào tab hoặc thanh dưới: thêm vào đầu cột', () => {
    expect(resolveDrop('a', lists, 'tab:done')).toEqual({ toList: 'done', toIndex: 0 })
    expect(resolveDrop('a', lists, 'dock:doing')).toEqual({ toList: 'doing', toIndex: 0 })
  })

  it('thả vào vùng trống của cột: thêm vào cuối cột', () => {
    expect(resolveDrop('a', lists, 'col:doing')).toEqual({ toList: 'doing', toIndex: 1 })
    expect(resolveDrop('d', lists, 'col:doing')).toBeNull()
  })

  it('id đích không thuộc cột nào thì không làm gì', () => {
    expect(resolveDrop('a', lists, 'không-tồn-tại')).toBeNull()
  })
})
