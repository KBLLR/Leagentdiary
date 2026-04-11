/**
 * Runtime contracts for the LeAgentDiary review surface.
 * These types accept both the current HTDI handIn/handOff payloads
 * and the richer diary/profile/task objects used by the next lane.
 */

export type OriginMode = 'self-determined' | 'deployed'
export type AgentCategory =
  | 'orchestrator'
  | 'manager'
  | 'worker'
  | 'agent_service'
  | 'stage_artist'
  | 'unknown'

export type AgentStatus = 'active' | 'inactive' | 'archived'
export type DiaryEventType =
  | 'note'
  | 'task'
  | 'task_update'
  | 'handoff'
  | 'reflection_note'
  | 'artifact'
  | 'decision'

export type SessionStatus = 'success' | 'error' | 'in_progress'
export type ReviewStatus = 'draft' | 'ready' | 'approved' | 'archived'
export type VisibilityLevel = 'internal' | 'anthology' | 'public'
export type TaskStatus = 'todo' | 'in_progress' | 'blocked' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

export interface FileTouched {
  path: string
  note?: string
}

export interface HandIn {
  selfchosenname: string
  agenthandle: string
  originmode: OriginMode
  favoriteanimal?: string
  favoritesong?: string
  datetimesummon: string
  initialfocus: string
}

export interface HandOff {
  contributions: string[]
  filesTouched: FileTouched[]
  actionablesForNextAgent: string[]
  openQuestions: string[]
  legacySignature: string
  datetimebacktosource: string
}

export interface AgentIdentity {
  display_name: string
  self_chosen_name?: string
  role?: string
  category?: AgentCategory
  origin_mode?: OriginMode | 'unknown'
}

export interface AgentProfileQuestionnaire {
  bio?: string
  working_style?: string
  strengths: string[]
  constraints: string[]
  favorite_animal?: string
  favorite_song?: string
  themes: string[]
  signature?: string
}

export interface AgentProfileMedia {
  portrait_prompt?: string
  portrait_image_refs: string[]
  manual_stage_prompt?: string
  stage_scene_refs: string[]
}

export interface AgentProfileVisibility {
  internal: boolean
  public_excerpt_allowed: boolean
}

export interface NotionMirrorRefs {
  profile_page_id?: string
  journal_page_ids: string[]
  task_page_ids: string[]
  workspace?: string
}

export interface AgentProfile {
  schema_version?: string
  id: string
  agent_handle: string
  house_id: string
  status: AgentStatus
  created_at?: string
  updated_at?: string
  identity: AgentIdentity
  questionnaire: AgentProfileQuestionnaire
  media: AgentProfileMedia
  visibility: AgentProfileVisibility
  notion?: NotionMirrorRefs
  metadata: Record<string, unknown>
}

export interface TaskRecord {
  schema_version?: string
  id: string
  task_id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  assignee?: string
  house_id: string
  session_refs: string[]
  handoff_refs: string[]
  open_questions: string[]
  source_refs: string[]
  created_at?: string
  updated_at?: string
  notion_page_id?: string
  metadata: Record<string, unknown>
}

export interface SessionHandoff {
  to_agent_handle?: string
  reason?: string
  actionables: string[]
  open_questions: string[]
  task_refs: string[]
  source_refs: string[]
}

export interface DiaryInteraction {
  id: string
  at: string
  type: DiaryEventType
  actor_handle: string
  summary: string
  content_md?: string
  artifact_refs: string[]
  tags: string[]
  visibility: VisibilityLevel
  task?: Partial<TaskRecord>
  handoff?: SessionHandoff
  metadata: Record<string, unknown>
}

export interface DiaryReflection {
  summary: string
  learnings: string[]
  next_actions: string[]
  status: ReviewStatus
  visibility: VisibilityLevel
  anthology_ingest_candidate?: boolean
  public_excerpt_candidate?: boolean
  belle_story_slug?: string
  notion_page_id?: string
  metadata: Record<string, unknown>
}

export interface DiarySession {
  schema_version?: string
  id?: string
  sessionId: string
  session_ref?: string
  source?: string
  repo_id?: string
  house_id?: string
  agent_handle?: string
  profile_ref?: string
  started_at?: string
  ended_at?: string
  status?: SessionStatus
  initial_focus?: string
  interactions: DiaryInteraction[]
  tasks: TaskRecord[]
  handoffs: SessionHandoff[]
  reflection?: DiaryReflection
  artifact_refs: string[]
  visibility?: VisibilityLevel
  metadata: Record<string, unknown>
  handIn: HandIn | null
  handOff: HandOff | null
}

export interface DiaryResponse {
  type: string
  generatedAt: string
  source: string
  repoCount: number
  totalSessions: number
  repos: string[]
  profiles?: AgentProfile[]
  tasks?: TaskRecord[]
  sessions: DiarySession[]
}

export interface DiaryBundle {
  generatedAt: string
  source: string
  sessions: DiarySession[]
  profiles: AgentProfile[]
  tasks: TaskRecord[]
}

export interface AgentsResponse {
  generatedAt: string
  houses: House[]
}

export interface House {
  id: string
  name: string
  type: 'hub' | 'project'
  agents: Agent[]
}

export interface Agent {
  alias: string
  name: string
  role: string
  category: Exclude<AgentCategory, 'unknown'>
  status: AgentStatus
  promptPath: string
  description: string
}

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

export type SortField = 'sessionId' | 'agent' | 'originmode'
export type SortDirection = 'asc' | 'desc'

export interface SortOptions {
  field: SortField
  direction: SortDirection
}

/**
 * Legacy types kept for compatibility with older consumers.
 */
export interface DiaryEntry {
  id: string
  sessionId: string
  handIn: HandIn | null
  handOff: HandOff | null
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
  status: SessionStatus
  tags: string[]
  reflection?: string
  branchUrl?: string
  deploymentUrl?: string
}
