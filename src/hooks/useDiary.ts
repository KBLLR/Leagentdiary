/**
 * React hook for fetching and managing diary data from HTDI
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchDiaryBundle } from '../api'
import type { DiarySession, TaskRecord } from '../types'

const DEFAULT_POLL_INTERVAL = Number(import.meta.env.VITE_POLL_INTERVAL) || 30000
const DEBUG = import.meta.env.VITE_DEBUG === 'true'

interface UseDiaryOptions {
  pollInterval?: number
  autoFetch?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: DiarySession[]) => void
}

interface UseDiaryReturn {
  data: DiarySession[]
  tasks: TaskRecord[]
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
  isStale: boolean
}

/**
 * Hook for managing diary data with automatic polling
 */
export function useDiary(options: UseDiaryOptions = {}): UseDiaryReturn {
  const {
    pollInterval = DEFAULT_POLL_INTERVAL,
    autoFetch = true,
    onError,
    onSuccess,
  } = options

  const [data, setData] = useState<DiarySession[]>([])
  const [tasks, setTasks] = useState<TaskRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [isStale, setIsStale] = useState(false)

  const pollIntervalRef = useRef<number | null>(null)
  const isMountedRef = useRef(true)

  const refresh = useCallback(async () => {
    try {
      if (DEBUG) {
        console.log('[useDiary] Fetching diary data...')
      }

      setLoading(true)
      setIsStale(false)

      const bundle = await fetchDiaryBundle()

      // Only update state if component is still mounted
      if (!isMountedRef.current) return

      setData(bundle.sessions)
      setTasks(bundle.tasks)
      setError(null)

      if (onSuccess) {
        onSuccess(bundle.sessions)
      }

      if (DEBUG) {
        console.log('[useDiary] Data fetched:', bundle.sessions.length, 'entries')
      }
    } catch (err) {
      if (!isMountedRef.current) return

      const error = err instanceof Error ? err : new Error('Failed to fetch diary')
      setError(error)

      if (onError) {
        onError(error)
      }

      if (DEBUG) {
        console.error('[useDiary] Fetch error:', error)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [onSuccess, onError])

  // Initial fetch and polling setup
  useEffect(() => {
    if (!autoFetch) return

    // Initial fetch
    refresh()

    // Set up polling
    if (pollInterval > 0) {
      pollIntervalRef.current = window.setInterval(() => {
        setIsStale(true)
        refresh()
      }, pollInterval)

      if (DEBUG) {
        console.log('[useDiary] Polling enabled:', pollInterval, 'ms')
      }
    }

    // Cleanup
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
        pollIntervalRef.current = null
      }
    }
  }, [autoFetch, pollInterval, refresh])

  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    data,
    tasks,
    loading,
    error,
    refresh,
    isStale,
  }
}
