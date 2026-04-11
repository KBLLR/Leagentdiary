/**
 * Header Component with Dark Mode Toggle
 */

import { useDarkMode } from '../hooks'

export function Header() {
  const { isDark, toggle } = useDarkMode()

  return (
    <header className="header">
      <div className="header-container">
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          {/* Logo and title */}
          <div style={{ width: '2rem', height: '2rem', background: 'var(--color-accent)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>L</span>
          </div>
          <div>
            <h1 className="header-title">LeAgentDiary</h1>
            <p className="header-subtitle">Process Journal for Anthology Handoffs</p>
          </div>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={toggle}
          className="dark-mode-toggle"
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? (
            // Sun icon (light mode)
            <svg
              style={{ width: '1.25rem', height: '1.25rem' }}
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
              style={{ width: '1.25rem', height: '1.25rem' }}
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
    </header>
  )
}
