import type {
  AgentProfile,
  DiaryBundle,
  DiaryInteraction,
  DiaryReflection,
  DiaryResponse,
  DiarySession,
  HandIn,
  HandOff,
  SessionHandoff,
  TaskPriority,
  TaskRecord,
  TaskStatus,
  VisibilityLevel,
} from '../types'
import { ensurePortraitPromptPrefix } from './profile-prompts'
import { applyProfileRitualMetadata } from './profile-ritual'

const asRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? value as Record<string, unknown> : {}

const asString = (value: unknown, fallback = ''): string =>
  typeof value === 'string' ? value : fallback

const asArray = <T>(value: unknown): T[] => Array.isArray(value) ? value as T[] : []

const unique = <T>(items: T[]): T[] => Array.from(new Set(items))

const fallbackTimestamp = '1970-01-01T00:00:00Z'

const normalizeVisibility = (value: unknown, fallback: VisibilityLevel = 'internal'): VisibilityLevel => {
  if (value === 'public' || value === 'anthology' || value === 'internal') {
    return value
  }

  return fallback
}

const normalizeTaskStatus = (value: unknown): TaskStatus => {
  if (value === 'todo' || value === 'in_progress' || value === 'blocked' || value === 'done') {
    return value
  }

  if (value === 'success') return 'done'
  return 'todo'
}

const normalizeTaskPriority = (value: unknown): TaskPriority => {
  if (value === 'low' || value === 'medium' || value === 'high') {
    return value
  }

  return 'medium'
}

export const buildProfileId = (agentHandle: string) => `agent:${agentHandle || 'unknown'}`

const buildSessionBaseId = (sessionId: string, agentHandle: string) =>
  `session:${sessionId || fallbackTimestamp}:${agentHandle || 'unknown'}`

const normalizeHandIn = (value: unknown, session: Record<string, unknown>): HandIn | null => {
  const input = asRecord(value)
  const agentHandle = asString(input.agenthandle || session.agent_handle)
  const initialFocus = asString(input.initialfocus || session.initial_focus)

  if (!agentHandle && !initialFocus) {
    return null
  }

  return {
    selfchosenname: asString(input.selfchosenname || session.agent_handle || agentHandle || 'Unknown agent'),
    agenthandle: agentHandle || 'unknown',
    originmode: input.originmode === 'deployed' ? 'deployed' : 'self-determined',
    favoriteanimal: asString(input.favoriteanimal),
    favoritesong: asString(input.favoritesong),
    datetimesummon: asString(input.datetimesummon || session.started_at || session.session_ref || session.sessionId || fallbackTimestamp),
    initialfocus: initialFocus || 'Review session state',
  }
}

const normalizeHandOff = (value: unknown, session: Record<string, unknown>): HandOff | null => {
  const input = asRecord(value)
  const contributions = asArray<string>(input.contributions).map(String)
  const filesTouched = asArray<Record<string, unknown>>(input.filesTouched).map((file) => ({
    path: asString(file.path),
    note: asString(file.note),
  })).filter((file) => file.path)
  const actionablesForNextAgent = asArray<string>(input.actionablesForNextAgent).map(String)
  const openQuestions = asArray<string>(input.openQuestions).map(String)
  const datetimebacktosource = asString(input.datetimebacktosource || session.ended_at || session.session_ref || session.sessionId || fallbackTimestamp)

  if (!contributions.length && !filesTouched.length && !actionablesForNextAgent.length && !openQuestions.length && !input.legacySignature) {
    return null
  }

  return {
    contributions,
    filesTouched,
    actionablesForNextAgent,
    openQuestions,
    legacySignature: asString(input.legacySignature),
    datetimebacktosource,
  }
}

const deriveTasksFromLegacy = (sessionId: string, agentHandle: string, handOff: HandOff | null): TaskRecord[] =>
  (handOff?.actionablesForNextAgent || []).map((title, index) => ({
    id: `task:${sessionId}:${index + 1}`,
    task_id: `task:${sessionId}:${index + 1}`,
    title,
    status: 'todo',
    priority: 'medium',
    assignee: undefined,
    house_id: 'leagentdiary',
    session_refs: [sessionId],
    handoff_refs: [`handoff:${sessionId}`],
    open_questions: handOff?.openQuestions || [],
    source_refs: handOff?.filesTouched?.map((file) => file.path) || [],
    created_at: handOff?.datetimebacktosource,
    updated_at: handOff?.datetimebacktosource,
    metadata: {
      derived_from: 'legacy-handOff.actionablesForNextAgent',
      agent_handle: agentHandle,
    },
  }))

