import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../utils/supabase'
import type { Habit, HabitLog, HabitStreak, HabitWithStreak } from '../types'
import { getTodayString } from '../utils/helpers'
import { normalizeHabitBehaviorFields } from '../utils/behaviorDesign'
import { useAuth } from './AuthContext'

interface HabitsContextType {
  habits: HabitWithStreak[]
  loading: boolean
  todayLogs: HabitLog[]
  createHabit: (habit: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateHabit: (id: string, updates: Partial<Habit>) => Promise<void>
  deleteHabit: (id: string) => Promise<void>
  toggleHabit: (habitId: string) => Promise<void>
  refreshHabits: () => Promise<void>
}

const HabitsContext = createContext<HabitsContextType>({} as HabitsContextType)

export function HabitsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [habits, setHabits] = useState<HabitWithStreak[]>([])
  const [todayLogs, setTodayLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)

  const isMock = import.meta.env.VITE_SUPABASE_URL === undefined || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

  // Storage Keys
  const STORAGE_HABITS = 'habitly_habits'
  const STORAGE_LOGS = 'habitly_logs'
  const STORAGE_STREAKS = 'habitly_streaks'

  // Local Storage Helpers
  const getLocal = <T,>(key: string): T[] => JSON.parse(localStorage.getItem(key) || '[]')
  const saveLocal = (key: string, data: any) => localStorage.setItem(key, JSON.stringify(data))

  const refreshHabits = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const today = getTodayString()

      let habitsData: Habit[] = []
      let logsData: HabitLog[] = []
      let streaksData: HabitStreak[] = []

