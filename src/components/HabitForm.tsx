import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Habit, HabitCategory, TimeLane } from '../types/index'
import { HABIT_COLORS } from '../types/index'
import { cn, getDaysInMonth } from '../utils/helpers'

interface HabitFormProps {
  onSubmit: (data: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onClose: () => void
  initial?: Partial<Habit>
  isEdit?: boolean
}

export default function HabitForm({ onSubmit, onClose, initial, isEdit }: HabitFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    category: (initial?.category || 'General') as HabitCategory,
    frequency: (initial?.frequency || 'daily') as 'daily' | 'weekly',
    color: initial?.color || HABIT_COLORS[0],
    reminder_time: initial?.reminder_time || '',
    is_active: initial?.is_active ?? true,
    time_lane: (initial?.time_lane || 'any') as TimeLane,
    context_tag: initial?.context_tag || '',
    goal_days: initial?.goal_days || 30,
  })

  const now = new Date()
  const daysInCurrentMonth = getDaysInMonth(now.getFullYear(), now.getMonth())

  useEffect(() => {
    // Trap scroll
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim()) return
    setLoading(true)
    try {
      await onSubmit({
        ...form,
        name: form.name.trim(),
        description: form.description || null,
        reminder_time: form.reminder_time || null,
        time_lane: form.time_lane,
        context_tag: form.context_tag.trim() || null,
      })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)' }} />

      {/* Modal */}
      <div
        className="relative card w-full max-w-lg animate-bounce-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b" style={{ borderColor: 'var(--border)' }}>
          <h2 className="font-display font-bold text-lg" style={{ color: 'var(--text)' }}>
            {isEdit ? 'Edit Habit' : 'New Habit'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-1.5">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Habit Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="input"
              placeholder="e.g. Morning meditation"
              maxLength={60}
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Description
            </label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="input resize-none"
              rows={2}
              placeholder="Optional notes..."
            />
          </div>

          {/* Frequency */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Frequency
            </label>
            <div className="flex gap-2">
              {(['daily', 'weekly'] as const).map(freq => (
                <button
                  key={freq}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, frequency: freq }))}
                  className={cn(
                    'flex-1 py-2 rounded-xl border-2 text-sm font-medium capitalize transition-all',
                    form.frequency === freq
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-400 text-primary-700 dark:text-primary-400'
                      : 'border-transparent text-gray-500'
                  )}
                  style={{ background: form.frequency === freq ? undefined : 'var(--bg)' }}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>


          
          {/* Goal Duration */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Goal Duration
            </label>
            <div className="flex gap-2">
              {[
                { label: '7 Days', value: 7, sub: '(This Week)' },
                { label: `${daysInCurrentMonth} Days`, value: daysInCurrentMonth, sub: '(This Month)' }
              ].map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, goal_days: opt.value }))}
                  className={cn(
                    'flex-1 p-3 rounded-xl border-2 text-left transition-all',
                    form.goal_days === opt.value
                      ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-400 text-primary-700 dark:text-primary-400'
                      : 'border-transparent text-gray-500'
                  )}
                  style={{ background: form.goal_days === opt.value ? undefined : 'var(--bg)' }}
                >
                  <div className="font-bold text-sm">{opt.label}</div>
                  <div className="text-[10px] opacity-70 uppercase tracking-wider">{opt.sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-ghost flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading || !form.name.trim()} className="btn-primary flex-1">
              {loading ? 'Saving...' : isEdit ? 'Save changes' : 'Create habit'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