const normalizeTask = (value: unknown, sessionId: string, agentHandle: string): TaskRecord => {
  const input = asRecord(value)
  const taskId = asString(input.task_id || input.id || `task:${sessionId}:1`)

  return {
    schema_version: asString(input.schema_version),
    id: asString(input.id || taskId),
    task_id: taskId,
    title: asString(input.title || input.summary || 'Untitled task'),
    description: asString(input.description),
    status: normalizeTaskStatus(input.status),
    priority: normalizeTaskPriority(input.priority),
    assignee: asString(input.assignee || input.owner),
    house_id: asString(input.house_id || 'leagentdiary'),
    session_refs: unique(asArray<string>(input.session_refs).concat(sessionId).map(String).filter(Boolean)),
    handoff_refs: asArray<string>(input.handoff_refs).map(String),
    open_questions: asArray<string>(input.open_questions).map(String),
    source_refs: asArray<string>(input.source_refs).map(String),
    created_at: asString(input.created_at),
    updated_at: asString(input.updated_at),
    notion_page_id: asString(input.notion_page_id),
    metadata: {
      ...asRecord(input.metadata),
      agent_handle: asString(input.assignee || agentHandle),
    },
  }
}

const deriveHandoffsFromLegacy = (sessionId: string, handOff: HandOff | null): SessionHandoff[] => {
  if (!handOff) {
    return []
  }

  if (!handOff.actionablesForNextAgent.length && !handOff.openQuestions.length) {
    return []
  }

  return [
    {
      reason: 'Legacy handoff',
      actionables: handOff.actionablesForNextAgent,
      open_questions: handOff.openQuestions,
      task_refs: handOff.actionablesForNextAgent.map((_, index) => `task:${sessionId}:${index + 1}`),
      source_refs: handOff.filesTouched.map((file) => file.path),
    },
  ]
}

const normalizeHandoff = (value: unknown): SessionHandoff => {
  const input = asRecord(value)

  return {
    to_agent_handle: asString(input.to_agent_handle),
    reason: asString(input.reason),
    actionables: asArray<string>(input.actionables).map(String),
    open_questions: asArray<string>(input.open_questions).map(String),
    task_refs: asArray<string>(input.task_refs).map(String),
    source_refs: asArray<string>(input.source_refs).map(String),
  }
}

const deriveInteractionsFromLegacy = (
  sessionId: string,
  handIn: HandIn | null,
  handOff: HandOff | null,
  tasks: TaskRecord[],
  handoffs: SessionHandoff[],
): DiaryInteraction[] => {
  const agentHandle = handIn?.agenthandle || 'unknown'
  const interactions: DiaryInteraction[] = []

  if (handIn) {
    interactions.push({
      id: `${sessionId}:entry`,
      at: handIn.datetimesummon,
      type: 'note',
      actor_handle: agentHandle,
      summary: handIn.initialfocus,
      content_md: handIn.initialfocus,
      artifact_refs: [],
      tags: ['session-start'],
      visibility: 'internal',
      metadata: {},
    })
  }

  tasks.forEach((task, index) => {
    interactions.push({
      id: `${sessionId}:task:${index + 1}`,
      at: handOff?.datetimebacktosource || handIn?.datetimesummon || fallbackTimestamp,
      type: 'task',
      actor_handle: agentHandle,
      summary: task.title,
      content_md: task.description,
      artifact_refs: task.source_refs,
      tags: ['task'],
      visibility: 'internal',
      task,
      metadata: {},
    })
  })

  handoffs.forEach((handoff, index) => {
    interactions.push({
      id: `${sessionId}:handoff:${index + 1}`,
      at: handOff?.datetimebacktosource || handIn?.datetimesummon || fallbackTimestamp,
      type: 'handoff',
      actor_handle: agentHandle,
      summary: handoff.reason || 'Prepared a handoff',
      content_md: handoff.actionables.join('\n'),
      artifact_refs: handoff.source_refs,
      tags: ['handoff'],
      visibility: 'internal',
      handoff,
      metadata: {},
    })
  })

  if (handOff && (handOff.contributions.length || handOff.filesTouched.length || handOff.openQuestions.length)) {
    interactions.push({
      id: `${sessionId}:reflection`,
      at: handOff.datetimebacktosource,
      type: 'reflection_note',
      actor_handle: agentHandle,
      summary: `Captured ${handOff.contributions.length} contributions and ${handOff.openQuestions.length} open questions.`,
      content_md: handOff.contributions.join('\n'),
      artifact_refs: handOff.filesTouched.map((file) => file.path),
      tags: ['reflection'],
      visibility: 'internal',
      metadata: {},
    })
  }

  return interactions
}

