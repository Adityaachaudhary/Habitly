import { useState } from 'react'
import { Plus, CheckCircle2, Circle, TrendingUp, Flame, Sprout } from 'lucide-react'
import { useHabits } from '../context/HabitsContext'
import { useAuth } from '../context/AuthContext'
import HabitCard from '../components/HabitCard'
import HabitForm from '../components/HabitForm'
// import AIInsightPanel from '../components/AIInsightPanel'
// import { useAIInsights } from '../hooks/useAIInsights'
// import { useHabitLogHistory } from '../hooks/useHabitLogHistory'
import type { Habit, HabitWithStreak, TimeLane } from '../types'
import { TIME_LANE_LABELS, TIME_LANE_ORDER } from '../types'
import { getGreeting } from '../utils/helpers'
// import { useWeekReview } from '../context/WeekReviewContext'
// import { getWeekMondayIso } from '../utils/weekReviewHelpers'

export default function DashboardPage() {
  const { user } = useAuth()
  const { habits, loading, createHabit, updateHabit, deleteHabit, toggleHabit } = useHabits()
  // const { getReviewForWeek } = useWeekReview()
  const [showForm, setShowForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<HabitWithStreak | null>(null)

  // const habitsLogSyncKey = useMemo(
  //   () =>
  //     habits
  //       .map(h => `${h.id}:${h.completed_today ? 1 : 0}:${h.streak?.current_streak ?? 0}`)
  //       .join('|'),
  //   [habits]
  // )
  // const { logs: historyLogs, loading: historyLogsLoading } = useHabitLogHistory(
  //   user?.id,
  //   40,
  //   habitsLogSyncKey
  // )
  // const { dailyInsight, getDailyInsight } = useAIInsights(habits, {
  //   logs: historyLogs,
  //   loading: historyLogsLoading,
  // })

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const completed = habits.filter(h => h.completed_today).length
  const total = habits.length
  const completionPct = total > 0 ? Math.round((completed / total) * 100) : 0

  async function handleEdit(updates: Omit<Habit, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
    if (!editingHabit) return
    await updateHabit(editingHabit.id, updates)
    setEditingHabit(null)
  }

  async function handleDelete(id: string) {
    if (confirm('Delete this habit? This cannot be undone.')) {
      await deleteHabit(id)
    }
  }

  const sortedHabits = (() => {
    const pending = habits.filter(h => !h.completed_today)
    const done = habits.filter(h => h.completed_today)
    return [...pending, ...done]
  })()


  const topStreaks = [...habits]
    .filter(h => (h.streak?.current_streak || 0) > 0)
    .sort((a, b) => (b.streak?.current_streak || 0) - (a.streak?.current_streak || 0))
    .slice(0, 3)

  // const thisWeekMonday = getWeekMondayIso()
  // const hasWeekReview = Boolean(getReviewForWeek(thisWeekMonday))
  // const showWeekReviewNudge = !weekReviewLoading && !hasWeekReview && isEndOfWeekNudgeDay()

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-1" style={{ color: 'var(--muted)' }}>{today}</p>
          <h1 className="font-serif italic text-5xl mt-1 tracking-tight" style={{ color: 'var(--text)' }}>
            {getGreeting()}, <span className="not-italic font-display font-black text-4xl ml-2" style={{ color: 'var(--primary-600)' }}>{user?.full_name?.split(' ')[0] || 'there'}</span>
          </h1>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary flex-shrink-0 px-6 py-4 shadow-lg active:scale-95">
          <Plus size={20} />
          <span className="text-base">New Habit</span>
        </button>
      </div>

      {/* {showWeekReviewNudge && (
        <Link
          to="/analytics?tab=reflection"
          className="flex items-center gap-4 p-4 rounded-2xl border transition-all hover:shadow-md"
          style={{
            borderColor: 'rgba(139, 92, 246, 0.35)',
            background: 'rgba(139, 92, 246, 0.08)',
          }}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(139, 92, 246, 0.2)' }}
          >
            <BookOpenCheck className="text-violet-600 dark:text-violet-300" size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-bold text-sm" style={{ color: 'var(--text)' }}>
              End-of-week review
            </p>
            <p className="text-sm mt-0.5 leading-snug" style={{ color: 'var(--muted)' }}>
              Take two minutes: what worked, what broke, one change for next week. Shown in Analytics → Reflection.
            </p>
          </div>
          <span className="text-sm font-semibold text-violet-600 dark:text-violet-400 flex-shrink-0">
            Open →
          </span>
        </Link>
      )} */}

      {/* Today's progress card */}
      <div className="glass-card p-10 relative overflow-hidden group">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-10">
          <div className="max-w-md">
            <h2 className="font-display font-extrabold text-3xl mb-3 tracking-tighter" style={{ color: 'var(--text)' }}>Daily Progress</h2>
            <p className="text-lg font-medium opacity-60 leading-relaxed" style={{ color: 'var(--muted)' }}>
              You've completed <span style={{ color: 'var(--primary-600)' }} className="font-bold underline decoration-primary-200 underline-offset-4">{completed}</span> of <span className="font-bold text-text">{total}</span> habits today. Keep the momentum!
            </p>
          </div>
          <div className="relative w-32 h-32 flex-shrink-0">
            <svg viewBox="0 0 64 64" className="w-32 h-32 -rotate-90">
              <defs>
                <linearGradient id="progGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="var(--primary-400)" />
                  <stop offset="100%" stopColor="var(--primary-600)" />
                </linearGradient>
              </defs>
              <circle cx="32" cy="32" r="28" fill="none" strokeWidth="5" stroke="var(--border)" className="opacity-10" />
              <circle
                cx="32" cy="32" r="28" fill="none" strokeWidth="5"
                stroke="url(#progGradient)"
                strokeDasharray={`${2 * Math.PI * 28}`}
                strokeDashoffset={`${2 * Math.PI * 28 * (1 - completionPct / 100)}`}
                strokeLinecap="round"
                className="drop-shadow-[0_0_8px_rgba(var(--primary-500-rgb),0.4)]"
                style={{ transition: 'stroke-dashoffset 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-display font-black text-3xl" style={{ color: 'var(--text)' }}>{completionPct}%</span>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full rounded-full h-2" style={{ background: 'var(--border)' }}>
          <div
            className="h-2 rounded-full transition-all duration-700"
            style={{ width: `${completionPct}%`, background: 'var(--primary-500)' }}
          />
        </div>

        {/* Quick stats row */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          {[
            { label: 'Pending', value: total - completed, icon: <Circle size={14} className="opacity-60" /> },
            { label: 'Completed', value: completed, icon: <CheckCircle2 size={14} style={{ color: 'var(--primary-600)' }} /> },
            { label: 'Avg Streak', value: habits.length > 0 ? Math.round(habits.reduce((s, h) => s + (h.streak?.current_streak || 0), 0) / habits.length) : 0, icon: <TrendingUp size={14} style={{ color: 'var(--amber-500)' }} /> },
          ].map(({ label, value, icon }) => (
            <div key={label} className="flex items-center gap-4 p-4 rounded-2xl border transition-all" style={{ borderColor: 'var(--glass-border)', background: 'rgba(0,0,0,0.02)' }}>
              <div className="w-10 h-10 rounded-xl bg-white dark:bg-black/20 shadow-sm flex items-center justify-center">
                {icon}
              </div>
              <div>
                <p className="text-[10px] uppercase font-bold tracking-widest opacity-50" style={{ color: 'var(--muted)' }}>{label}</p>
                <p className="font-display font-extrabold text-xl leading-none mt-0.5" style={{ color: 'var(--text)' }}>{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insight Panel */}
      {/* <AIInsightPanel
        insight={dailyInsight}
        onGenerate={getDailyInsight}
        isPremium={user?.is_premium}
      /> */}

      {/* Top streaks */}
      {topStreaks.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-xs mb-4 uppercase tracking-widest opacity-50 flex items-center gap-2" style={{ color: 'var(--muted)' }}>
            <Flame size={14} className="text-orange-500" /> Current Hot Streaks
          </h2>
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {topStreaks.map(h => (
              <div key={h.id} className="card p-4 flex-shrink-0 flex items-center gap-4 transition-shadow" style={{ minWidth: 200 }}>
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-inner" style={{ background: (h.color === '#22c55e' ? 'var(--primary-500)' : h.color) + '15' }}>
                  <Flame size={24} className="text-orange-500" />
                </div>
                <div>
                  <p className="font-bold text-sm truncate" style={{ color: 'var(--text)', maxWidth: 120 }}>{h.name}</p>
                  <p className="text-xs font-medium opacity-60" style={{ color: 'var(--muted)' }}>{h.streak?.current_streak}d streak</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Habits grid */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-xs uppercase tracking-widest opacity-50" style={{ color: 'var(--muted)' }}>
            My Habits ({total})
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="card p-6 space-y-4">
                <div className="skeleton h-6 w-2/3" />
                <div className="skeleton h-4 w-1/3" />
                <div className="skeleton h-2 w-full" />
              </div>
            ))}
          </div>
        ) : total === 0 ? (
          <div className="card p-16 text-center">
            <div className="flex justify-center text-6xl mb-6 text-green-500 opacity-20">
              <Sprout size={64} />
            </div>
            <h3 className="font-display font-bold text-2xl mb-2" style={{ color: 'var(--text)' }}>
              Start your journey
            </h3>
            <p className="text-base mb-8 opacity-70" style={{ color: 'var(--muted)' }}>
              Add your first habit and start building momentum today.
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary mx-auto px-8 py-3">
              <Plus size={20} /> Add your first habit
            </button>
          </div>
        ) : (
          <div className="space-y-10">
            {TIME_LANE_ORDER.map((lane: TimeLane) => {
              const inLane = sortedHabits.filter(h => (h.time_lane || 'any') === lane)
              if (inLane.length === 0) return null
              return (
                <div key={lane}>
                  <h3
                    className="font-display font-bold text-xs uppercase tracking-widest mb-4 opacity-50"
                    style={{ color: 'var(--muted)' }}
                  >
                    {TIME_LANE_LABELS[lane]} · {inLane.length}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {inLane.map(habit => (
                      <HabitCard
                        key={habit.id}
                        habit={habit}
                        onToggle={toggleHabit}
                        onEdit={setEditingHabit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      {/* Modals */}
      {showForm && (
        <HabitForm
          onSubmit={createHabit}
          onClose={() => setShowForm(false)}
        />
      )}
      {editingHabit && (
        <HabitForm
          isEdit
          initial={editingHabit}
          onSubmit={handleEdit}
          onClose={() => setEditingHabit(null)}
        />
      )}
    </div>
  )
}