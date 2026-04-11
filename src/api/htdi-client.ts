/**
 * HTDI API client for the active diary lane.
 * Required endpoint: GET /diary
 * Optional endpoint: GET /agents
 */

import type { DiaryResponse, DiarySession, AgentsResponse } from '../types'

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

export async function fetchDiary(): Promise<DiarySession[]> {
  return withRetry(async () => {
    if (DEBUG) {
      console.log('[HTDI API] Fetching diary sessions...')
    }

    const response = await fetchWithTimeout(`${API_BASE}/diary`)

    if (!response.ok) {
      throw new HTDIApiError(
        `Failed to fetch diary: ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json() as DiaryResponse

    if (!Array.isArray(data.sessions)) {
      throw new HTDIApiError('Invalid diary response format - missing sessions', response.status, data)
    }

    const validSessions = data.sessions.filter((session) => (
      session.sessionId !== '<ISO_TIMESTAMP>' &&
      session.handIn !== null &&
      session.handOff !== null
    )) as DiarySession[]

    if (DEBUG) {
      console.log('[HTDI API] Diary sessions fetched:', validSessions.length, 'valid sessions')
    }

    return validSessions
  })
}

export async function fetchAgents(): Promise<AgentsResponse> {
  return withRetry(async () => {
    if (DEBUG) {
      console.log('[HTDI API] Fetching agent registry...')
    }

    const response = await fetchWithTimeout(`${API_BASE}/agents`)

    if (!response.ok) {
      throw new HTDIApiError(
        `Failed to fetch agents: ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json() as AgentsResponse

    if (DEBUG) {
      console.log('[HTDI API] Agents fetched:', data.houses?.length || 0, 'houses')
    }

    return data
  })
}
