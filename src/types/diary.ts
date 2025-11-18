/**
 * TypeScript interfaces for HTDI Agentic Lab diary data
 * Based on: htdi-agentic-lab/automation/scripts/diary/parse-multi-repo.mjs
 */

export interface DiaryEntry {
  id: string
  timestamp: string // ISO 8601
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
  timestamp: string // ISO 8601
  filesChanged: string[]
  additions?: number
  deletions?: number
}

export interface HandoffInfo {
  from: string // agent name
  to: string // agent name
  context: string
  timestamp: string // ISO 8601
  reason?: string
}

export interface AgentInfo {
  name: string
  role: string
  repo: string
  avatar?: string // future: S3 URL from stage service
  email?: string
}

export interface SessionMetadata {
  duration?: number // seconds
  status: 'success' | 'error' | 'in_progress'
  tags: string[]
  reflection?: string // agent's end-of-session summary
  branchUrl?: string
  deploymentUrl?: string
}

/**
 * API response types
 */
export interface DiaryResponse {
  entries: DiaryEntry[]
  total: number
  lastUpdated: string
}

/**
 * Filter and search types
 */
export interface DiaryFilters {
  repos?: string[]
  agents?: string[]
  status?: SessionMetadata['status'][]
  dateRange?: {
    start: string
    end: string
  }
  searchQuery?: string
}

/**
 * Sort options
 */
export type SortField = 'timestamp' | 'repo' | 'agent' | 'duration'
export type SortDirection = 'asc' | 'desc'

export interface SortOptions {
  field: SortField
  direction: SortDirection
}
