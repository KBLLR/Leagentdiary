import { useState, useEffect, useCallback, useRef } from 'react'
import { fetchProfiles, saveProfile } from '../api'
import type { AgentProfile } from '../types'

const DEBUG = import.meta.env.VITE_DEBUG === 'true'

interface UseProfilesReturn {
  data: AgentProfile[]
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
  persistProfile: (profile: AgentProfile) => Promise<AgentProfile>
}

export function useProfiles(): UseProfilesReturn {
  const [data, setData] = useState<AgentProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const isMountedRef = useRef(true)

  const refresh = useCallback(async () => {
    try {
      setLoading(true)
      const profiles = await fetchProfiles()

      if (!isMountedRef.current) {
        return
      }

      setData(profiles)
      setError(null)
    } catch (err) {
      if (!isMountedRef.current) {
        return
      }

      const nextError = err instanceof Error ? err : new Error('Failed to fetch profiles')
      setError(nextError)

      if (DEBUG) {
        console.error('[useProfiles] Fetch error:', nextError)
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false)
      }
    }
  }, [])

  const persistProfile = useCallback(async (profile: AgentProfile) => {
    const saved = await saveProfile(profile.agent_handle, profile)

    if (isMountedRef.current) {
      setData((current) => {
        const next = current.filter((entry) => entry.agent_handle !== saved.agent_handle)
        next.push(saved)
        next.sort((left, right) => left.agent_handle.localeCompare(right.agent_handle))
        return next
      })
    }

    return saved
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

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
    persistProfile,
  }
}
