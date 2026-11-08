import type { ListKey } from '../../api/types'
import { PRIORITY } from '../../lib/palette'

/** Tên và màu chấm của từng cột. Thứ tự là thứ tự hiển thị. */
export type ColumnMeta = { key: ListKey; label: string; dot: string }

export const COLUMNS: ColumnMeta[] = [
  { key: 'todo', label: 'To Do', dot: 'var(--color-heat-2)' },
  { key: 'doing', label: 'Doing', dot: PRIORITY.high.c },
  { key: 'done', label: 'Done', dot: 'var(--color-brand)' },
]
