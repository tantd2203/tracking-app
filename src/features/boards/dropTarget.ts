import type { ListKey } from '../../api/types'

/** Tiền tố id của vùng thả, tách khỏi id card (uuid). */
export const TAB_PREFIX = 'tab:'
export const DOCK_PREFIX = 'dock:'
export const COLUMN_PREFIX = 'col:'

export type CardRef = { id: string }
export type Lists = Record<ListKey, CardRef[]>
export type Drop = { toList: ListKey; toIndex: number }

const LIST_KEYS: ListKey[] = ['todo', 'doing', 'done']

/**
 * Chuyển `overId` của dnd-kit thành đích thả `{ toList, toIndex }`.
 * `toIndex` tính trên list đích khi đã bỏ chính card đang kéo.
 * Trả về `null` nếu thả đúng chỗ cũ hoặc không có đích.
 */
export function resolveDrop(cardId: string, lists: Lists, overId: string | null): Drop | null {
  if (!overId) return null
  const from = LIST_KEYS.find((k) => lists[k].some((c) => c.id === cardId))
  if (!from) return null
  const fromIndex = lists[from].findIndex((c) => c.id === cardId)
  const others = (key: ListKey) => lists[key].filter((c) => c.id !== cardId)

  let drop: Drop
  if (overId.startsWith(TAB_PREFIX) || overId.startsWith(DOCK_PREFIX)) {
    const prefix = overId.startsWith(TAB_PREFIX) ? TAB_PREFIX : DOCK_PREFIX
    drop = { toList: overId.slice(prefix.length) as ListKey, toIndex: 0 }
  } else if (overId.startsWith(COLUMN_PREFIX)) {
    const toList = overId.slice(COLUMN_PREFIX.length) as ListKey
    drop = { toList, toIndex: others(toList).length }
  } else {
    if (overId === cardId) return null
    const overList = LIST_KEYS.find((k) => lists[k].some((c) => c.id === overId))
    if (!overList) return null
    const overOriginal = lists[overList].findIndex((c) => c.id === overId)
    const idx = others(overList).findIndex((c) => c.id === overId)
    // Kéo xuống trong cùng cột thì chèn sau thẻ đích, còn lại thì chèn trước.
    const after = overList === from && fromIndex < overOriginal
    drop = { toList: overList, toIndex: after ? idx + 1 : idx }
  }

  if (drop.toList === from && drop.toIndex === fromIndex) return null
  return drop
}
