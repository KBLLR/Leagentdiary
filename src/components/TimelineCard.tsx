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

  if (!session.handIn || !session.handOff) {
    return null
  }

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

  const contributionsCount = session.handOff.contributions.length
  const filesCount = session.handOff.filesTouched.length
  const actionablesCount = session.handOff.actionablesForNextAgent.length
  const questionsCount = session.handOff.openQuestions.length

  return (
    <div className="timeline-item">
      <div className="timeline-line" />
      <div className="timeline-dot" />

      <div className="timeline-content">
        <time className="timeline-timestamp">
          {formatTimestamp(session.handIn.datetimesummon)}
        </time>

        <div className="timeline-card">
          <div
            onClick={toggleExpanded}
            className="timeline-card-header"
          >
            <div className="timeline-card-main">
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

              <p className="card-title">
                {session.handIn.initialfocus}
              </p>

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

          <div
            className={`timeline-card-body${expanded ? ' expanded' : ''}`}
          >
            <div className="timeline-card-content">
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

              <div className="card-section">
                <p className="card-text">
                  <span className="card-text-label">Export signals: </span>
                  <span className="card-text-value">
                    {contributionsCount} contributions • {filesCount} files • {actionablesCount} actionables • {questionsCount} open questions
                  </span>
                </p>
              </div>

              {session.handIn.favoritesong && (
                <div className="card-section">
                  <p className="card-text">
                    <span className="card-text-label">Favorite song: </span>
                    <span className="card-text-value">{session.handIn.favoritesong}</span>
                  </p>
                </div>
              )}

              {contributionsCount > 0 && (
                <div className="card-section">
                  <h4 className="card-section-title">
                    Contributions ({contributionsCount})
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

              {filesCount > 0 && (
                <div className="card-section">
                  <h4 className="card-section-title">
                    Files Touched ({filesCount})
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
                    {filesCount > 5 && (
                      <p className="file-note">
                        +{filesCount - 5} more files
                      </p>
                    )}
                  </div>
                </div>
              )}

              {actionablesCount > 0 && (
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

              {questionsCount > 0 && (
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

              {session.handOff.legacySignature && (
                <div className="card-section" style={{ paddingTop: 'var(--spacing-sm)', borderTop: '1px solid var(--color-border)' }}>
                  <p className="signature-text">
                    "{session.handOff.legacySignature}"
                  </p>
                </div>
              )}

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
