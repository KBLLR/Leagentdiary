/**
 * React hook for managing dark mode with localStorage persistence
 */

import { useState, useEffect } from 'react'

const STORAGE_KEY = 'leagentdiary-theme'
const DARK_CLASS = 'dark'

export function useDarkMode() {
  const [isDark, setIsDark] = useState(() => {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      return stored === 'dark'
    }
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    const root = document.documentElement

    if (isDark) {
      root.classList.add(DARK_CLASS)
      localStorage.setItem(STORAGE_KEY, 'dark')
    } else {
      root.classList.remove(DARK_CLASS)
      localStorage.setItem(STORAGE_KEY, 'light')
    }
  }, [isDark])

  const toggle = () => setIsDark(!isDark)
  const setDark = () => setIsDark(true)
  const setLight = () => setIsDark(false)

  return {
    isDark,
    toggle,
    setDark,
    setLight,
  }
}
