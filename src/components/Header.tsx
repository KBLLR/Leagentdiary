import { useDarkMode } from '../hooks'

interface HeaderProps {
  activeView: 'timeline' | 'profiles' | 'review'
  onViewChange: (view: 'timeline' | 'profiles' | 'review') => void
  summary: {
    sessions: number
    profiles: number
    ritualReadyProfiles: number
    tasks: number
    anthologyCandidates: number
    publicCandidates: number
    notionReadyProfiles: number
  }
}

const VIEWS: Array<{ key: HeaderProps['activeView']; label: string }> = [
  { key: 'timeline', label: 'Timeline' },
  { key: 'profiles', label: 'Profiles' },
  { key: 'review', label: 'Review & Export' },
]

export function Header({ activeView, onViewChange, summary }: HeaderProps) {
  const { isDark, toggle } = useDarkMode()

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-brand">
          <div style={{ width: '2rem', height: '2rem', background: 'var(--color-accent)', borderRadius: 'var(--radius-lg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 'bold', fontSize: '1.125rem' }}>L</span>
          </div>
          <div>
            <h1 className="header-title">LeAgentDiary</h1>
            <p className="header-subtitle">Profile intake, session chronology, and curated reflection review</p>
          </div>
        </div>

        <div className="header-actions">
          <div className="header-status-strip">
            <span>{summary.profiles} profiles</span>
            <span>{summary.ritualReadyProfiles} ritual-ready</span>
            <span>{summary.sessions} sessions</span>
            <span>{summary.tasks} tasks</span>
            <span>{summary.publicCandidates} Belle-ready</span>
          </div>

          <div className="header-tabs">
            {VIEWS.map((view) => (
              <button
                key={view.key}
                className={`header-tab${activeView === view.key ? ' active' : ''}`}
                onClick={() => onViewChange(view.key)}
              >
                {view.label}
              </button>
            ))}
          </div>

          <button
            onClick={toggle}
            className="dark-mode-toggle"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? (
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
      </div>
    </header>
  )
}
