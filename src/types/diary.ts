/**
 * TypeScript interfaces for HTDI Agentic Lab diary data
 * Based on actual HTDI API response from /api/diary and /api/agents
 */

/**
 * Main diary response structure
 */
export interface DiaryResponse {
  type: string
  generatedAt: string // ISO 8601
  source: string // Path to HANDOFFS.md
  repoCount: number
  totalSessions: number
  repos: string[]
  sessions: DiarySession[]
}

/**
 * Individual session (replaces old DiaryEntry)
 */
export interface DiarySession {
  sessionId: string // ISO timestamp or "<ISO_TIMESTAMP>" for template
  handIn: HandIn | null
  handOff: HandOff | null
}

/**
 * Hand-in data when agent starts session
 */
export interface HandIn {
  selfchosenname: string
  agenthandle: string
  originmode: 'self-determined' | 'deployed'
  favoriteanimal?: string
  favoritesong?: string
  datetimesummon: string // ISO 8601
  initialfocus: string
}

/**
 * Hand-off data when agent completes session
 */
export interface HandOff {
  contributions: string[]
  filesTouched: FileTouched[]
  actionablesForNextAgent: string[]
  openQuestions: string[]
  legacySignature: string
  datetimebacktosource: string // ISO 8601
}

/**
 * File modification info
 */
export interface FileTouched {
  path: string
  note: string
}

/**
 * Agent registry response structure
 */
export interface AgentsResponse {
  generatedAt: string
  houses: House[]
}

/**
 * House (organization/hub)
 */
export interface House {
  id: string
  name: string
  type: 'hub' | 'project'
  agents: Agent[]
}

/**
 * Agent from registry
 */
export interface Agent {
  alias: string
  name: string
  role: string
  category: 'orchestrator' | 'manager' | 'worker' | 'agent_service' | 'stage_artist'
  status: 'active' | 'inactive' | 'archived'
  promptPath: string
  description: string
}

/**
 * Filter and search types
 */
export interface DiaryFilters {
  agents?: string[]
  categories?: Agent['category'][]
  originMode?: HandIn['originmode'][]
  dateRange?: {
    start: string
    end: string
  }
  searchQuery?: string
}

/**
 * Sort options
 */
export type SortField = 'sessionId' | 'agent' | 'originmode'
export type SortDirection = 'asc' | 'desc'

export interface SortOptions {
  field: SortField
  direction: SortDirection
}

/**
 * Legacy types for backward compatibility (will be removed)
 */
export interface DiaryEntry extends DiarySession {
  id: string
  timestamp: string
  repo: string
  branch: string
  agent: AgentInfo
  commits: CommitInfo[]
  handoffs: HandoffInfo[]
  metadata: SessionMetadata
}

export interface CommitInfo {
  sha: string
  message: string
  author: string
  timestamp: string
  filesChanged: string[]
  additions?: number
  deletions?: number
}

export interface HandoffInfo {
  from: string
  to: string
  context: string
  timestamp: string
  reason?: string
}

export interface AgentInfo {
  name: string
  role: string
  repo: string
  avatar?: string
  email?: string
}

export interface SessionMetadata {
  duration?: number
  status: 'success' | 'error' | 'in_progress'
  tags: string[]
  reflection?: string
  branchUrl?: string
  deploymentUrl?: string
}
