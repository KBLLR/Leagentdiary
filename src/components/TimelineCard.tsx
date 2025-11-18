/**
 * Timeline Card Component
 * Displays a single diary entry with expandable details
 */

import { useState } from 'react'
import type { DiaryEntry } from '../types'

interface TimelineCardProps {
  entry: DiaryEntry
  defaultExpanded?: boolean
}

export function TimelineCard({ entry, defaultExpanded = false }: TimelineCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-success/20 text-success'
      case 'error':
        return 'bg-error/20 text-error'
      case 'in_progress':
        return 'bg-warning/20 text-warning'
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
          {formatTimestamp(entry.timestamp)}
        </time>

        {/* Card */}
        <div className="mt-2 bg-surface border border-border rounded-xl shadow-sm hover:shadow-md hover:border-accent/50 transition-all duration-200">
          {/* Card header (trigger) */}
          <div
            onClick={toggleExpanded}
            className="p-4 flex justify-between items-center cursor-pointer select-none"
          >
            <div className="flex-1 min-w-0">
              {/* Badges and branch */}
              <div className="flex items-center space-x-2 mb-1 flex-wrap gap-1">
                <span className={`text-xs font-medium px-2 py-0.5 rounded ${getStatusColor(entry.metadata.status)}`}>
                  {entry.repo}
                </span>
                <span className="text-xs font-medium text-text-secondary">
                  {entry.branch}
                </span>
                {entry.metadata.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 rounded bg-border/50 text-text-secondary"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Commit message or title */}
              <p className="text-base font-semibold text-text-primary truncate">
                {entry.commits[0]?.message || 'No commit message'}
              </p>

              {/* Agent info */}
              <div className="flex items-center space-x-2 mt-2">
                {entry.agent.avatar ? (
                  <img
                    src={entry.agent.avatar}
                    alt={entry.agent.name}
                    className="h-5 w-5 rounded-full"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-accent/20 flex items-center justify-center">
                    <span className="text-xs text-accent font-bold">
                      {entry.agent.name[0]?.toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm text-text-secondary">
                  {entry.agent.name}
                </span>
                {entry.agent.role && (
                  <span className="text-xs text-text-secondary/70">
                    • {entry.agent.role}
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
              expanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="p-4 border-t border-border space-y-4">
              {/* Reflection */}
              {entry.metadata.reflection && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-text-primary">
                    Agentic Reflection
                  </h4>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    {entry.metadata.reflection}
                  </p>
                </div>
              )}

              {/* Commits */}
              {entry.commits.length > 1 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-text-primary">
                    Commits ({entry.commits.length})
                  </h4>
                  <div className="space-y-2">
                    {entry.commits.slice(0, 3).map((commit) => (
                      <div key={commit.sha} className="text-xs">
                        <code className="text-accent">{commit.sha.slice(0, 7)}</code>
                        <span className="text-text-secondary ml-2">{commit.message}</span>
                      </div>
                    ))}
                    {entry.commits.length > 3 && (
                      <p className="text-xs text-text-secondary">
                        +{entry.commits.length - 3} more commits
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Handoffs */}
              {entry.handoffs && entry.handoffs.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-text-primary">
                    Agent Handoffs ({entry.handoffs.length})
                  </h4>
                  <div className="space-y-2">
                    {entry.handoffs.map((handoff, idx) => (
                      <div key={idx} className="text-xs bg-surface-hover rounded p-2">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-accent">{handoff.from}</span>
                          <span className="text-text-secondary">→</span>
                          <span className="text-accent">{handoff.to}</span>
                        </div>
                        <p className="text-text-secondary">{handoff.context}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links */}
              <div className="flex justify-between items-center pt-2 border-t border-border">
                <div className="flex items-center space-x-2 text-xs text-text-secondary">
                  {entry.metadata.duration && (
                    <span>Duration: {Math.round(entry.metadata.duration / 60)}m</span>
                  )}
                </div>
                <div className="flex space-x-4 text-sm">
                  {entry.metadata.branchUrl && (
                    <a
                      href={entry.metadata.branchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-accent hover:underline"
                    >
                      View Branch
                    </a>
                  )}
                  {entry.metadata.deploymentUrl && (
                    <a
                      href={entry.metadata.deploymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-success hover:underline"
                    >
                      Visit Deployment
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
