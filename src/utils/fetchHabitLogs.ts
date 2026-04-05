import { supabase } from './supabase'
import type { HabitLog } from '../types'
import { localDateString } from './helpers'

export async function fetchHabitLogsForUser(
  userId: string,
  daysBack: number,
  isMock: boolean
): Promise<HabitLog[]> {
  const start = new Date()
  start.setDate(start.getDate() - daysBack)
  const startStr = localDateString(start)
  if (isMock) {
    const raw = JSON.parse(localStorage.getItem('habitly_logs') || '[]') as HabitLog[]
    return raw.filter(l => l.user_id === userId && l.log_date >= startStr)
  }
  const { data, error } = await supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .gte('log_date', startStr)
  if (error) {
    console.warn('fetchHabitLogsForUser', error)
    return []
  }
  return (data as HabitLog[]) || []
}
