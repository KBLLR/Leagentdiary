/**
 * Error Message Component
 */

interface ErrorMessageProps {
  error: Error
  onRetry?: () => void
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <div className="error-message">
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-md)' }}>
        {/* Error icon */}
        <svg
          style={{ width: '1.5rem', height: '1.5rem', flexShrink: 0, marginTop: '0.125rem' }}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
          />
        </svg>

        <div style={{ flex: 1 }}>
          <h3 className="error-title">
            Failed to load session chronology
          </h3>
          <p className="error-text">
            {error.message || 'An unexpected error occurred'}
          </p>

          {onRetry && (
            <button
              onClick={onRetry}
              className="retry-button"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
