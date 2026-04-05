import type { HabitWithStreak } from '../types'

/** Ensure behavior-design columns exist when reading older local/DB rows. */
const TIME_LANES = new Set(['morning', 'afternoon', 'evening', 'any'])

export function normalizeHabitBehaviorFields<H extends Record<string, unknown>>(h: H): H {
  const lane = h.time_lane as string | undefined
  const time_lane = lane && TIME_LANES.has(lane) ? lane : 'any'
  return {
    ...h,
    stack_after_habit_id: (h.stack_after_habit_id as string | null | undefined) ?? null,
    implementation_cue: (h.implementation_cue as string | null | undefined) ?? null,
    implementation_context: (h.implementation_context as string | null | undefined) ?? null,
    fallback_plan: (h.fallback_plan as string | null | undefined) ?? null,
    time_lane,
    context_tag: (h.context_tag as string | null | undefined)?.trim() || null,
  }
}

/**
 * Human-readable implementation intention for dashboard cards.
 */
export function buildImplementationIntention(
  habit: HabitWithStreak,
  anchorName: string | null
): string | null {
  const name = habit.name.trim()
  if (!name) return null

  if (habit.stack_after_habit_id && anchorName) {
    const base = `After I complete “${anchorName}”, I will “${name}”`
    return habit.implementation_context?.trim()
      ? `${base} (${habit.implementation_context.trim()})`
      : base
  }

  if (habit.implementation_cue?.trim()) {
    const cue = habit.implementation_cue.trim()
    const base = `After ${cue}, I will “${name}”`
    return habit.implementation_context?.trim()
      ? `${base} — ${habit.implementation_context.trim()}`
      : base
  }

  if (habit.implementation_context?.trim()) {
    return `“${name}” — ${habit.implementation_context.trim()}`
  }

  return null
}

/** Show minimum-version coach when streak is at zero but they have history, or missed yesterday on a daily habit. */
export function shouldShowFallbackCoach(habit: HabitWithStreak): boolean {
  const plan = habit.fallback_plan?.trim()
  if (!plan) return false

  const current = habit.streak?.current_streak ?? 0
  const longest = habit.streak?.longest_streak ?? 0
  const last = habit.streak?.last_completed_date

  if (current > 0) return false
  if (longest > 0) return true
  if (last) {
    const lastDay = new Date(last + 'T12:00:00')
    const today = new Date()
    today.setHours(12, 0, 0, 0)
    const diff = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24))
    if (diff >= 2) return true
  }
  return false
}

/**
 * Order habits so stacked habits appear after their anchor when possible.
 */
export function sortHabitsByStackOrder(habits: HabitWithStreak[]): HabitWithStreak[] {
  if (habits.length <= 1) return habits
  const byId = new Map(habits.map(h => [h.id, h]))
  const pool = [...habits]
  const ordered: HabitWithStreak[] = []
  const origIndex = new Map(habits.map((h, i) => [h.id, i]))

  while (pool.length) {
    const unblockedIdx = pool.findIndex(h => {
      const sid = h.stack_after_habit_id
      if (!sid) return true
      if (!byId.has(sid)) return true
      return ordered.some(o => o.id === sid)
    })
    if (unblockedIdx === -1) {
      pool.sort((a, b) => (origIndex.get(a.id) ?? 0) - (origIndex.get(b.id) ?? 0))
      ordered.push(...pool)
      break
    }
    const [next] = pool.splice(unblockedIdx, 1)
    ordered.push(next)
  }
  return ordered
}