      if (isMock) {
        habitsData = getLocal<Habit>(STORAGE_HABITS)
          .map((row: Habit) => normalizeHabitBehaviorFields(row as unknown as Record<string, unknown>) as Habit)
          .filter(h => h.user_id === user.id && h.is_active)
        logsData = getLocal<HabitLog>(STORAGE_LOGS).filter(l => l.user_id === user.id && l.log_date === today)
        streaksData = getLocal<HabitStreak>(STORAGE_STREAKS).filter(s => s.user_id === user.id)
      } else {
        // Fetch habits
        const { data: hData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .order('created_at', { ascending: true })

        if (habitsError) throw habitsError
        habitsData = (hData || []).map((row: Habit) => normalizeHabitBehaviorFields(row) as Habit)

        // Fetch today's logs
        const { data: lData, error: logsError } = await supabase
          .from('habit_logs')
          .select('*')
          .eq('user_id', user.id)
          .eq('log_date', today)

        if (logsError) throw logsError
        logsData = lData || []

        // Fetch streaks
        const { data: sData, error: streaksError } = await supabase
          .from('habit_streaks')
          .select('*')
          .eq('user_id', user.id)

        if (streaksError) throw streaksError
        streaksData = sData || []
      }

      const logsMap = new Map((logsData || []).map((l: HabitLog) => [l.habit_id, l]))
      const streaksMap = new Map((streaksData || []).map((s: HabitStreak) => [s.habit_id, s]))

      const enriched: HabitWithStreak[] = (habitsData || []).map((h: Habit) => ({
        ...h,
        streak: streaksMap.get(h.id) || null,
        completed_today: logsMap.get(h.id)?.completed || false,
      }))

      setHabits(enriched)
      setTodayLogs(logsData || [])
    } catch (err) {
      console.warn('Supabase fetch failed, likely missing keys:', err)
      setHabits([])
      setTodayLogs([])
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    if (user) refreshHabits()
    else { setHabits([]); setLoading(false) }
  }, [user, refreshHabits])

  async function createHabit(habitData: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (!user) return
    try {
      if (isMock) {
        const newHabit: Habit = {
          ...habitData,
          id: Math.random().toString(36).substr(2, 9),
          user_id: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
        const habits = getLocal<Habit>(STORAGE_HABITS)
        saveLocal(STORAGE_HABITS, [...habits, newHabit])

        // Init streak row
        const streaks = getLocal<HabitStreak>(STORAGE_STREAKS)
        saveLocal(STORAGE_STREAKS, [...streaks, {
          id: Math.random().toString(36).substr(2, 9),
          habit_id: newHabit.id,
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
          last_completed_date: null,
          updated_at: new Date().toISOString(),
        }])
      } else {
        const { data, error } = await supabase
          .from('habits')
          .insert({ ...habitData, user_id: user.id })
          .select()
          .single()
        if (error) throw error
        // Init streak row
        await supabase.from('habit_streaks').insert({
          habit_id: data.id,
          user_id: user.id,
          current_streak: 0,
          longest_streak: 0,
        })
      }
      await refreshHabits()
    } catch (err) {
      console.error('Failed to create habit:', err)
      throw err
    }
  }

  async function updateHabit(id: string, updates: Partial<Habit>) {
    try {
      if (isMock) {
        const habits = getLocal<Habit>(STORAGE_HABITS)
        const updated = habits.map(h => h.id === id ? { ...h, ...updates, updated_at: new Date().toISOString() } : h)
        saveLocal(STORAGE_HABITS, updated)
      } else {
        const { error } = await supabase.from('habits').update(updates).eq('id', id)
        if (error) throw error
      }
      await refreshHabits()
    } catch (err) {
      console.error('Failed to update habit:', err)
      throw err
    }
  }

  async function deleteHabit(id: string) {
    try {
      if (isMock) {
        const habits = getLocal<Habit>(STORAGE_HABITS)
        const cleared = habits
          .filter(h => h.id !== id)
          .map(h =>
            h.stack_after_habit_id === id ? { ...h, stack_after_habit_id: null as string | null } : h
          )
        saveLocal(STORAGE_HABITS, cleared)
        // Cleanup logs and streaks
        const logs = getLocal<HabitLog>(STORAGE_LOGS)
        saveLocal(STORAGE_LOGS, logs.filter(l => l.habit_id !== id))
        const streaks = getLocal<HabitStreak>(STORAGE_STREAKS)
        saveLocal(STORAGE_STREAKS, streaks.filter(s => s.habit_id !== id))
      } else {
        await supabase.from('habits').update({ stack_after_habit_id: null }).eq('stack_after_habit_id', id)
        const { error } = await supabase.from('habits').delete().eq('id', id)
        if (error) throw error
      }
      await refreshHabits()
    } catch (err) {
      console.error('Failed to delete habit:', err)
      throw err
    }
  }

  async function toggleHabit(habitId: string) {
    if (!user) return
    try {
      const today = getTodayString()
      const existing = todayLogs.find(l => l.habit_id === habitId)
      const newCompleted = existing ? !existing.completed : true

      if (isMock) {
        const logs = getLocal<HabitLog>(STORAGE_LOGS)
        if (existing) {
          const updated = logs.map(l => l.id === existing.id ? { ...l, completed: newCompleted } : l)
          saveLocal(STORAGE_LOGS, updated)
        } else {
          saveLocal(STORAGE_LOGS, [...logs, {
            id: Math.random().toString(36).substr(2, 9),
            habit_id: habitId,
            user_id: user.id,
            log_date: today,
            completed: true,
            notes: null,
            created_at: new Date().toISOString()
          }])
        }
      } else {
        if (existing) {
          await supabase.from('habit_logs').update({ completed: newCompleted }).eq('id', existing.id)
        } else {
          await supabase.from('habit_logs').insert({
            habit_id: habitId,
            user_id: user.id,
            log_date: today,
            completed: true,
          })
        }
      }

      // Recalculate streak
      await recalcStreak(habitId)
      await refreshHabits()
    } catch (err) {
      console.error('Failed to toggle habit:', err)
    }
  }

  async function recalcStreak(habitId: string) {
    if (!user) return
    try {
      let logs: { log_date: string; completed: boolean }[] = []

      if (isMock) {
        logs = getLocal<HabitLog>(STORAGE_LOGS)
          .filter(l => l.habit_id === habitId)
          .sort((a, b) => b.log_date.localeCompare(a.log_date))
      } else {
        const { data } = await supabase
          .from('habit_logs')
          .select('log_date, completed')
          .eq('habit_id', habitId)
          .order('log_date', { ascending: false })
        logs = data || []
      }

      if (!logs) return

      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0
      let lastCompleted: string | null = null

      // Current streak: count consecutive completed from today backwards
      const today = new Date()
      for (let i = 0; i < logs.length; i++) {
        const logDate = new Date(logs[i].log_date)
        const diffDays = Math.floor((today.getTime() - logDate.getTime()) / (1000 * 60 * 60 * 24))
        if (logs[i].completed && diffDays <= i + 1) { // Allowing for today or yesterday
          currentStreak++
          if (!lastCompleted) lastCompleted = logs[i].log_date
        } else if (diffDays > i + 1) {
          break
        }
      }

      // Longest streak
      const sortedLogs = [...logs].sort((a, b) => a.log_date.localeCompare(b.log_date))
      for (const log of sortedLogs) {
        if (log.completed) {
          tempStreak++
          longestStreak = Math.max(longestStreak, tempStreak)
        } else {
          tempStreak = 0
        }
      }

      if (isMock) {
        const streaks = getLocal<HabitStreak>(STORAGE_STREAKS)
        const existingIdx = streaks.findIndex(s => s.habit_id === habitId)
        const newStreak = {
          habit_id: habitId,
          user_id: user.id,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_completed_date: lastCompleted,
          updated_at: new Date().toISOString(),
        }
        if (existingIdx > -1) {
          streaks[existingIdx] = { ...streaks[existingIdx], ...newStreak }
          saveLocal(STORAGE_STREAKS, streaks)
        } else {
          saveLocal(STORAGE_STREAKS, [...streaks, { ...newStreak, id: Math.random().toString(36).substr(2, 9) }])
        }
      } else {
        await supabase.from('habit_streaks').upsert({
          habit_id: habitId,
          user_id: user.id,
          current_streak: currentStreak,
          longest_streak: longestStreak,
          last_completed_date: lastCompleted,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'habit_id' })
      }
    } catch (err) {
      console.error('Failed to recalc streak:', err)
    }
  }

  return (
    <HabitsContext.Provider value={{ habits, loading, todayLogs, createHabit, updateHabit, deleteHabit, toggleHabit, refreshHabits }}>
      {children}
    </HabitsContext.Provider>
  )
}

export const useHabits = () => useContext(HabitsContext)
