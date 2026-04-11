/**
 * Empty State Component
 */

export function EmptyState() {
  const apiBase = import.meta.env.VITE_HTDI_API_URL || 'http://localhost:3000/api'

  return (
    <div className="empty-state">
      {/* Empty icon */}
      <svg
        style={{ width: '4rem', height: '4rem', margin: '0 auto var(--spacing-lg)', color: 'rgba(161, 161, 161, 0.5)' }}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9z"
        />
      </svg>

      <h3 className="empty-state-title">
        No session chronology yet
      </h3>
      <p className="empty-state-text" style={{ marginBottom: 'var(--spacing-lg)' }}>
        Diary sessions will appear here once HTDI starts writing handoffs for this house.
      </p>

      <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
        <p style={{ marginBottom: 'var(--spacing-xs)' }}>Required endpoint:</p>
        <code style={{
          display: 'block',
          background: 'var(--color-surface-hover)',
          padding: 'var(--spacing-sm) var(--spacing-md)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--color-accent)',
          fontFamily: 'var(--font-mono)'
        }}>
          {`${apiBase}/diary`}
        </code>
      </div>
    </div>
  )
}
