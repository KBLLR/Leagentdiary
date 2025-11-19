/**
 * Timeline Card Component
 * Displays a single HTDI session with hand-in/hand-off details
 */

import { useState } from 'react'
import type { DiarySession, AgentsResponse } from '../types'
import { findAgentByHandle, getCategoryColor, formatCategory } from '../utils/agent-utils'

interface TimelineCardProps {
  session: DiarySession
  agentsData: AgentsResponse | null
  defaultExpanded?: boolean
}

export function TimelineCard({ session, agentsData, defaultExpanded = false }: TimelineCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  // Null safety - shouldn't happen due to filtering, but TypeScript requires it
  if (!session.handIn || !session.handOff) {
    return null
  }

  // Find agent in registry
  const agentInfo = findAgentByHandle(session.handIn.agenthandle, agentsData)

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date)
  }

  const getOriginModeClass = (mode: string) => {
    switch (mode) {
      case 'self-determined':
        return 'badge-origin-self'
      case 'deployed':
        return 'badge-origin-deployed'
      default:
        return 'badge'
    }
  }

  const toggleExpanded = () => setExpanded(!expanded)

  return (
    <div className="timeline-item">
      {/* Timeline line */}
      <div className="timeline-line" />

      {/* Timeline dot */}
      <div className="timeline-dot" />

      {/* Card content */}
      <div className="timeline-content">
        {/* Timestamp */}
        <time className="timeline-timestamp">
          {formatTimestamp(session.handIn.datetimesummon)}
        </time>

        {/* Card */}
        <div className="timeline-card">
          {/* Card header (trigger) */}
          <div
            onClick={toggleExpanded}
            className="timeline-card-header"
          >
            <div className="timeline-card-main">
              {/* Badges and mode */}
              <div className="timeline-card-badges">
                <span className={`badge ${getOriginModeClass(session.handIn.originmode)}`}>
                  {session.handIn.originmode}
                </span>
                {agentInfo && (
                  <span className={`badge badge-category ${getCategoryColor(agentInfo.category)}`}>
                    {formatCategory(agentInfo.category)}
                  </span>
                )}
                <span className="agent-handle">
                  @{session.handIn.agenthandle}
                </span>
                {agentInfo?.role && (
                  <span className="agent-role">
                    • {agentInfo.role}
                  </span>
                )}
              </div>

              {/* Initial focus (main title) */}
              <p className="card-title">
                {session.handIn.initialfocus}
              </p>

              {/* Agent info */}
              <div className="agent-info">
                <div className="agent-avatar">
                  <span>
                    {session.handIn.selfchosenname[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="agent-name">
                  {session.handIn.selfchosenname}
                </span>
                {session.handIn.favoriteanimal && (
                  <span className="agent-favorite">
                    • {session.handIn.favoriteanimal}
                  </span>
                )}
              </div>
            </div>

            {/* Chevron icon */}
            <svg
              className={`chevron-icon${expanded ? ' expanded' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m19.5 8.25-7.5 7.5-7.5-7.5"
              />
            </svg>
          </div>

          {/* Collapsible content */}
          <div
            className={`timeline-card-body${expanded ? ' expanded' : ''}`}
          >
            <div className="timeline-card-content">
              {/* Agent registry info */}
              {agentInfo && (
                <div className="card-section">
                  {agentInfo.description && (
                    <div className="card-text">
                      <span className="card-text-label">Role: </span>
                      <span className="card-text-value">{agentInfo.description}</span>
                    </div>
                  )}
                  {agentInfo.promptPath && (
                    <div className="card-text">
                      <span className="card-text-label">Prompt: </span>
                      <code className="file-path" style={{ fontSize: '0.75rem' }}>{agentInfo.promptPath}</code>
                    </div>
                  )}
                </div>
              )}

              {/* Favorite song */}
              {session.handIn.favoritesong && (
                <div className="card-section">
                  <p className="card-text">
                    <span className="card-text-label">Favorite song: </span>
                    <span className="card-text-value">{session.handIn.favoritesong}</span>
                  </p>
                </div>
              )}

              {/* Contributions */}
              {session.handOff.contributions.length > 0 && (
                <div className="card-section">
                  <h4 className="card-section-title">
                    Contributions ({session.handOff.contributions.length})
                  </h4>
                  <ul className="card-list">
                    {session.handOff.contributions.map((contribution, idx) => (
                      <li key={idx} className="card-list-item">
                        <span className="list-bullet">•</span>
                        <span>{contribution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Files touched */}
              {session.handOff.filesTouched.length > 0 && (
                <div className="card-section">
                  <h4 className="card-section-title">
                    Files Touched ({session.handOff.filesTouched.length})
                  </h4>
                  <div>
                    {session.handOff.filesTouched.slice(0, 5).map((file, idx) => (
                      <div key={idx} className="file-item">
                        <code className="file-path">{file.path}</code>
                        {file.note && (
                          <p className="file-note">{file.note}</p>
                        )}
                      </div>
                    ))}
                    {session.handOff.filesTouched.length > 5 && (
                      <p className="file-note">
                        +{session.handOff.filesTouched.length - 5} more files
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actionables for next agent */}
              {session.handOff.actionablesForNextAgent.length > 0 && (
                <div className="card-section">
                  <h4 className="card-section-title">
                    Actionables for Next Agent
                  </h4>
                  <ul className="card-list">
                    {session.handOff.actionablesForNextAgent.map((actionable, idx) => (
                      <li key={idx} className="card-list-item">
                        <span className="list-bullet list-bullet-warning">→</span>
                        <span style={{ color: 'var(--color-warning)' }}>{actionable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Open questions */}
              {session.handOff.openQuestions.length > 0 && (
                <div className="card-section">
                  <h4 className="card-section-title">
                    Open Questions
                  </h4>
                  <ul className="card-list">
                    {session.handOff.openQuestions.map((question, idx) => (
                      <li key={idx} className="card-list-item">
                        <span className="list-bullet list-bullet-error">?</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Legacy signature */}
              {session.handOff.legacySignature && (
                <div className="card-section" style={{ paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--color-border)' }}>
                  <p className="signature-text">
                    "{session.handOff.legacySignature}"
                  </p>
                </div>
              )}

              {/* Session metadata */}
              <div className="metadata-section">
                <span>
                  Session: {formatTimestamp(session.handIn.datetimesummon)} → {formatTimestamp(session.handOff.datetimebacktosource)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
