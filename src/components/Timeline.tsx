import { useEffect, useState } from 'react'
import { TimelineCard } from './TimelineCard'
import { TimelineFilters } from './TimelineFilters'
import { LoadingSpinner } from './LoadingSpinner'
import { ErrorMessage } from './ErrorMessage'
import { EmptyState } from './EmptyState'
import type { AgentsResponse, DiarySession, TaskRecord } from '../types'

interface TimelineProps {
  sessions: DiarySession[]
  tasks: TaskRecord[]
  agentsData: AgentsResponse | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
  isStale: boolean
}

export function Timeline({ sessions, tasks, agentsData, loading, error, refresh, isStale }: TimelineProps) {
  const [filteredData, setFilteredData] = useState<DiarySession[]>(sessions)

  useEffect(() => {
    setFilteredData(sessions)
  }, [sessions])

  if (loading && sessions.length === 0) {
    return <LoadingSpinner />
  }

  if (error && sessions.length === 0) {
    return <ErrorMessage error={error} onRetry={refresh} />
  }

  if (sessions.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="timeline-container">
      {isStale && (
        <div className="stale-indicator">
          Updating...
        </div>
      )}

      <TimelineFilters
        sessions={sessions}
        agentsData={agentsData}
        onFilterChange={setFilteredData}
      />

      <div className="lane-summary-strip">
        <span>{filteredData.length} visible sessions</span>
        <span>{tasks.length} tracked tasks</span>
        <span>{filteredData.filter((session) => session.handoffs.length > 0).length} sessions with handoffs</span>
      </div>

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

      {error && sessions.length > 0 && (
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
