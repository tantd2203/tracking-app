import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'
import { AuthProvider } from './app/AuthProvider'
import { router } from './app/router'
import { ProfileThemeSync } from './app/ProfileThemeSync'
import { CelebrateOverlay } from './components/CelebrateOverlay'
import { ToastHost } from './components/ToastHost'
import { toastError } from './api/errors'
import './styles/index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
    mutations: { onError: toastError },
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <RouterProvider router={router} />
        <ToastHost />
        <CelebrateOverlay />
        <ProfileThemeSync />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
)
