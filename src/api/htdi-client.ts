/**
 * HTDI Agentic Lab API Client
 * Handles all communication with the HTDI backend
 */

import type { DiaryEntry } from '../types'

const API_BASE = import.meta.env.VITE_HTDI_API_URL || 'http://localhost:3000/api'
const API_TIMEOUT = Number(import.meta.env.VITE_API_TIMEOUT) || 10000
const MAX_RETRIES = Number(import.meta.env.VITE_API_MAX_RETRIES) || 3
const DEBUG = import.meta.env.VITE_DEBUG === 'true'

/**
 * Custom error class for API errors
 */
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

/**
 * Sleep utility for retry backoff
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url: string, options: RequestInit = {}): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    })
    return response
  } finally {
    clearTimeout(timeoutId)
  }
}

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  backoff = 1000
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries === 0) throw error

    // Don't retry on client errors (4xx) except 408 (timeout) and 429 (rate limit)
    if (error instanceof HTDIApiError && error.status) {
      if (error.status >= 400 && error.status < 500 && error.status !== 408 && error.status !== 429) {
        throw error
      }
    }

    if (DEBUG) {
      console.warn(`Retrying request (${retries} attempts remaining)...`, error)
    }

    await sleep(backoff)
    return withRetry(fn, retries - 1, backoff * 2) // exponential backoff
  }
}

/**
 * Fetch diary entries from HTDI
 */
export async function fetchDiary(): Promise<DiaryEntry[]> {
  return withRetry(async () => {
    if (DEBUG) {
      console.log('[HTDI API] Fetching diary entries...')
    }

    const response = await fetchWithTimeout(`${API_BASE}/diary`)

    if (!response.ok) {
      throw new HTDIApiError(
        `Failed to fetch diary: ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()

    if (DEBUG) {
      console.log('[HTDI API] Diary entries fetched:', data)
    }

    // Handle different response formats
    if (Array.isArray(data)) {
      return data as DiaryEntry[]
    } else if (data.entries && Array.isArray(data.entries)) {
      return data.entries as DiaryEntry[]
    } else {
      throw new HTDIApiError('Invalid diary response format', response.status, data)
    }
  })
}

/**
 * Trigger diary re-parsing
 */
export async function triggerParse(): Promise<void> {
  return withRetry(async () => {
    if (DEBUG) {
      console.log('[HTDI API] Triggering diary parse...')
    }

    const response = await fetchWithTimeout(`${API_BASE}/automation/parse`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new HTDIApiError(
        `Parse failed: ${response.statusText}`,
        response.status
      )
    }

    if (DEBUG) {
      console.log('[HTDI API] Diary parse triggered successfully')
    }
  })
}

/**
 * Run a command on the HTDI backend
 */
export async function runCommand(command: string): Promise<string> {
  return withRetry(async () => {
    if (DEBUG) {
      console.log('[HTDI API] Running command:', command)
    }

    const response = await fetchWithTimeout(`${API_BASE}/run-command`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command }),
    })

    if (!response.ok) {
      throw new HTDIApiError(
        `Command failed: ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()

    if (DEBUG) {
      console.log('[HTDI API] Command output:', data)
    }

    return data.output || data.result || String(data)
  })
}

/**
 * Launch autopilot workflow
 */
export async function launchAutopilot(): Promise<{ taskId: string; status: string }> {
  return withRetry(async () => {
    if (DEBUG) {
      console.log('[HTDI API] Launching autopilot...')
    }

    const response = await fetchWithTimeout(`${API_BASE}/automation/autopilot`, {
      method: 'POST',
    })

    if (!response.ok) {
      throw new HTDIApiError(
        `Autopilot launch failed: ${response.statusText}`,
        response.status
      )
    }

    const data = await response.json()

    if (DEBUG) {
      console.log('[HTDI API] Autopilot launched:', data)
    }

    return data
  })
}

/**
 * Health check
 */
export async function healthCheck(): Promise<boolean> {
  try {
    const response = await fetchWithTimeout(`${API_BASE}/health`, {
      method: 'GET',
    })
    return response.ok
  } catch {
    return false
  }
}
