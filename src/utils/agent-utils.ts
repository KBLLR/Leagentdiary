/**
 * Agent registry utilities
 */

import type { Agent, AgentsResponse } from '../types'

/**
 * Find an agent by their handle/alias in the registry
 */
export function findAgentByHandle(
  agentHandle: string,
  agentsData: AgentsResponse | null
): Agent | null {
  if (!agentsData?.houses) return null

  for (const house of agentsData.houses) {
    const agent = house.agents?.find(a => a.alias === agentHandle)
    if (agent) return agent
  }

  return null
}

/**
 * Get category color class for agent category badges
 */
export function getCategoryColor(category: Agent['category']): string {
  switch (category) {
    case 'orchestrator':
      return 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
    case 'manager':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
    case 'worker':
      return 'bg-green-500/20 text-green-400 border border-green-500/30'
    case 'agent_service':
      return 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
    case 'stage_artist':
      return 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
  }
}

/**
 * Get status color class for agent status badges
 */
export function getStatusColor(status: Agent['status']): string {
  switch (status) {
    case 'active':
      return 'bg-green-500/20 text-green-400'
    case 'inactive':
      return 'bg-gray-500/20 text-gray-400'
    case 'archived':
      return 'bg-red-500/20 text-red-400'
    default:
      return 'bg-gray-500/20 text-gray-400'
  }
}

/**
 * Format category name for display
 */
export function formatCategory(category: Agent['category']): string {
  return category.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}
