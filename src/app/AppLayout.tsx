import { Outlet } from 'react-router'
import { TabBar } from '../components/TabBar'
import { useIsDragging } from './dragState'

/** Khung cho các màn có thanh tab: Board, Thống kê, Tôi. */
export function TabLayout() {
  // Lúc kéo card, thanh dưới đổi thành thanh thả (DropDock) nên ẩn TabBar.
  const dragging = useIsDragging()
  return (
    <div className="mx-auto min-h-full max-w-md pb-32">
      <Outlet />
      {!dragging && <TabBar />}
    </div>
  )
}

/** Khung cho màn không có thanh tab: Đăng nhập, Chi tiết card, trang dev. */
export function PlainLayout() {
  return (
    <div className="mx-auto min-h-full max-w-md">
      <Outlet />
    </div>
  )
}
