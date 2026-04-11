/**
 * HTDI API client for the active diary lane.
 * Required endpoint: GET /diary
 * Optional endpoints: GET /agents, GET/PUT /profiles, GET/PUT /tasks
 */

import type {
  AgentProfile,
  AgentsResponse,
  DiaryBundle,
  DiaryResponse,
  DiarySession,
  DiaryReflection,
  TaskRecord,
} from '../types'
import { normalizeDiaryBundle, normalizeDiaryResponse } from '../utils/diary-normalizers'

const API_BASE = import.meta.env.VITE_HTDI_API_URL || 'http://localhost:3000/api'
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000
const MAX_RETRIES = Number(import.meta.env.VITE_API_MAX_RETRIES) || 3
const DEBUG = import.meta.env.VITE_DEBUG === 'true'

export class HTDIApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message)
    this.name = 'HTDIApiError'
  }
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    })
  } finally {
    clearTimeout(timeoutId)
  }
}

async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  backoff = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) {
      throw error
    }

    if (error instanceof HTDIApiError && error.status) {
      const shouldRetryClientError =
        error.status === 408 ||
        error.status === 429

      if (error.status >= 400 && error.status < 500 && !shouldRetryClientError) {
        throw error
      }
    }

    if (DEBUG) {
      console.warn(`Retrying request (${retries} attempts remaining)...`, error)
    }

    await sleep(backoff)
    return withRetry(fn, retries - 1, backoff * 2)
  }
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
  { optional = false }: { optional?: boolean } = {}
): Promise<T | null> {
  const response = await fetchWithTimeout(`${API_BASE}${path}`, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  })

  if (!response.ok) {
    if (optional && [404, 405, 501].includes(response.status)) {
      return null
    }

    let data: unknown
    try {
      data = await response.json()
    } catch {
      data = await response.text().catch(() => undefined)
    }

    throw new HTDIApiError(
      `Failed request to ${path}: ${response.statusText}`,
      response.status,
      data
    )
  }

  return await response.json() as T
}

export async function fetchDiaryBundle(): Promise<DiaryBundle> {
  return withRetry(async () => {
    if (DEBUG) {
      console.log('[HTDI API] Fetching diary bundle...')
    }

    const data = await requestJson<DiaryResponse>('/diary')

    if (!data || !Array.isArray(data.sessions)) {
      throw new HTDIApiError('Invalid diary response format - missing sessions')
    }

    const normalized = normalizeDiaryBundle(normalizeDiaryResponse(data))

    if (DEBUG) {
      console.log('[HTDI API] Diary bundle fetched:', {
        sessions: normalized.sessions.length,
        profiles: normalized.profiles.length,
        tasks: normalized.tasks.length,
      })
    }

    return normalized
  })
}

export async function fetchDiary(): Promise<DiarySession[]> {
  const bundle = await fetchDiaryBundle()
  return bundle.sessions
}

export async function fetchProfiles(): Promise<AgentProfile[]> {
  return withRetry(async () => {
    if (DEBUG) {
      console.log('[HTDI API] Fetching profiles...')
    }

    const explicitProfiles = await requestJson<AgentProfile[]>('/profiles', {}, { optional: true })

    if (Array.isArray(explicitProfiles)) {
      return normalizeDiaryBundle({
        generatedAt: new Date().toISOString(),
        source: `${API_BASE}/profiles`,
        sessions: [],
        profiles: explicitProfiles,
        tasks: [],
      }).profiles
    }

    return (await fetchDiaryBundle()).profiles
  })
}

export async function saveProfile(agentHandle: string, profile: AgentProfile): Promise<AgentProfile> {
  return withRetry(async () => {
    const saved = await requestJson<AgentProfile>(
      `/profiles/${encodeURIComponent(agentHandle)}`,
      {
        method: 'PUT',
        body: JSON.stringify(profile),
      }
    )

    if (!saved) {
      throw new HTDIApiError(`Profile save failed for ${agentHandle}`)
    }

    return saved
  })
}

export async function fetchTasks(): Promise<TaskRecord[]> {
  return withRetry(async () => {
    const explicitTasks = await requestJson<TaskRecord[]>('/tasks', {}, { optional: true })

    if (Array.isArray(explicitTasks)) {
      return explicitTasks
    }

    return (await fetchDiaryBundle()).tasks
  })
}

export async function saveTask(taskId: string, task: TaskRecord): Promise<TaskRecord> {
  return withRetry(async () => {
    const saved = await requestJson<TaskRecord>(
      `/tasks/${encodeURIComponent(taskId)}`,
      {
        method: 'PUT',
        body: JSON.stringify(task),
      }
    )

    if (!saved) {
      throw new HTDIApiError(`Task save failed for ${taskId}`)
    }

    return saved
  })
}

export async function saveSessionReflection(sessionId: string, reflection: DiaryReflection): Promise<DiaryReflection> {
  return withRetry(async () => {
    const saved = await requestJson<DiaryReflection>(
      `/sessions/${encodeURIComponent(sessionId)}/reflection`,
      {
        method: 'PUT',
        body: JSON.stringify(reflection),
      }
    )

    if (!saved) {
      throw new HTDIApiError(`Reflection save failed for ${sessionId}`)
    }

    return saved
  })
}

export async function fetchAgents(): Promise<AgentsResponse> {
  return withRetry(async () => {
    if (DEBUG) {
      console.log('[HTDI API] Fetching agent registry...')
    }

    const data = await requestJson<AgentsResponse>('/agents', {}, { optional: true })

    return data || { generatedAt: '', houses: [] }
  })
}