const normalizeInteraction = (value: unknown, index: number, sessionId: string, agentHandle: string): DiaryInteraction => {
  const input = asRecord(value)

  return {
    id: asString(input.id || `${sessionId}:event:${index + 1}`),
    at: asString(input.at || fallbackTimestamp),
    type: (asString(input.type) as DiaryInteraction['type']) || 'note',
    actor_handle: asString(input.actor_handle || agentHandle || 'unknown'),
    summary: asString(input.summary || input.title || 'Session event'),
    content_md: asString(input.content_md),
    artifact_refs: asArray<string>(input.artifact_refs).map(String),
    tags: asArray<string>(input.tags).map(String),
    visibility: normalizeVisibility(input.visibility),
    task: input.task ? normalizeTask(input.task, sessionId, agentHandle) : undefined,
    handoff: input.handoff ? normalizeHandoff(input.handoff) : undefined,
    metadata: asRecord(input.metadata),
  }
}

const deriveReflectionFromLegacy = (
  sessionId: string,
  handIn: HandIn | null,
  handOff: HandOff | null,
  tasks: TaskRecord[],
): DiaryReflection | undefined => {
  if (!handIn || !handOff) {
    return undefined
  }

  if (!handOff.contributions.length && !tasks.length && !handOff.openQuestions.length && !handOff.filesTouched.length) {
    return undefined
  }

  return {
    summary: `Focused on ${handIn.initialfocus}.`,
    learnings: handOff.contributions.length
      ? handOff.contributions
      : handOff.filesTouched.map((file) => `Touched ${file.path}`),
    next_actions: handOff.actionablesForNextAgent,
    status: 'draft',
    visibility: 'anthology',
    anthology_ingest_candidate: true,
    public_excerpt_candidate: true,
    metadata: {
      session_ref: sessionId,
      open_questions: handOff.openQuestions,
    },
  }
}

const normalizeReflection = (value: unknown, sessionId: string, handOff: HandOff | null): DiaryReflection | undefined => {
  if (!value) {
    return deriveReflectionFromLegacy(sessionId, null, handOff, [])
  }

  const input = asRecord(value)

  return {
    summary: asString(input.summary || 'Reflection pending'),
    learnings: asArray<string>(input.learnings).map(String),
    next_actions: asArray<string>(input.next_actions).map(String),
    status: asString(input.status || 'draft') as DiaryReflection['status'],
    visibility: normalizeVisibility(input.visibility, 'anthology'),
    anthology_ingest_candidate: input.anthology_ingest_candidate !== false,
    public_excerpt_candidate: Boolean(input.public_excerpt_candidate),
    belle_story_slug: asString(input.belle_story_slug),
    notion_page_id: asString(input.notion_page_id),
    metadata: {
      ...asRecord(input.metadata),
      open_questions: handOff?.openQuestions || [],
    },
  }
}

