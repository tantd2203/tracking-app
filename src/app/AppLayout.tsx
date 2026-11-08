import { Outlet } from 'react-router'
import { TabBar } from '../components/TabBar'

/** Khung cho các màn có thanh tab: Board, Thống kê, Tôi. */
export function TabLayout() {
  return (
    <div className="mx-auto min-h-full max-w-md pb-32">
      <Outlet />
      <TabBar />
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
