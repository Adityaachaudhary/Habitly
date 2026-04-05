import { useState } from 'react'
import { MoreVertical, Pencil, Trash2, Check } from 'lucide-react'
import type { HabitWithStreak } from '../types'
import { cn } from '../utils/helpers'
import { buildImplementationIntention, shouldShowFallbackCoach } from '../utils/behaviorDesign'

interface HabitCardProps {
  habit: HabitWithStreak
  /** Resolve stacked habit name; omit if unknown. */
  anchorHabitName?: string | null
  onToggle: (id: string) => Promise<void>
  onEdit: (habit: HabitWithStreak) => void
  onDelete: (id: string) => Promise<void>
}

export default function HabitCard({ habit, anchorHabitName, onToggle, onEdit, onDelete }: HabitCardProps) {
  const [toggling, setToggling] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [justChecked, setJustChecked] = useState(false)

  const streak = habit.streak?.current_streak || 0
  const longest = habit.streak?.longest_streak || 0
  const streakProgress = Math.min((streak / 30) * 100, 100)

  const anchorLabel =
    habit.stack_after_habit_id
      ? (anchorHabitName?.trim() || 'the habit I stack after')
      : null
  const intention = buildImplementationIntention(habit, anchorLabel)
  const showFallback = shouldShowFallbackCoach(habit) && !habit.completed_today

  async function handleToggle() {
    if (toggling) return
    setToggling(true)
    if (!habit.completed_today) setJustChecked(true)
    await onToggle(habit.id)
    setToggling(false)
    setTimeout(() => setJustChecked(false), 800)
  }

  return (
    <div
      className={cn(
        'card p-6 relative transition-all duration-300 animate-slide-up group overflow-hidden',
        habit.completed_today ? 'opacity-80 scale-[0.98]' : 'hover:scale-[1.02] hover:shadow-xl'
      )}
      style={{ borderLeft: `4px solid ${habit.color}`, background: habit.completed_today ? 'rgba(0,0,0,0.02)' : 'var(--card)' }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6 gap-3">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Check button */}
          <button
            onClick={handleToggle}
            disabled={toggling}
            className={cn('habit-check w-10 h-10 border-2 rounded-2xl flex-shrink-0 transition-all active:scale-90', habit.completed_today && 'checked')}
            style={habit.completed_today ? { background: habit.color, borderColor: habit.color } : { borderColor: 'var(--border)' }}
          >
            {habit.completed_today ? (
              <Check size={20} className={cn('text-white', justChecked && 'animate-check-pop')} strokeWidth={4} />
            ) : (
              <span className="w-2 h-2 rounded-full opacity-20" style={{ background: habit.color }} />
            )}
          </button>

          {/* Title + category */}
          <div className="flex-1 min-w-0 pt-0.5">
            <h3
              className={cn(
                'font-display font-bold text-lg leading-tight transition-all',
                habit.completed_today ? 'line-through opacity-40' : 'text-text'
              )}
            >
              {habit.name}
            </h3>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider" style={{ background: habit.color + '15', color: habit.color }}>
                {habit.category}
              </span>
              {habit.context_tag?.trim() && (
                <span
                  className="text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide"
                  style={{ background: 'var(--border)', color: 'var(--muted)' }}
                >
                  {habit.context_tag.trim()}
                </span>
              )}
            </div>
            {intention && (
              <p
                className="text-xs mt-2.5 leading-relaxed rounded-xl px-3 py-2 border"
                style={{
                  color: 'var(--text)',
                  borderColor: habit.color + '35',
                  background: habit.color + '0c',
                }}
              >
                <span className="font-bold opacity-70 mr-1">Plan:</span>
                {intention}
              </p>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            style={{ color: 'var(--muted)' }}
          >
            <MoreVertical size={14} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-6 z-20 w-32 card shadow-hover py-1 animate-bounce-in"
              onBlur={() => setMenuOpen(false)}
            >
              <button
                onClick={() => { onEdit(habit); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-gray-50 dark:hover:bg-gray-800"
                style={{ color: 'var(--text)' }}
              >
                <Pencil size={12} /> Edit
              </button>
              <button
                onClick={() => { onDelete(habit.id); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-xs hover:bg-red-50 dark:hover:bg-red-900/20"
                style={{ color: '#ef4444' }}
              >
                <Trash2 size={12} /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-6 space-y-2">
        <div className="flex justify-between items-center px-1">
          <span className="text-xs font-bold uppercase tracking-widest opacity-40" style={{ color: 'var(--muted)' }}>30-Day Goal</span>
          <span className="font-display font-black text-sm" style={{ color: habit.color }}>{streak}/30</span>
        </div>
        <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: 'rgba(0,0,0,0.04)' }}>
          <div
            className="h-full rounded-full transition-all duration-1000 cubic-bezier(0.34, 1.56, 0.64, 1)"
            style={{ width: `${streakProgress}%`, background: `linear-gradient(90deg, ${habit.color}, #ffffff50)` }}
          />
        </div>
      </div>

      {showFallback && habit.fallback_plan?.trim() && (
        <div
          className="mb-4 text-xs leading-relaxed rounded-2xl px-3 py-2.5 border-l-4"
          style={{
            borderColor: '#f59e0b',
            background: 'rgba(245, 158, 11, 0.08)',
            color: 'var(--text)',
          }}
        >
          <span className="font-bold text-amber-700 dark:text-amber-400">Minimum version:</span>{' '}
          <span className="opacity-90">{habit.fallback_plan.trim()}</span>
        </div>
      )}

      {/* Streak + best */}
      <div className="flex items-center justify-between p-3 rounded-2xl" style={{ background: habit.completed_today ? 'transparent' : 'rgba(0,0,0,0.02)' }}>
        <div className="flex items-center gap-2">
          <span className={cn('text-xl filter drop-shadow-sm transition-transform group-hover:scale-125', (streak > 0 && !habit.completed_today) && 'animate-pulse')}>
            {streak > 0 ? '🔥' : '💤'}
          </span>
          <div>
            <p className="font-display font-black text-xl leading-none" style={{ color: 'var(--text)' }}>
              {streak} <span className="text-xs font-bold uppercase tracking-wide opacity-50 ml-0.5">days</span>
            </p>
          </div>
        </div>
        {longest > 0 && (
          <div className="text-[10px] font-bold uppercase tracking-widest opacity-40 text-right" style={{ color: 'var(--muted)' }}>
            Best Streak <br /> <span className="text-sm font-black opacity-100" style={{ color: 'var(--text)' }}>{longest}d</span>
          </div>
        )}
      </div>

      {/* Completed shimmer overlay */}
      {habit.completed_today && (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${habit.color}08, transparent)` }}
        />
      )}
    </div>
  )
}