export const normalizeDiarySession = (value: unknown): DiarySession => {
  const input = asRecord(value)
  const handIn = normalizeHandIn(input.handIn, input)
  const handOff = normalizeHandOff(input.handOff, input)
  const agentHandle = asString(input.agent_handle || handIn?.agenthandle || 'unknown')
  const sessionId = asString(input.sessionId || input.session_ref || input.id || fallbackTimestamp)
  const tasks = (asArray<unknown>(input.tasks).length
    ? asArray<unknown>(input.tasks).map((task) => normalizeTask(task, sessionId, agentHandle))
    : deriveTasksFromLegacy(sessionId, agentHandle, handOff)
  )
  const handoffs = (asArray<unknown>(input.handoffs).length
    ? asArray<unknown>(input.handoffs).map(normalizeHandoff)
    : deriveHandoffsFromLegacy(sessionId, handOff)
  )
  const interactions = (asArray<unknown>(input.interactions).length
    ? asArray<unknown>(input.interactions).map((interaction, index) =>
        normalizeInteraction(interaction, index, sessionId, agentHandle)
      )
    : deriveInteractionsFromLegacy(sessionId, handIn, handOff, tasks, handoffs)
  ).sort((left, right) => left.at.localeCompare(right.at))
  const reflection = input.reflection
    ? normalizeReflection(input.reflection, sessionId, handOff)
    : deriveReflectionFromLegacy(sessionId, handIn, handOff, tasks)

  const synthesizedHandIn = handIn || {
    selfchosenname: agentHandle,
    agenthandle: agentHandle,
    originmode: 'self-determined',
    datetimesummon: asString(input.started_at || input.session_ref || sessionId),
    initialfocus: asString(input.initial_focus || interactions[0]?.summary || 'Review session state'),
  }

  const synthesizedHandOff = handOff || {
    contributions: reflection?.learnings || [],
    filesTouched: asArray<string>(input.artifact_refs).map((filePath) => ({ path: filePath })),
    actionablesForNextAgent: reflection?.next_actions || [],
    openQuestions: handoffs.flatMap((handoff) => handoff.open_questions),
    legacySignature: asString(input.metadata && asRecord(input.metadata).legacySignature),
    datetimebacktosource: asString(input.ended_at || synthesizedHandIn.datetimesummon),
  }

  return {
    schema_version: asString(input.schema_version || '2.0.0'),
    id: asString(input.id || buildSessionBaseId(sessionId, agentHandle)),
    sessionId,
    session_ref: asString(input.session_ref || sessionId),
    source: asString(input.source || 'htdi'),
    repo_id: asString(input.repo_id || 'core-x-kbllr_0'),
    house_id: asString(input.house_id || 'leagentdiary'),
    agent_handle: agentHandle,
    profile_ref: asString(input.profile_ref || buildProfileId(agentHandle)),
    started_at: asString(input.started_at || synthesizedHandIn.datetimesummon),
    ended_at: asString(input.ended_at || synthesizedHandOff.datetimebacktosource),
    status: (asString(input.status || 'success') as DiarySession['status']) || 'success',
    initial_focus: asString(input.initial_focus || synthesizedHandIn.initialfocus),
    interactions,
    tasks,
    handoffs,
    reflection,
    artifact_refs: unique(
      asArray<string>(input.artifact_refs)
        .concat(synthesizedHandOff.filesTouched.map((file) => file.path))
        .concat(interactions.flatMap((interaction) => interaction.artifact_refs))
        .map(String)
        .filter(Boolean)
    ),
    visibility: normalizeVisibility(input.visibility),
    metadata: {
      ...asRecord(input.metadata),
      public_excerpt_candidate: reflection?.public_excerpt_candidate || false,
    },
    handIn: synthesizedHandIn,
    handOff: synthesizedHandOff,
  }
}

const normalizeProfile = (value: unknown): AgentProfile => {
  const input = asRecord(value)
  const identity = asRecord(input.identity)
  const questionnaire = asRecord(input.questionnaire)
  const media = asRecord(input.media)
  const visibility = asRecord(input.visibility)
  const notion = asRecord(input.notion)
  const agentHandle = asString(input.agent_handle || identity.agent_handle || 'unknown')

  return applyProfileRitualMetadata({
    schema_version: asString(input.schema_version || '1.0.0'),
    id: asString(input.id || buildProfileId(agentHandle)),
    agent_handle: agentHandle,
    house_id: asString(input.house_id || 'leagentdiary'),
    status: (asString(input.status || 'active') as AgentProfile['status']) || 'active',
    created_at: asString(input.created_at),
    updated_at: asString(input.updated_at),
    identity: {
      display_name: asString(identity.display_name || identity.self_chosen_name || agentHandle || 'Unknown'),
      self_chosen_name: asString(identity.self_chosen_name),
      role: asString(identity.role),
      category: (asString(identity.category || 'unknown') as AgentProfile['identity']['category']) || 'unknown',
      gender: asString(identity.gender),
      pronouns: asString(identity.pronouns),
      origin_mode: asString(identity.origin_mode || 'unknown') as AgentProfile['identity']['origin_mode'],
    },
    questionnaire: {
      bio: asString(questionnaire.bio),
      working_style: asString(questionnaire.working_style),
      strengths: asArray<string>(questionnaire.strengths).map(String),
      constraints: asArray<string>(questionnaire.constraints).map(String),
      favorite_color: asString(questionnaire.favorite_color),
      favorite_animal: asString(questionnaire.favorite_animal),
      favorite_song: asString(questionnaire.favorite_song),
      themes: asArray<string>(questionnaire.themes).map(String),
      voice: asString(questionnaire.voice),
      signature: asString(questionnaire.signature),
    },
    media: {
      portrait_prompt: ensurePortraitPromptPrefix(asString(media.portrait_prompt)),
      portrait_image_refs: asArray<string>(media.portrait_image_refs).map(String),
      manual_stage_prompt: asString(media.manual_stage_prompt),
      stage_scene_refs: asArray<string>(media.stage_scene_refs).map(String),
    },
    visibility: {
      internal: visibility.internal !== false,
      public_excerpt_allowed: Boolean(visibility.public_excerpt_allowed),
    },
    notion: {
      profile_page_id: asString(notion.profile_page_id),
      journal_page_ids: asArray<string>(notion.journal_page_ids).map(String),
      task_page_ids: asArray<string>(notion.task_page_ids).map(String),
      workspace: asString(notion.workspace),
    },
    metadata: asRecord(input.metadata),
  })
}

