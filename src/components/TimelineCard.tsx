/**
 * Timeline Card Component
 * Displays a single HTDI session with hand-in/hand-off details
 */

import { useState } from 'react'
import type { DiarySession } from '../types'

interface TimelineCardProps {
  session: DiarySession
  defaultExpanded?: boolean
}

export function TimelineCard({ session, defaultExpanded = false }: TimelineCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

  // Null safety - shouldn't happen due to filtering, but TypeScript requires it
  if (!session.handIn || !session.handOff) {
    return null
  }

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

  const getOriginModeColor = (mode: string) => {
    switch (mode) {
      case 'self-determined':
        return 'bg-accent/20 text-accent'
      case 'deployed':
        return 'bg-success/20 text-success'
      default:
        return 'bg-text-secondary/20 text-text-secondary'
    }
  }

  const toggleExpanded = () => setExpanded(!expanded)

  return (
    <div className="timeline-item relative pb-10 last:pb-0">
      {/* Timeline line */}
      <div className="timeline-line absolute left-5 top-6 bottom-0 w-0.5 bg-border/30" />

      {/* Timeline dot */}
      <div className="absolute left-4 top-3.5 w-3 h-3 bg-accent rounded-full ring-4 ring-background" />

      {/* Card content */}
      <div className="ml-10">
        {/* Timestamp */}
        <time className="text-xs text-text-secondary">
          {formatTimestamp(session.handIn.datetimesummon)}
        </time>

        {/* Card */}
        <div className="mt-2 bg-surface border border-border rounded-xl shadow-sm hover:shadow-md hover:border-accent/50 transition-all duration-200">
          {/* Card header (trigger) */}
          <div
            onClick={toggleExpanded}
            className="p-4 flex justify-between items-center cursor-pointer select-none"
          >
            <div className="flex-1 min-w-0">
              {/* Badges and mode */}
              <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${getOriginModeColor(session.handIn.originmode)}`}>
                  {session.handIn.originmode}
                </span>
                <span className="text-xs font-medium text-text-secondary">
                  @{session.handIn.agenthandle}
                </span>
              </div>

              {/* Initial focus (main title) */}
              <p className="text-base font-semibold text-text-primary truncate">
                {session.handIn.initialfocus}
              </p>

              {/* Agent info */}
              <div className="flex items-center space-x-2 mt-2">
                <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center">
                  <span className="text-xs text-accent font-bold">
                    {session.handIn.selfchosenname[0]?.toUpperCase()}
                  </span>
                </div>
                <span className="text-sm text-text-secondary">
                  {session.handIn.selfchosenname}
                </span>
                {session.handIn.favoriteanimal && (
                  <span className="text-xs text-text-secondary/70">
                    • {session.handIn.favoriteanimal}
                  </span>
                )}
              </div>
            </div>

            {/* Chevron icon */}
            <svg
              className={`w-4 h-4 text-text-secondary transition-transform duration-300 flex-shrink-0 ml-4 ${
                expanded ? 'rotate-180' : ''
              }`}
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
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              expanded ? 'max-h-[3000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4 border-t border-border space-y-4">
              {/* Favorite song */}
              {session.handIn.favoritesong && (
                <div className="text-sm">
                  <span className="text-text-secondary">Favorite song: </span>
                  <span className="text-text-primary italic">{session.handIn.favoritesong}</span>
                </div>
              )}

              {/* Contributions */}
              {session.handOff.contributions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-text-primary">
                    Contributions ({session.handOff.contributions.length})
                  </h4>
                  <ul className="space-y-1 text-sm text-text-secondary">
                    {session.handOff.contributions.map((contribution, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-accent mr-2">•</span>
                        <span>{contribution}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Files touched */}
              {session.handOff.filesTouched.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-text-primary">
                    Files Touched ({session.handOff.filesTouched.length})
                  </h4>
                  <div className="space-y-2">
                    {session.handOff.filesTouched.slice(0, 5).map((file, idx) => (
                      <div key={idx} className="text-xs bg-surface-hover rounded p-2">
                        <code className="text-accent">{file.path}</code>
                        {file.note && (
                          <p className="text-text-secondary mt-1">{file.note}</p>
                        )}
                      </div>
                    ))}
                    {session.handOff.filesTouched.length > 5 && (
                      <p className="text-xs text-text-secondary">
                        +{session.handOff.filesTouched.length - 5} more files
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Actionables for next agent */}
              {session.handOff.actionablesForNextAgent.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-text-primary">
                    Actionables for Next Agent
                  </h4>
                  <ul className="space-y-1 text-sm text-warning">
                    {session.handOff.actionablesForNextAgent.map((actionable, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="mr-2">→</span>
                        <span>{actionable}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Open questions */}
              {session.handOff.openQuestions.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-text-primary">
                    Open Questions
                  </h4>
                  <ul className="space-y-1 text-sm text-text-secondary">
                    {session.handOff.openQuestions.map((question, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="text-error mr-2">?</span>
                        <span>{question}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Legacy signature */}
              {session.handOff.legacySignature && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-text-secondary italic">
                    "{session.handOff.legacySignature}"
                  </p>
                </div>
              )}

              {/* Session metadata */}
              <div className="flex justify-between items-center pt-2 border-t border-border text-xs text-text-secondary">
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
