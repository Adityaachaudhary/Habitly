import { type LucideIcon, Heart, Dumbbell, Book, Zap, Brain, DollarSign, Users, Star, Flame, Rocket, Gem, Trophy, Sprout, Target, Sparkles, MapPin, CheckCircle2 } from 'lucide-react'

export type User = {
  id: string
  email: string
  full_name: string | null
  profile_pic_url: string | null
  timezone: string
  is_premium: boolean
  created_at: string
}

export type HabitCategory =
  | 'Health'
  | 'Fitness'
  | 'Learning'
  | 'Productivity'
  | 'Mindfulness'
  | 'Finance'
  | 'Social'
  | 'General'

/** When you usually do this habit (dashboard lanes). */
export type TimeLane = 'morning' | 'afternoon' | 'evening' | 'any'

export const TIME_LANE_ORDER: TimeLane[] = ['morning', 'afternoon', 'evening', 'any']

export const TIME_LANE_LABELS: Record<TimeLane, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  any: 'Anytime',
}

export type Habit = {
  id: string
  user_id: string
  name: string
  description: string | null
  category: HabitCategory
  frequency: 'daily' | 'weekly'
  reminder_time: string | null
  color: string
  is_active: boolean
  created_at: string
  updated_at: string
  /** Rough time-of-day bucket for grouping on the dashboard. */
  time_lane: TimeLane
  /** Short context tag, e.g. “At home”, “Gym”. */
  context_tag: string | null
  /** Number of days for the habit goal (e.g. 7 for week, 28-31 for month). */
  goal_days: number
}

export type HabitLog = {
  id: string
  habit_id: string
  user_id: string
  log_date: string
  completed: boolean
  notes: string | null
  created_at: string
}

export type HabitStreak = {
  id: string
  habit_id: string
  user_id: string
  current_streak: number
  longest_streak: number
  last_completed_date: string | null
  updated_at: string
}

export type Achievement = {
  id: string
  user_id: string
  /** Stable key for deduplication, e.g. HABIT_STREAK_7:uuid or PERFECT_DAY_STREAK_7 */
  dedupe_key: string
  /** Key into BADGE_DEFINITIONS */
  badge_name: string
  badge_type: string
  habit_id: string | null
  unlocked_at: string
}

/** One end-of-week reflection; `week_start_date` is Monday (local) YYYY-MM-DD. */
export type WeekReview = {
  id: string
  user_id: string
  week_start_date: string
  what_worked: string
  what_broke: string
  change_next_week: string
  created_at: string
  updated_at: string
}

export type HabitWithStreak = Habit & {
  streak: HabitStreak | null
  completed_today: boolean
}

export type CategoryInfo = {
  label: HabitCategory
  icon: LucideIcon
  color: string
  bg: string
}

export const CATEGORIES: CategoryInfo[] = [
  { label: 'Health', icon: Heart, color: '#ef4444', bg: '#fef2f2' },
  { label: 'Fitness', icon: Dumbbell, color: '#f97316', bg: '#fff7ed' },
  { label: 'Learning', icon: Book, color: '#3b82f6', bg: '#eff6ff' },
  { label: 'Productivity', icon: Zap, color: '#8b5cf6', bg: '#f5f3ff' },
  { label: 'Mindfulness', icon: Brain, color: '#06b6d4', bg: '#ecfeff' },
  { label: 'Finance', icon: DollarSign, color: 'var(--primary-500)', bg: 'var(--primary-50)' },
  { label: 'Social', icon: Users, color: '#ec4899', bg: '#fdf2f8' },
  { label: 'General', icon: Star, color: '#f59e0b', bg: '#fffbeb' },
]

export const HABIT_COLORS = [
  'var(--primary-500)', '#3b82f6', '#f97316', '#ec4899',
  '#8b5cf6', '#06b6d4', '#f59e0b', '#ef4444',
]

export const BADGE_DEFINITIONS: Record<string, { icon: LucideIcon; label: string; description: string }> = {
  STREAK_7: { icon: Flame, label: 'Week Warrior', description: '7-day streak' },
  STREAK_14: { icon: Zap, label: 'Fortnight Fire', description: '14-day streak' },
  STREAK_30: { icon: Rocket, label: 'Month Master', description: '30-day streak' },
  STREAK_60: { icon: Gem, label: 'Diamond Habit', description: '60-day streak' },
  STREAK_100: { icon: Trophy, label: 'Century Club', description: '100-day streak' },
  FIRST_HABIT: { icon: Sprout, label: 'First Step', description: 'Created first habit' },
  COMPLETION_50: { icon: Target, label: 'Halfway There', description: '50% monthly completion' },
  COMPLETION_90: { icon: Sparkles, label: 'Perfectionist', description: '90% monthly completion' },
  HABIT_STREAK_7: {
    icon: MapPin,
    label: '7-Day Habit',
    description: 'Hit a 7-day streak on a habit — consistency is forming',
  },
  HABIT_STREAK_21: {
    icon: Brain,
    label: '21-Day Habit',
    description: '21-day streak on a habit — often when a behavior starts to feel automatic',
  },
  PERFECT_DAY_STREAK_7: {
    icon: CheckCircle2,
    label: 'Full Day × 7',
    description: 'Completed every daily habit for 7 days in a row',
  },
  PERFECT_DAY_STREAK_21: {
    icon: Star,
    label: 'Full Day × 21',
    description: 'Completed every daily habit for 21 days in a row',
  },
}
