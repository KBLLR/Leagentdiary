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
    <div className="timeline-filters">
      {/* Search bar and filter toggle */}
      <div className="filters-controls">
        {/* Search input */}
        <div className="search-container">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
          <svg
            className="search-icon"
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
          className="filter-toggle-btn"
        >
          <svg style={{ width: '1rem', height: '1rem' }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          Filters
          {activeFilterCount > 0 && (
            <span className="filter-count-badge">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Clear filters button */}
        {activeFilterCount > 0 && (
          <button
            onClick={clearAllFilters}
            className="clear-filters-btn"
          >
            Clear all
          </button>
        )}
      </div>

      {/* Expandable filter options */}
      {showFilters && (
        <div className="filter-options">
          {/* Agent filter */}
          {agents.length > 0 && (
            <div className="filter-section">
              <h4 className="filter-section-title">Agents</h4>
              <div className="filter-buttons">
                {agents.map(agent => (
                  <button
                    key={agent}
                    onClick={() => toggleSelection(agent, selectedAgents, setSelectedAgents)}
                    className={`filter-button${selectedAgents.includes(agent) ? ' active' : ''}`}
                  >
                    @{agent}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Origin mode filter */}
          {originModes.length > 0 && (
            <div className="filter-section">
              <h4 className="filter-section-title">Origin Mode</h4>
              <div className="filter-buttons">
                {originModes.map(mode => (
                  <button
                    key={mode}
                    onClick={() => toggleSelection(mode, selectedOriginModes, setSelectedOriginModes)}
                    className={`filter-button${selectedOriginModes.includes(mode) ? ' active' : ''}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Category filter */}
          {categories.length > 0 && (
            <div className="filter-section">
              <h4 className="filter-section-title">Agent Categories</h4>
              <div className="filter-buttons">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => toggleSelection(category, selectedCategories, setSelectedCategories)}
                    className={`filter-button${selectedCategories.includes(category) ? ' active' : ''}`}
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