export const deriveProfileFromSession = (session: DiarySession): AgentProfile => {
  const handIn = session.handIn
  const handOff = session.handOff
  const agentHandle = session.agent_handle || handIn?.agenthandle || 'unknown'

  return applyProfileRitualMetadata({
    schema_version: '1.0.0',
    id: session.profile_ref || buildProfileId(agentHandle),
    agent_handle: agentHandle,
    house_id: 'leagentdiary',
    status: 'active',
    created_at: session.started_at || handIn?.datetimesummon,
    updated_at: session.ended_at || handOff?.datetimebacktosource,
    identity: {
      display_name: handIn?.selfchosenname || agentHandle,
      self_chosen_name: handIn?.selfchosenname || agentHandle,
      role: '',
      category: 'unknown',
      gender: '',
      pronouns: '',
      origin_mode: handIn?.originmode || 'unknown',
    },
    questionnaire: {
      bio: '',
      working_style: '',
      strengths: [],
      constraints: [],
      favorite_color: '',
      favorite_animal: handIn?.favoriteanimal,
      favorite_song: handIn?.favoritesong,
      themes: [],
      voice: '',
      signature: handOff?.legacySignature,
    },
    media: {
      portrait_prompt: '',
      portrait_image_refs: [],
      manual_stage_prompt: '',
      stage_scene_refs: [],
    },
    visibility: {
      internal: true,
      public_excerpt_allowed: Boolean(session.reflection?.public_excerpt_candidate),
    },
    notion: {
      profile_page_id: '',
      journal_page_ids: [],
      task_page_ids: [],
      workspace: '',
    },
    metadata: {},
  })
}

export const normalizeDiaryBundle = (payload: unknown): DiaryBundle => {
  const input = asRecord(payload)
  const sessions = asArray<unknown>(input.sessions)
    .map(normalizeDiarySession)
    .filter((session) => session.sessionId !== '<ISO_TIMESTAMP>')
    .sort((left, right) => {
      const leftKey = `${left.sessionId}::${left.agent_handle || ''}`
      const rightKey = `${right.sessionId}::${right.agent_handle || ''}`
      return leftKey.localeCompare(rightKey)
    })

  const profileMap = new Map<string, AgentProfile>()

  asArray<unknown>(input.profiles)
    .map(normalizeProfile)
    .forEach((profile) => {
      profileMap.set(profile.agent_handle, profile)
    })

  sessions.forEach((session) => {
    const profile = deriveProfileFromSession(session)
    const existing = profileMap.get(profile.agent_handle)

    if (!existing) {
      profileMap.set(profile.agent_handle, profile)
      return
    }

    profileMap.set(profile.agent_handle, {
      ...existing,
      updated_at: existing.updated_at || profile.updated_at,
      questionnaire: {
        ...profile.questionnaire,
        ...existing.questionnaire,
      },
      media: {
        ...profile.media,
        ...existing.media,
      },
      visibility: existing.visibility,
      notion: existing.notion,
      metadata: {
        ...profile.metadata,
        ...existing.metadata,
      },
    })
  })

  const tasksFromPayload = asArray<unknown>(input.tasks).map((task) =>
    normalizeTask(task, asString(asRecord(task).session_ref), asString(asRecord(task).assignee))
  )
  const taskMap = new Map<string, TaskRecord>()

  tasksFromPayload.concat(sessions.flatMap((session) => session.tasks)).forEach((task) => {
    taskMap.set(task.task_id, task)
  })

  return {
    generatedAt: asString(input.generatedAt || fallbackTimestamp),
    source: asString(input.source || 'htdi'),
    sessions,
    profiles: Array.from(profileMap.values()).sort((left, right) => left.agent_handle.localeCompare(right.agent_handle)),
    tasks: Array.from(taskMap.values()).sort((left, right) => left.task_id.localeCompare(right.task_id)),
  }
}

export const normalizeDiaryResponse = (payload: DiaryResponse): DiaryResponse => {
  const bundle = normalizeDiaryBundle(payload)

  return {
    type: asString(payload.type || 'diary'),
    generatedAt: bundle.generatedAt,
    source: bundle.source,
    repoCount: Number(payload.repoCount || 1),
    totalSessions: bundle.sessions.length,
    repos: asArray<string>(payload.repos).map(String),
    profiles: bundle.profiles,
    tasks: bundle.tasks,
    sessions: bundle.sessions,
  }
}
