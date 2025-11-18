/**
 * Timeline Container Component
 * Renders the list of diary entries with loading, error, and empty states
 */

import { useDiary } from '../hooks'
import { TimelineCard } from './TimelineCard'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'
import { EmptyState } from './EmptyState'

interface TimelineProps {
  pollInterval?: number
}

export function Timeline({ pollInterval }: TimelineProps = {}) {
  const { data, loading, error, refresh, isStale } = useDiary({ pollInterval })

  // Show loading spinner only on initial load
  if (loading && data.length === 0) {
    return <LoadingSpinner />
  }

  // Show error message
  if (error && data.length === 0) {
    return <ErrorMessage error={error} onRetry={refresh} />
  }

  // Show empty state
  if (data.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="relative">
      {/* Stale indicator (when polling updates) */}
      {isStale && (
        <div className="fixed top-4 right-4 z-50 bg-warning/20 border border-warning text-warning px-3 py-2 rounded-lg text-sm font-medium animate-pulse">
          Updating...
        </div>
      )}

      {/* Timeline entries */}
      <div className="space-y-0">
        {data.map((entry) => (
          <TimelineCard key={entry.id} entry={entry} />
        ))}
      </div>

      {/* Error banner (if error occurs after initial load) */}
      {error && data.length > 0 && (
        <div className="mt-4 bg-error/10 border border-error/30 rounded-lg p-4">
          <p className="text-sm text-error">
            Failed to fetch latest updates: {error.message}
          </p>
          <button
            onClick={refresh}
            className="mt-2 text-sm text-accent hover:underline"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
