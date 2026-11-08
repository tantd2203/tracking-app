import type { ListKey } from '../../api/types'
import { PRIORITY } from '../../lib/palette'

/** Tên và màu chấm của từng cột. Thứ tự là thứ tự hiển thị. */
export const COLUMNS: { key: ListKey; label: string; dot: string }[] = [
  { key: 'todo', label: 'To Do', dot: 'var(--color-heat-2)' },
  { key: 'doing', label: 'Doing', dot: PRIORITY.high.c },
  { key: 'done', label: 'Done', dot: 'var(--color-brand)' },
]
