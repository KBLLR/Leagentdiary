/**
 * Timeline Container Component
 * Renders the list of diary entries with loading, error, and empty states
 */

import { useState, useEffect } from 'react'
import { useDiary, useAgents } from '../hooks'
import { TimelineCard } from './TimelineCard'
import { TimelineFilters } from './TimelineFilters'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'
import { EmptyState } from './EmptyState'
import type { DiarySession } from '../types'

interface TimelineProps {
  pollInterval?: number
}

export function Timeline({ pollInterval }: TimelineProps = {}) {
  const { data, loading, error, refresh, isStale } = useDiary({ pollInterval })
  const { data: agentsData } = useAgents()
  const [filteredData, setFilteredData] = useState<DiarySession[]>(data)

  // Update filtered data when source data changes
  useEffect(() => {
    setFilteredData(data)
  }, [data])

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

      {/* Filters */}
      <TimelineFilters
        sessions={data}
        agentsData={agentsData}
        onFilterChange={setFilteredData}
      />

      {/* Timeline entries */}
      <div className="space-y-0">
        {filteredData.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary">No sessions match your filters.</p>
            <p className="text-text-secondary text-sm mt-2">Try adjusting your search or filter criteria.</p>
          </div>
        ) : filteredData.map((session, idx) => (
          <TimelineCard
            key={session.sessionId || idx}
            session={session}
            agentsData={agentsData}
          />
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
