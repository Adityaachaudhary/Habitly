import { useEffect } from 'react'
import { Award, X } from 'lucide-react'
import { BADGE_DEFINITIONS } from '../types'
import type { BadgeToastItem } from '../context/AchievementsContext'

interface BadgeUnlockToastProps {
  item: BadgeToastItem | undefined
  onDismiss: () => void
}

export default function BadgeUnlockToast({ item, onDismiss }: BadgeUnlockToastProps) {
  useEffect(() => {
    if (!item) return
    const t = window.setTimeout(() => onDismiss(), 6500)
    return () => window.clearTimeout(t)
  }, [item, onDismiss])

  if (!item) return null

  const def = BADGE_DEFINITIONS[item.badge_name]
  const title = def?.label ?? item.badge_name
  const emoji = def?.emoji ?? '🏅'
  const desc = def?.description ?? ''

  return (
    <div
      className="fixed bottom-6 right-6 z-[100] max-w-sm animate-slide-up pointer-events-auto"
      role="status"
      aria-live="polite"
    >
      <div
        className="card p-4 shadow-2xl border flex gap-3 items-start"
        style={{
          borderColor: 'rgba(234, 179, 8, 0.45)',
          background: 'linear-gradient(135deg, rgba(254, 243, 199, 0.95), var(--card))',
        }}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
          style={{ background: 'rgba(234, 179, 8, 0.25)' }}
        >
          {emoji}
        </div>
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-center gap-2 mb-0.5">
            <Award size={14} className="text-amber-600 flex-shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 dark:text-amber-400">
              Badge unlocked
            </span>
          </div>
          <p className="font-display font-bold text-base leading-tight" style={{ color: 'var(--text)' }}>
            {title}
          </p>
          {item.habitLabel && (
            <p className="text-xs mt-1 font-medium" style={{ color: 'var(--muted)' }}>
              {item.badge_name.startsWith('HABIT_STREAK') ? `Habit: ${item.habitLabel}` : ''}
            </p>
          )}
          {desc && (
            <p className="text-xs mt-1.5 leading-snug" style={{ color: 'var(--muted)' }}>
              {desc}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 rounded-lg flex-shrink-0"
          aria-label="Dismiss"
        >
          <X size={16} style={{ color: 'var(--muted)' }} />
        </button>
      </div>
    </div>
  )
}
