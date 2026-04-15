import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../utils/supabase'
import type { Achievement } from '../types'
import { useAuth } from './AuthContext'
import { useHabits } from './HabitsContext'
import { fetchHabitLogsForUser } from '../utils/fetchHabitLogs'
import { findNewAchievementUnlocks } from '../utils/achievementEval'

const STORAGE = 'habitly_user_achievements'

export type BadgeToastItem = {
  badge_name: string
  habitLabel?: string
}

interface AchievementsContextType {
  achievements: Achievement[]
  loading: boolean
  toastQueue: BadgeToastItem[]
  dismissToast: () => void
}

const AchievementsContext = createContext<AchievementsContextType>({} as AchievementsContextType)

function loadMockAchievements(userId: string): Achievement[] {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE) || '[]') as Achievement[]
    return raw.filter(a => a.user_id === userId).sort((a, b) => b.unlocked_at.localeCompare(a.unlocked_at))
  } catch {
    return []
  }
}

async function loadAchievements(userId: string, isMock: boolean): Promise<Achievement[]> {
  if (isMock) return loadMockAchievements(userId)
  const { data, error } = await supabase
    .from('user_achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false })
  if (error) {
    return []
  }
  return (data as Achievement[]) || []
}

async function persistUnlock(
  userId: string,
  unlock: {
    dedupe_key: string
    badge_name: string
    badge_type: string
    habit_id: string | null
  },
  isMock: boolean
): Promise<void> {
  const now = new Date().toISOString()
  if (isMock) {
    const all = JSON.parse(localStorage.getItem(STORAGE) || '[]') as Achievement[]
    if (all.some(a => a.user_id === userId && a.dedupe_key === unlock.dedupe_key)) return
    all.push({
      id: Math.random().toString(36).slice(2, 12),
      user_id: userId,
      ...unlock,
      unlocked_at: now,
    })
    localStorage.setItem(STORAGE, JSON.stringify(all))
    return
  }
  const { error } = await supabase.from('user_achievements').insert({
    user_id: userId,
    dedupe_key: unlock.dedupe_key,
    badge_name: unlock.badge_name,
    badge_type: unlock.badge_type,
    habit_id: unlock.habit_id,
  })
  if (error) return
}

export function AchievementsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const { habits, loading: habitsLoading, todayLogs } = useHabits()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [toastQueue, setToastQueue] = useState<BadgeToastItem[]>([])

  const isMock =
    import.meta.env.VITE_SUPABASE_URL === undefined ||
    import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

  const habitsKey = useMemo(
    () =>
      habits
        .map(
          h =>
            `${h.id}:${h.streak?.current_streak ?? 0}:${h.completed_today ? 1 : 0}:${h.streak?.longest_streak ?? 0}`
        )
        .join('|'),
    [habits]
  )

  const dismissToast = useCallback(() => {
    setToastQueue(q => q.slice(1))
  }, [])

  useEffect(() => {
    if (!user) {
      setAchievements([])
      setLoading(false)
      return
    }
    if (habitsLoading) {
      setLoading(true)
      return
    }

    let cancelled = false
    setLoading(true)
    ;(async () => {
      const logs = await fetchHabitLogsForUser(user.id, 120, isMock)
      if (cancelled) return
      const existing = await loadAchievements(user.id, isMock)
      if (cancelled) return
      setAchievements(existing)

      const keys = new Set(existing.map(r => r.dedupe_key))
      const candidates = findNewAchievementUnlocks(keys, habits, logs)
      for (const c of candidates) {
        await persistUnlock(user.id, c, isMock)
        if (!cancelled) {
          setToastQueue(q => [...q, { badge_name: c.badge_name, habitLabel: c.habitLabel }])
        }
      }
      if (candidates.length && !cancelled) {
        const next = await loadAchievements(user.id, isMock)
        if (!cancelled) setAchievements(next)
      }
      if (!cancelled) setLoading(false)
    })()

    return () => {
      cancelled = true
    }
  }, [user, habitsLoading, habitsKey, todayLogs.length, isMock])

  return (
    <AchievementsContext.Provider
      value={{ achievements, loading, toastQueue, dismissToast }}
    >
      {children}
    </AchievementsContext.Provider>
  )
}

export function useAchievements() {
  return useContext(AchievementsContext)
}
