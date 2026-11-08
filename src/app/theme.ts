import { useCallback, useState } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'bubu:theme'

function readTheme(): Theme {
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

export function applyTheme(theme: Theme) {
  if (theme === 'dark') document.documentElement.dataset.theme = 'dark'
  else delete document.documentElement.dataset.theme
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* trình duyệt chặn lưu trữ: chỉ áp dụng cho phiên này */
  }
}

/** Đọc/đổi chế độ sáng–tối trên máy này. Trạng thái lưu trong profiles qua useUpdateProfile. */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>(readTheme)
  const setTheme = useCallback((t: Theme) => {
    applyTheme(t)
    setThemeState(t)
  }, [])
  return { theme, setTheme }
}
