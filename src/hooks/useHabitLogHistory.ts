import { useCallback, useEffect, useState } from 'react'
import type { HabitLog } from '../types'
import { fetchHabitLogsForUser } from '../utils/fetchHabitLogs'

/** Pass `syncKey` (e.g. habit completion fingerprint) to refetch logs after check-ins. */
export function useHabitLogHistory(userId: string | undefined, daysBack = 40, syncKey?: string) {
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  const isMock =
    import.meta.env.VITE_SUPABASE_URL === undefined ||
    import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

  const refresh = useCallback(async () => {
    if (!userId) {
      setLogs([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const data = await fetchHabitLogsForUser(userId, daysBack, isMock)
      setLogs(data)
    } catch {
      setLogs([])
    } finally {
      setLoading(false)
    }
  }, [userId, daysBack, isMock])

  useEffect(() => {
    refresh()
  }, [refresh, syncKey])

  return { logs, loading, refresh }
}
