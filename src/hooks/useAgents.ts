/**
 * React hook for fetching and managing agent registry data from HTDI
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchAgents } from '../api'
import type { AgentsResponse } from '../types'

const DEBUG = import.meta.env.VITE_DEBUG === 'true'

interface UseAgentsOptions {
  autoFetch?: boolean
  onError?: (error: Error) => void
  onSuccess?: (data: AgentsResponse) => void
}

interface UseAgentsReturn {
  data: AgentsResponse | null
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

/**
 * Hook for managing agent registry data
 * Unlike useDiary, this doesn't poll since agent registry changes infrequently
 */
export function useAgents(options: UseAgentsOptions = {}): UseAgentsReturn {
  const {
    autoFetch = true,
    onError,
    onSuccess,
  } = options

  const [data, setData] = useState<AgentsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const isMountedRef = useRef(true)

  const refresh = useCallback(async () => {
    try {
      if (DEBUG) {
        console.log('[useAgents] Fetching agent registry...')
      }

      setLoading(true)

      const agents = await fetchAgents()

      // Only update state if component is still mounted
      if (!isMountedRef.current) return

      setData(agents)
      setError(null)

      if (onSuccess) {
        onSuccess(agents)
      }

      if (DEBUG) {
        console.log('[useAgents] Agent registry fetched:', agents.houses?.length || 0, 'houses')
      }
    } catch (err) {
      if (!isMountedRef.current) return

      const error = err instanceof Error ? err : new Error('Failed to fetch agents')
      setError(error)

      if (onError) {
        onError(error)
      }

      if (DEBUG) {
        console.error('[useAgents] Fetch error:', error)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [onSuccess, onError])

  // Initial fetch
  useEffect(() => {
    if (!autoFetch) return

    refresh()
  }, [autoFetch, refresh])

  // Track component mount state
  useEffect(() => {
    isMountedRef.current = true
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    data,
    loading,
    error,
    refresh,
  }
}
