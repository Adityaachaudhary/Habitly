import type { Habit, HabitLog, HabitWithStreak } from '../types'
import { localDateString, calculateCompletionRate } from './helpers'

export function lastNDatesDescending(n: number, end = new Date()): string[] {
  const out: string[] = []
  const d = new Date(end.getFullYear(), end.getMonth(), end.getDate())
  for (let i = 0; i < n; i++) {
    out.push(localDateString(d))
    d.setDate(d.getDate() - 1)
  }
  return out
}

export function habitsEffectiveOnDay(habits: Habit[], dateStr: string): Habit[] {
  return habits.filter(h => {
    if (!h.is_active) return false
    const created = h.created_at.slice(0, 10)
    return created <= dateStr
  })
}

/** Daily habits expected on a given day (weekly habits excluded from “perfect day”). */
export function dailyHabitsForPerfectDay(habits: Habit[], dateStr: string): Habit[] {
  return habitsEffectiveOnDay(habits, dateStr).filter(h => h.frequency === 'daily')
}

export function isPerfectDay(dateStr: string, habits: Habit[], logs: HabitLog[]): boolean {
  const daily = dailyHabitsForPerfectDay(habits, dateStr)
  if (daily.length === 0) return false
  const done = new Set<string>()
  for (const l of logs) {
    if (l.log_date === dateStr && l.completed) done.add(l.habit_id)
  }
  return daily.every(h => done.has(h.id))
}

/** Consecutive calendar days (ending on the most recent perfect day) where all daily habits were completed. */
export function currentPerfectDayStreak(habits: Habit[], logs: HabitLog[], today = new Date()): number {
  let d = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  let ds = localDateString(d)
  if (!isPerfectDay(ds, habits, logs)) {
    d.setDate(d.getDate() - 1)
    ds = localDateString(d)
  }
  let streak = 0
  for (let i = 0; i < 400; i++) {
    if (!isPerfectDay(ds, habits, logs)) break
    streak++
    d.setDate(d.getDate() - 1)
    ds = localDateString(d)
  }
  return streak
}

export function completionRateOnDates(habitId: string, logs: HabitLog[], dates: string[]): number {
  if (dates.length === 0) return 0
  let done = 0
  for (const date of dates) {
    if (logs.some(l => l.habit_id === habitId && l.log_date === date && l.completed)) done++
  }
  return calculateCompletionRate(done, dates.length)
}

export interface HabitSevenDayStat {
  name: string
  rate: number
  streak: number
  completedToday: boolean
  category: string
}

export function buildSevenDayHabitStats(habits: HabitWithStreak[], logs: HabitLog[]): HabitSevenDayStat[] {
  const dates = lastNDatesDescending(7)
  return habits.map(h => ({
    name: h.name,
    rate: completionRateOnDates(h.id, logs, dates),
    streak: h.streak?.current_streak ?? 0,
    completedToday: h.completed_today,
    category: h.category,
  }))
}

export function buildOverallSevenDayRate(habits: HabitWithStreak[], logs: HabitLog[]): number {
  if (habits.length === 0) return 0
  const dates = lastNDatesDescending(7)
  let sum = 0
  for (const h of habits) {
    sum += completionRateOnDates(h.id, logs, dates)
  }
  return Math.round(sum / habits.length)
}

/** Per-weekday completion rates over ~28 days for one habit (for AI). */
export function weekdayPatternSummary(habitId: string, logs: HabitLog[], days = 28): string {
  const dates = lastNDatesDescending(days)
  const byWdDone = [0, 0, 0, 0, 0, 0, 0]
  const byWdTotal = [0, 0, 0, 0, 0, 0, 0]
  for (const date of dates) {
    const wd = new Date(`${date}T12:00:00`).getDay()
    byWdTotal[wd]++
    if (logs.some(l => l.habit_id === habitId && l.log_date === date && l.completed)) byWdDone[wd]++
  }
  const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  const parts = labels.map((label, i) => {
    if (byWdTotal[i] === 0) return null
    const pct = Math.round((byWdDone[i] / byWdTotal[i]) * 100)
    return `${label} ${pct}%`
  }).filter(Boolean)
  return parts.length ? parts.join(', ') : 'not enough data'
}

export function buildWeeklyReportStats(habits: HabitWithStreak[], logs: HabitLog[]): {
  habitLines: string
  overallSevenDay: number
  perfectDayStreak: number
} {
  const weekDates = lastNDatesDescending(7)
  const overallSevenDay = buildOverallSevenDayRate(habits, logs)
  const perfectDayStreak = currentPerfectDayStreak(habits, logs)
  const habitLines = habits
    .map(h => {
      const rate = completionRateOnDates(h.id, logs, weekDates)
      const pat = weekdayPatternSummary(h.id, logs, 28)
      return `- ${h.name}: ${rate}% last 7 days, streak ${h.streak?.current_streak ?? 0}d, today ${h.completed_today ? 'done' : 'not done'}; weekday pattern (~4 weeks): ${pat}`
    })
    .join('\n')
  return { habitLines, overallSevenDay, perfectDayStreak }
}

export function buildDailyInsightPayload(habits: HabitWithStreak[], logs: HabitLog[]): string {
  const stats = buildSevenDayHabitStats(habits, logs)
  const overall = buildOverallSevenDayRate(habits, logs)
  const lines = stats
    .map(s => `${s.name}: ${s.rate}% last 7d, streak ${s.streak}d, ${s.completedToday ? 'done today' : 'not today'}`)
    .join('; ')
  return `Overall average completion (last 7 days): ${overall}%. Per habit: ${lines}`
}

export function buildCoachLogSummary(habits: HabitWithStreak[], logs: HabitLog[]): string {
  if (habits.length === 0) return 'No habits yet.'
  const { habitLines, overallSevenDay, perfectDayStreak } = buildWeeklyReportStats(habits, logs)
  return `Last-7-day average completion across habits: ${overallSevenDay}%. Full-day streak (all daily habits done): ${perfectDayStreak} days.\nPer habit:\n${habitLines}`
}
