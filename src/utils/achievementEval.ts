import type { HabitLog, HabitWithStreak } from '../types'
import { currentPerfectDayStreak } from './habitLogStats'

export type UnlockCandidate = {
  dedupe_key: string
  badge_name: string
  badge_type: string
  habit_id: string | null
  habitLabel?: string
}

export function findNewAchievementUnlocks(
  existingDedupeKeys: Set<string>,
  habits: HabitWithStreak[],
  logs: HabitLog[]
): UnlockCandidate[] {
  const out: UnlockCandidate[] = []

  for (const h of habits) {
    const streak = h.streak?.current_streak ?? 0
    const k7 = `HABIT_STREAK_7:${h.id}`
    const k21 = `HABIT_STREAK_21:${h.id}`
    if (streak >= 7 && !existingDedupeKeys.has(k7)) {
      out.push({
        dedupe_key: k7,
        badge_name: 'HABIT_STREAK_7',
        badge_type: 'habit_streak',
        habit_id: h.id,
        habitLabel: h.name,
      })
    }
    if (streak >= 21 && !existingDedupeKeys.has(k21)) {
      out.push({
        dedupe_key: k21,
        badge_name: 'HABIT_STREAK_21',
        badge_type: 'habit_streak',
        habit_id: h.id,
        habitLabel: h.name,
      })
    }
  }

  const perfectStreak = currentPerfectDayStreak(habits, logs)
  if (perfectStreak >= 7 && !existingDedupeKeys.has('PERFECT_DAY_STREAK_7')) {
    out.push({
      dedupe_key: 'PERFECT_DAY_STREAK_7',
      badge_name: 'PERFECT_DAY_STREAK_7',
      badge_type: 'perfect_day',
      habit_id: null,
    })
  }
  if (perfectStreak >= 21 && !existingDedupeKeys.has('PERFECT_DAY_STREAK_21')) {
    out.push({
      dedupe_key: 'PERFECT_DAY_STREAK_21',
      badge_name: 'PERFECT_DAY_STREAK_21',
      badge_type: 'perfect_day',
      habit_id: null,
    })
  }

  return out
}
