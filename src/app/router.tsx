import { createBrowserRouter, Navigate } from 'react-router'
import StatsPage from '../features/activity/StatsPage'
import LoginPage from '../features/auth/LoginPage'
import RegisterPage from '../features/auth/RegisterPage'
import BoardPage from '../features/boards/BoardPage'
import BoardsPage from '../features/boards/BoardsPage'
import CardPage from '../features/cards/CardPage'
import MePage from '../features/me/MePage'
import { PlainLayout, TabLayout } from './AppLayout'
import { GuestOnly, RequireAuth } from './RequireAuth'

/**
 * Bản đồ màn hình theo flow thiết kế Bubu.
 * Route trong RequireAuth cần đăng nhập; route trong GuestOnly chỉ dành cho người chưa đăng nhập.
 */
export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/boards" replace /> },
  {
    element: <RequireAuth />,
    children: [
      {
        element: <TabLayout />,
        children: [
          { path: '/boards', element: <BoardsPage /> },
          { path: '/boards/:boardId', element: <BoardPage /> },
          { path: '/stats', element: <StatsPage /> },
          { path: '/me', element: <MePage /> },
        ],
      },
      {
        element: <PlainLayout />,
        children: [{ path: '/cards/:cardId', element: <CardPage /> }],
      },
    ],
  },
  {
    element: <GuestOnly />,
    children: [
      {
        element: <PlainLayout />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/boards" replace /> },
])
