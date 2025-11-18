/**
 * Error Message Component
 */

interface ErrorMessageProps {
  error: Error
  onRetry?: () => void
}

export function ErrorMessage({ error, onRetry }: ErrorMessageProps) {
  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="bg-error/10 border border-error/30 rounded-lg p-6">
        <div className="flex items-start space-x-3">
          {/* Error icon */}
          <svg
            className="w-6 h-6 text-error flex-shrink-0 mt-0.5"
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

          <div className="flex-1">
            <h3 className="text-lg font-semibold text-error mb-1">
              Failed to load diary entries
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              {error.message || 'An unexpected error occurred'}
            </p>

            {onRetry && (
              <button
                onClick={onRetry}
                className="px-4 py-2 bg-error text-white rounded-md hover:opacity-90 transition-opacity text-sm font-medium"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
