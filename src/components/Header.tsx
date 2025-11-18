/**
 * Header Component with Dark Mode Toggle
 */

import { useDarkMode } from '../hooks'

export function Header() {
  const { isDark, toggle } = useDarkMode()

  return (
    <header className="border-b border-border bg-surface/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 max-w-4xl">
        <div className="flex items-center justify-between">
          {/* Logo and title */}
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">L</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-text-primary">LeAgentDiary</h1>
              <p className="text-xs text-text-secondary">Agentic Timeline Viewer</p>
            </div>
          </div>

          {/* Dark mode toggle */}
          <button
            onClick={toggle}
            className="p-2 rounded-lg bg-surface-hover hover:bg-border transition-colors"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
              // Sun icon (light mode)
              <svg
                className="w-5 h-5 text-text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z"
                />
              </svg>
            ) : (
              // Moon icon (dark mode)
              <svg
                className="w-5 h-5 text-text-primary"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z"
                />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
