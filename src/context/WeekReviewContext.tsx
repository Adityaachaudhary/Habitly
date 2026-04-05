import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../utils/supabase'
import type { WeekReview } from '../types'
import { useAuth } from './AuthContext'

export type WeekReviewInput = {
  what_worked: string
  what_broke: string
  change_next_week: string
}

interface WeekReviewContextType {
  reviews: WeekReview[]
  loading: boolean
  refreshReviews: () => Promise<void>
  saveReview: (weekStartDate: string, input: WeekReviewInput) => Promise<void>
  getReviewForWeek: (weekStartDate: string) => WeekReview | undefined
}

const WeekReviewContext = createContext<WeekReviewContextType>({} as WeekReviewContextType)

const STORAGE_KEY = 'habitly_week_reviews'

export function WeekReviewProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [reviews, setReviews] = useState<WeekReview[]>([])
  const [loading, setLoading] = useState(true)

  const isMock =
    import.meta.env.VITE_SUPABASE_URL === undefined ||
    import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

  const getLocal = (): WeekReview[] => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
  const saveLocal = (rows: WeekReview[]) => localStorage.setItem(STORAGE_KEY, JSON.stringify(rows))

  const refreshReviews = useCallback(async () => {
    if (!user) {
      setReviews([])
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      if (isMock) {
        const rows = getLocal().filter(r => r.user_id === user.id)
        rows.sort((a, b) => b.week_start_date.localeCompare(a.week_start_date))
        setReviews(rows)
      } else {
        const { data, error } = await supabase
          .from('week_reviews')
          .select('*')
          .eq('user_id', user.id)
          .order('week_start_date', { ascending: false })
          .limit(52)
        if (error) throw error
        setReviews((data as WeekReview[]) || [])
      }
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [user, isMock])

  useEffect(() => {
    refreshReviews()
  }, [refreshReviews])

  const saveReview = useCallback(
    async (weekStartDate: string, input: WeekReviewInput) => {
      if (!user) return
      const now = new Date().toISOString()
      const trim = (s: string) => s.trim()
      const payload = {
        what_worked: trim(input.what_worked),
        what_broke: trim(input.what_broke),
        change_next_week: trim(input.change_next_week),
      }
      if (!payload.what_worked || !payload.what_broke || !payload.change_next_week) {
        throw new Error('All three reflections are required.')
      }

      if (isMock) {
        const all = getLocal()
        const idx = all.findIndex(r => r.user_id === user.id && r.week_start_date === weekStartDate)
        if (idx >= 0) {
          all[idx] = {
            ...all[idx],
            ...payload,
            updated_at: now,
          }
        } else {
          all.push({
            id: Math.random().toString(36).slice(2, 12),
            user_id: user.id,
            week_start_date: weekStartDate,
            ...payload,
            created_at: now,
            updated_at: now,
          })
        }
        saveLocal(all)
      } else {
        const { error } = await supabase.from('week_reviews').upsert(
          {
            user_id: user.id,
            week_start_date: weekStartDate,
            ...payload,
            updated_at: now,
          },
          { onConflict: 'user_id,week_start_date' }
        )
        if (error) throw error
      }
      await refreshReviews()
    },
    [user, isMock, refreshReviews]
  )

  const getReviewForWeek = useCallback(
    (weekStartDate: string) => reviews.find(r => r.week_start_date === weekStartDate),
    [reviews]
  )

  return (
    <WeekReviewContext.Provider
      value={{ reviews, loading, refreshReviews, saveReview, getReviewForWeek }}
    >
      {children}
    </WeekReviewContext.Provider>
  )
}

export function useWeekReview() {
  return useContext(WeekReviewContext)
}
