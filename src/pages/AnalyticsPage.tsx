import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'
import { useHabits } from '../context/HabitsContext'
import { useAuth } from '../context/AuthContext'
import { getLast30Days, getWeekDayLabel, calculateCompletionRate, localDateString } from '../utils/helpers'
import { fetchHabitLogsForUser } from '../utils/fetchHabitLogs'
import { CATEGORIES } from '../types'


interface DayData { date: string; rate: number; label: string }
interface HabitStat { name: string; rate: number; color: string; streak: number }

const resolveColor = (c: string) => 
  (c === '#22c55e' || c === '#16a34a' || c === '#4ade80' || c === '#15803d' || c === '#86efac') 
    ? 'var(--primary-500)' 
    : c

export default function AnalyticsPage() {
  const { habits } = useHabits()
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [logs, setLogs] = useState<{ habit_id: string; log_date: string; completed: boolean }[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'heatmap' | 'habits' | 'reflection'>('overview')

  useEffect(() => {
    if (searchParams.get('tab') === 'reflection') {
      setActiveTab('reflection')
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams])

  const isMock =
    import.meta.env.VITE_SUPABASE_URL === undefined ||
    import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

  useEffect(() => {
    if (!user) return
    async function fetchLogs() {
      try {
        const data = await fetchHabitLogsForUser(user!.id, 90, isMock)
        setLogs(data)
      } catch {
        setLogs([])
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [user, isMock])

  const last30 = getLast30Days()

  const trendData: DayData[] = useMemo(() => {
    return last30.map(date => {
      const dayLogs = logs.filter(l => l.log_date === date)
      const rate = calculateCompletionRate(
        dayLogs.filter(l => l.completed).length,
        habits.length || 1
      )
      return { date, rate, label: getWeekDayLabel(date) }
    })
  }, [logs, habits, last30])

  const habitStats: HabitStat[] = useMemo(() => {
    return habits.map(h => {
      const hLogs = logs.filter(l => l.habit_id === h.id)
      const rate = calculateCompletionRate(hLogs.filter(l => l.completed).length, Math.max(hLogs.length, 1))
      return { name: h.name, rate, color: resolveColor(h.color), streak: h.streak?.current_streak || 0 }
    }).sort((a, b) => b.rate - a.rate)
  }, [habits, logs])

  const categoryData = useMemo(() => {
    const map = new Map<string, number>()
    habits.forEach(h => {
      const cat = CATEGORIES.find(c => c.label === h.category)
      if (cat) map.set(cat.label, (map.get(cat.label) || 0) + 1)
    })
    return Array.from(map.entries()).map(([name, value]) => ({
      name, value,
      color: CATEGORIES.find(c => c.label === name)?.color || 'var(--primary-500)',
    }))
  }, [habits])

  const overallRate = useMemo(() => {
    const completed = logs.filter(l => l.completed).length
    return calculateCompletionRate(completed, Math.max(logs.length, 1))
  }, [logs])

  const bestStreak = Math.max(...habits.map(h => h.streak?.longest_streak || 0), 0)
  const activeStreaks = habits.filter(h => (h.streak?.current_streak || 0) > 0).length

  // Heatmap: last 12 weeks
  const heatmapWeeks = useMemo(() => {
    const weeks: { date: string; rate: number }[][] = []
    const today = new Date()
    for (let w = 11; w >= 0; w--) {
      const week: { date: string; rate: number }[] = []
      for (let d = 6; d >= 0; d--) {
        const day = new Date(today)
        day.setDate(today.getDate() - w * 7 - d)
        const dateStr = localDateString(day)
        const dayLogs = logs.filter(l => l.log_date === dateStr)
        const rate = habits.length > 0
          ? dayLogs.filter(l => l.completed).length / habits.length
          : 0
        week.push({ date: dateStr, rate })
      }
      weeks.push(week)
    }
    return weeks
  }, [logs, habits])

   const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'habits', label: 'Per Habit' },
    { id: 'reflection', label: 'Reflection' },
  ] as const

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>Analytics</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Last 30 days • {habits.length} active habits
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completion Rate', value: `${overallRate}%`, sub: 'last 30 days', emoji: '🎯' },
          { label: 'Active Streaks', value: activeStreaks, sub: 'habits on streak', emoji: '🔥' },
          { label: 'Best Streak', value: `${bestStreak}d`, sub: 'all time', emoji: '🏆' },
          { label: 'Total Habits', value: habits.length, sub: 'being tracked', emoji: '📋' },
        ].map(({ label, value, sub, emoji }) => (
          <div key={label} className="card p-4">
            <div className="text-2xl mb-2">{emoji}</div>
            <p className="font-display font-bold text-2xl leading-none" style={{ color: 'var(--text)' }}>{value}</p>
            <p className="text-xs font-medium mt-1" style={{ color: 'var(--text)' }}>{label}</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--border)' }}>
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: activeTab === t.id ? 'var(--card)' : 'transparent',
              color: activeTab === t.id ? 'var(--text)' : 'var(--muted)',
              boxShadow: activeTab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-slide-up">
          {/* Trend line chart */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text)' }}>
              30-Day Completion Trend
            </h3>
            {loading ? (
              <div className="skeleton h-48 w-full" />
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={trendData} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 10, fill: 'var(--muted)' }}
                    tickFormatter={(v, i) => i % 5 === 0 ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''}
                  />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--muted)' }} domain={[0, 100]} tickFormatter={v => `${v}%`} />
                  <Tooltip
                    contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                    formatter={(v: unknown) => [`${v}%`, 'Completion']}
                    labelFormatter={l => new Date(l).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                  />
                  <Line
                    type="monotone" dataKey="rate" stroke="var(--primary-500)" strokeWidth={2.5}
                    dot={{ fill: 'var(--primary-500)', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: 'var(--primary-500)' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Category pie */}
          {categoryData.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text)' }}>Habits by Category</h3>
              <div className="flex items-center gap-6">
                <ResponsiveContainer width={160} height={160}>
                  <PieChart>
                    <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                      {categoryData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex-1 space-y-2">
                  {categoryData.map(c => (
                    <div key={c.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: c.color }} />
                        <span className="text-xs" style={{ color: 'var(--text)' }}>{c.name}</span>
                      </div>
                      <span className="text-xs font-medium" style={{ color: 'var(--muted)' }}>{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Heatmap tab */}
      {activeTab === 'heatmap' && (
        <div className="card p-5 animate-slide-up">
          <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>Activity Heatmap</h3>
          <p className="text-xs mb-4" style={{ color: 'var(--muted)' }}>Last 12 weeks of habit completions</p>
          <div className="overflow-x-auto">
            <div className="flex gap-1.5 pt-2">
              {heatmapWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1.5">
                  {week.map((day, di) => {
                    const radius = 12;
                    const circumference = 2 * Math.PI * radius;
                    return (
                      <div
                        key={di}
                        className="w-5 h-5 flex-shrink-0 cursor-default"
                        title={`${day.date}: ${Math.round(day.rate * 100)}%`}
                      >
                        <svg viewBox="0 0 32 32" className="-rotate-90 w-full h-full">
                          <circle
                            cx="16" cy="16" r={radius}
                            fill="none" stroke="var(--border)"
                            strokeWidth="5" className="opacity-30"
                          />
                          {day.rate > 0 && (
                            <circle
                              cx="16" cy="16" r={radius}
                              fill="none" stroke="var(--primary-500)"
                              strokeWidth="5" strokeLinecap="round"
                              strokeDasharray={circumference}
                              strokeDashoffset={circumference * (1 - day.rate)}
                              style={{ transition: 'stroke-dashoffset 0.5s ease' }}
                            />
                          )}
                        </svg>
                      </div>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Week review / trends */}
      {activeTab === 'reflection' && (
        <div className="animate-slide-up card p-12 text-center">
          <div className="text-5xl mb-4">📓</div>
          <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>Weekly Reflection</h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Deep week-in-review insights and journaling are coming soon to Habitly!
          </p>
          <span className="mt-4 inline-block text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#fffbeb', color: '#d97706' }}>
            Coming soon
          </span>
        </div>
      )}

      {/* Per habit tab */}
      {activeTab === 'habits' && (
        <div className="space-y-4 animate-slide-up">
          {habitStats.length === 0 ? (
            <div className="card p-8 text-center">
              <p style={{ color: 'var(--muted)' }}>No habit data yet. Start checking in!</p>
            </div>
          ) : (
            <>
              <div className="card p-5">
                <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--text)' }}>Completion by Habit</h3>
                <ResponsiveContainer width="100%" height={Math.max(160, habitStats.length * 40)}>
                  <BarChart data={habitStats} layout="vertical" margin={{ left: 0, right: 20, top: 0, bottom: 0 }}>
                    <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: 'var(--muted)' }} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 11, fill: 'var(--text)' }} />
                    <Tooltip
                      contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }}
                      formatter={(v: unknown) => [`${v}%`, 'Completion']}
                    />
                    <Bar dataKey="rate" radius={[0, 6, 6, 0]}>
                      {habitStats.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {habitStats.map(h => (
                  <div key={h.name} className="card p-4 flex items-center gap-4">
                    <div className="w-2 self-stretch rounded-full flex-shrink-0" style={{ background: h.color }} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>{h.name}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>🔥 {h.streak}d streak</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-lg" style={{ color: h.color }}>{h.rate}%</p>
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>completion</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
