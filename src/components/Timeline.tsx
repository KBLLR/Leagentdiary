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
    <div className="timeline-container">
      {/* Stale indicator (when polling updates) */}
      {isStale && (
        <div className="stale-indicator">
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
      <div className="timeline-list">
        {filteredData.length === 0 ? (
          <div className="no-results">
            <p className="no-results-title">No sessions match your filters.</p>
            <p className="no-results-text">Try adjusting your search or filter criteria.</p>
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
        <div className="error-banner">
          <p className="error-banner-text">
            Failed to fetch latest updates: {error.message}
          </p>
          <button
            onClick={refresh}
            className="error-banner-button"
          >
            Retry
          </button>
        </div>
      )}
    </div>
  )
}
