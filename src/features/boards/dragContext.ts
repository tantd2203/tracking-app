import { createContext, useContext } from 'react'
import type { Drop } from './dropTarget'

export type DragInfo = {
  /** Id card đang kéo, `null` khi không kéo. */
  activeId: string | null
  /** Vị trí sẽ chèn nếu thả ngay bây giờ, `null` nếu không có chỗ hợp lệ. */
  indicator: Drop | null
}

export const DragInfoContext = createContext<DragInfo>({ activeId: null, indicator: null })

export function useDragInfo(): DragInfo {
  return useContext(DragInfoContext)
}
