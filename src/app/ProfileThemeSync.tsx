import { useEffect } from 'react'
import { useProfile } from '../api/profile'
import { applyTheme } from './theme'

/** Khi hồ sơ tải xong, áp dụng chế độ tối đã lưu trong tài khoản lên máy này. Đặt một lần trong main.tsx. */
export function ProfileThemeSync() {
  const profile = useProfile()
  const darkMode = profile.data?.dark_mode

  useEffect(() => {
    if (darkMode === undefined) return
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
    const wanted = darkMode ? 'dark' : 'light'
    if (current !== wanted) applyTheme(wanted)
  }, [darkMode])

  return null
}
