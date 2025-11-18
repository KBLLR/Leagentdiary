/**
 * Timeline Filters Component
 * Provides filtering and search controls for the diary timeline
 */

import { useState, useEffect } from 'react'
import type { DiarySession, AgentsResponse } from '../types'

interface TimelineFiltersProps {
  sessions: DiarySession[]
  agentsData: AgentsResponse | null
  onFilterChange: (filteredSessions: DiarySession[]) => void
}

export function TimelineFilters({ sessions, agentsData, onFilterChange }: TimelineFiltersProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRepos, setSelectedRepos] = useState<string[]>([])
  const [selectedAgents, setSelectedAgents] = useState<string[]>([])
  const [selectedOriginModes, setSelectedOriginModes] = useState<string[]>([])
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  // Extract unique values for filter options
  const repos = Array.from(new Set(sessions.map(s => s.handIn?.initialfocus || 'Unknown')))
  const agents = Array.from(new Set(sessions.map(s => s.handIn?.agenthandle).filter(Boolean) as string[]))
  const originModes = Array.from(new Set(sessions.map(s => s.handIn?.originmode).filter(Boolean) as string[]))

  // Get unique categories from agents data
  const categories = agentsData?.houses
    ? Array.from(new Set(agentsData.houses.flatMap(h => h.agents.map(a => a.category))))
    : []

  // Apply filters
  useEffect(() => {
    let filtered = sessions

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(session => {
        const searchableText = [
          session.handIn?.selfchosenname,
          session.handIn?.agenthandle,
          session.handIn?.initialfocus,
          session.handIn?.favoritesong,
          session.handIn?.favoriteanimal,
          ...(session.handOff?.contributions || []),
          ...(session.handOff?.actionablesForNextAgent || []),
          ...(session.handOff?.openQuestions || []),
          session.handOff?.legacySignature,
        ].filter(Boolean).join(' ').toLowerCase()

        return searchableText.includes(query)
      })
    }

    // Repo filter (using initialfocus as proxy)
    if (selectedRepos.length > 0) {
      filtered = filtered.filter(s =>
        selectedRepos.includes(s.handIn?.initialfocus || 'Unknown')
      )
    }

    // Agent filter
    if (selectedAgents.length > 0) {
      filtered = filtered.filter(s =>
        s.handIn?.agenthandle && selectedAgents.includes(s.handIn.agenthandle)
      )
    }

    // Origin mode filter
    if (selectedOriginModes.length > 0) {
      filtered = filtered.filter(s =>
        s.handIn?.originmode && selectedOriginModes.includes(s.handIn.originmode)
      )
    }

    // Category filter (requires matching against agents data)
    if (selectedCategories.length > 0 && agentsData) {
      filtered = filtered.filter(s => {
        if (!s.handIn?.agenthandle) return false

        // Find agent in registry
        for (const house of agentsData.houses) {
          const agent = house.agents.find(a => a.alias === s.handIn?.agenthandle)
          if (agent && selectedCategories.includes(agent.category)) {
            return true
          }
        }
        return false
      })
    }

    onFilterChange(filtered)
  }, [searchQuery, selectedRepos, selectedAgents, selectedOriginModes, selectedCategories, sessions, agentsData, onFilterChange])

  const toggleSelection = (value: string, selected: string[], setter: (values: string[]) => void) => {
    if (selected.includes(value)) {
      setter(selected.filter(v => v !== value))
    } else {
      setter([...selected, value])
    }
  }

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedRepos([])
    setSelectedAgents([])
    setSelectedOriginModes([])
    setSelectedCategories([])
  }

  const activeFilterCount =
    (searchQuery ? 1 : 0) +
    selectedRepos.length +
    selectedAgents.length +
    selectedOriginModes.length +
    selectedCategories.length

  return (
    <div className="mb-6 bg-surface border border-border rounded-xl shadow-sm p-4">
      {/* Search bar and filter toggle */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search input */}
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2 pl-10 bg-background border border-border rounded-lg text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        </div>

        {/* Filter toggle button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 bg-background border border-border rounded-lg text-text-primary hover:bg-surface-hover hover:border-accent/50 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="bg-accent text-background rounded-full px-2 py-0.5 text-xs font-medium">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear filters button */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="px-4 py-2 text-text-secondary hover:text-text-primary transition-colors"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expandable filter options */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t border-border space-y-4">
          {/* Agent filter */}
          {agents.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">Agents</h4>
              <div className="flex flex-wrap gap-2">
                {agents.map(agent => (
                  <button
                    key={agent}
                    onClick={() => toggleSelection(agent, selectedAgents, setSelectedAgents)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      selectedAgents.includes(agent)
                        ? 'bg-accent text-background'
                        : 'bg-background border border-border text-text-secondary hover:border-accent/50'
                    }`}
                  >
                    @{agent}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Origin mode filter */}
          {originModes.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">Origin Mode</h4>
              <div className="flex flex-wrap gap-2">
                {originModes.map(mode => (
                  <button
                    key={mode}
                    onClick={() => toggleSelection(mode, selectedOriginModes, setSelectedOriginModes)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      selectedOriginModes.includes(mode)
                        ? 'bg-accent text-background'
                        : 'bg-background border border-border text-text-secondary hover:border-accent/50'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category filter */}
          {categories.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-text-primary mb-2">Agent Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleSelection(category, selectedCategories, setSelectedCategories)}
                    className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                      selectedCategories.includes(category)
                        ? 'bg-accent text-background'
                        : 'bg-background border border-border text-text-secondary hover:border-accent/50'
                    }`}
                  >
                    {category.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
