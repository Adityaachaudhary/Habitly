import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import type { Habit, HabitCategory, TimeLane } from '../types/index'
import { TIME_LANE_LABELS, TIME_LANE_ORDER } from '../types/index'
import { CATEGORIES, HABIT_COLORS } from '../types/index'
import { cn } from '../utils/helpers'

interface HabitFormProps {
  onSubmit: (data: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>
  onClose: () => void
  initial?: Partial<Habit>
  isEdit?: boolean
  /** Other habits for “stack after” (caller excludes current habit when editing). */
  stackAfterOptions?: { id: string; name: string }[]
}

export default function HabitForm({ onSubmit, onClose, initial, isEdit, stackAfterOptions = [] }: HabitFormProps) {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    category: (initial?.category || 'General') as HabitCategory,
    frequency: (initial?.frequency || 'daily') as 'daily' | 'weekly',
    color: initial?.color || HABIT_COLORS[0],
    reminder_time: initial?.reminder_time || '',
    is_active: initial?.is_active ?? true,
    stack_after_habit_id: initial?.stack_after_habit_id || '',
    implementation_cue: initial?.implementation_cue || '',
    implementation_context: initial?.implementation_context || '',
    fallback_plan: initial?.fallback_plan || '',
    time_lane: (initial?.time_lane || 'any') as TimeLane,
    context_tag: initial?.context_tag || '',
  })

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
        stack_after_habit_id: form.stack_after_habit_id || null,
        implementation_cue: form.implementation_cue.trim() || null,
        implementation_context: form.implementation_context.trim() || null,
        fallback_plan: form.fallback_plan.trim() || null,
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
        className="relative card w-full max-w-lg animate-bounce-in overflow-y-auto max-h-[90vh]"
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

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Category
            </label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat: any) => (
                <button
                  key={cat.label}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, category: cat.label }))}
                  className={cn(
                    'flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all text-xs',
                    form.category === cat.label
                      ? 'border-current'
                      : 'border-transparent hover:border-gray-200 dark:hover:border-gray-700'
                  )}
                  style={{
                    background: form.category === cat.label ? cat.bg : 'var(--bg)',
                    color: form.category === cat.label ? cat.color : 'var(--muted)',
                    borderColor: form.category === cat.label ? cat.color : undefined,
                  }}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span className="leading-tight text-center">{cat.label}</span>
                </button>
              ))}
            </div>
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
                      : 'border-transparent text-gray-500 hover:border-gray-200'
                  )}
                  style={{ background: form.frequency === freq ? undefined : 'var(--bg)' }}
                >
                  {freq}
                </button>
              ))}
            </div>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Color
            </label>
            <div className="flex gap-2 flex-wrap">
              {HABIT_COLORS.map((color: any) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, color }))}
                  className="w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{
                    background: color,
                    outline: form.color === color ? `3px solid ${color}` : 'none',
                    outlineOffset: '2px',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Reminder Time (optional)
            </label>
            <input
              type="time"
              value={form.reminder_time}
              onChange={e => setForm(f => ({ ...f, reminder_time: e.target.value }))}
              className="input"
            />
          </div>

          {/* Time & context (dashboard lanes) */}
          <div
            className="rounded-2xl border p-4 space-y-4"
            style={{ borderColor: 'var(--border)', background: 'rgba(0,0,0,0.02)' }}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--muted)' }}>
                Time & context
              </p>
              <p className="text-[11px] leading-snug opacity-80" style={{ color: 'var(--muted)' }}>
                Group habits on your dashboard by rough time of day; add a short place or situation tag.
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Usual time
              </label>
              <select
                value={form.time_lane}
                onChange={e => setForm(f => ({ ...f, time_lane: e.target.value as TimeLane }))}
                className="input"
              >
                {TIME_LANE_ORDER.map(lane => (
                  <option key={lane} value={lane}>
                    {TIME_LANE_LABELS[lane]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Context tag (optional)
              </label>
              <input
                type="text"
                value={form.context_tag}
                onChange={e => setForm(f => ({ ...f, context_tag: e.target.value }))}
                className="input"
                placeholder="e.g. Home · Gym · Deep work"
                maxLength={40}
              />
            </div>
          </div>

          {/* Behavior design */}
          <div
            className="rounded-2xl border p-4 space-y-4"
            style={{ borderColor: 'var(--border)', background: 'rgba(0,0,0,0.02)' }}
          >
            <div>
              <p className="text-xs font-bold uppercase tracking-widest mb-0.5" style={{ color: 'var(--muted)' }}>
                Behavior design
              </p>
              <p className="text-[11px] leading-snug opacity-80" style={{ color: 'var(--muted)' }}>
                Implementation intentions, habit stacking, and a minimum version when things slip.
              </p>
            </div>

            {stackAfterOptions.length > 0 && (
              <div>
                <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                  Stack after (optional)
                </label>
                <select
                  value={form.stack_after_habit_id}
                  onChange={e =>
                    setForm(f => ({
                      ...f,
                      stack_after_habit_id: e.target.value,
                    }))
                  }
                  className="input"
                >
                  <option value="">None — use cue below or neither</option>
                  {stackAfterOptions.map(opt => (
                    <option key={opt.id} value={opt.id}>
                      {opt.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] mt-1 opacity-70" style={{ color: 'var(--muted)' }}>
                  Do this habit right after the one you pick. Order on the dashboard follows this chain.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                After I… (cue, optional)
              </label>
              <input
                type="text"
                value={form.implementation_cue}
                onChange={e => setForm(f => ({ ...f, implementation_cue: e.target.value }))}
                className="input"
                placeholder='e.g. I finish my coffee / I close my laptop'
                maxLength={120}
                disabled={!!form.stack_after_habit_id}
              />
              {form.stack_after_habit_id ? (
                <p className="text-[10px] mt-1 opacity-70" style={{ color: 'var(--muted)' }}>
                  Cue is implied by the stacked habit. Clear “Stack after” to use a free-form cue instead.
                </p>
              ) : null}
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Where / when (optional)
              </label>
              <input
                type="text"
                value={form.implementation_context}
                onChange={e => setForm(f => ({ ...f, implementation_context: e.target.value }))}
                className="input"
                placeholder="e.g. at my desk · before 9am"
                maxLength={120}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
                Minimum version (fallback, optional)
              </label>
              <textarea
                value={form.fallback_plan}
                onChange={e => setForm(f => ({ ...f, fallback_plan: e.target.value }))}
                className="input resize-none"
                rows={2}
                placeholder="e.g. Just 2 minutes — one paragraph / one stretch counts"
                maxLength={280}
              />
              <p className="text-[10px] mt-1 opacity-70" style={{ color: 'var(--muted)' }}>
                Shown when your streak is at zero but you have history — keeps the habit from feeling all-or-nothing.
              </p>
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
