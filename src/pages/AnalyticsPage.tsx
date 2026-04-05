import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer,
} from 'recharts'
import { useHabits } from '../context/HabitsContext'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../utils/supabase'
import { getLast30Days, getWeekDayLabel, calculateCompletionRate } from '../utils/helpers'
import { CATEGORIES } from '../types'
import WeekReviewPanel from '../components/WeekReviewPanel'

interface DayData { date: string; rate: number; label: string }
interface HabitStat { name: string; rate: number; color: string; streak: number }

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

  useEffect(() => {
    if (!user) return
    async function fetchLogs() {
      const start = new Date(); start.setDate(start.getDate() - 90)
      const { data } = await supabase
        .from('habit_logs')
        .select('habit_id, log_date, completed')
        .eq('user_id', user!.id)
        .gte('log_date', start.toISOString().split('T')[0])
      setLogs(data || [])
      setLoading(false)
    }
    fetchLogs()
  }, [user])

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
      return { name: h.name, rate, color: h.color, streak: h.streak?.current_streak || 0 }
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
      color: CATEGORIES.find(c => c.label === name)?.color || '#22c55e',
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
        const dateStr = day.toISOString().split('T')[0]
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

  function heatmapColor(rate: number) {
    if (rate === 0) return 'var(--border)'
    if (rate < 0.3) return '#bbf7d0'
    if (rate < 0.6) return '#4ade80'
    if (rate < 0.9) return '#22c55e'
    return '#15803d'
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'heatmap',  label: 'Heatmap' },
    { id: 'habits',   label: 'Per Habit' },
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
          { label: 'Active Streaks',  value: activeStreaks, sub: 'habits on streak', emoji: '🔥' },
          { label: 'Best Streak',     value: `${bestStreak}d`, sub: 'all time', emoji: '🏆' },
          { label: 'Total Habits',    value: habits.length, sub: 'being tracked', emoji: '📋' },
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
                    type="monotone" dataKey="rate" stroke="#22c55e" strokeWidth={2.5}
                    dot={{ fill: '#22c55e', r: 3, strokeWidth: 0 }}
                    activeDot={{ r: 5, fill: '#22c55e' }}
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
            <div className="flex gap-1">
              {heatmapWeeks.map((week, wi) => (
                <div key={wi} className="flex flex-col gap-1">
                  {week.map((day, di) => (
                    <div
                      key={di}
                      className="heatmap-cell cursor-default"
                      style={{ background: heatmapColor(day.rate) }}
                      title={`${day.date}: ${Math.round(day.rate * 100)}%`}
                    />
                  ))}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-3 justify-end">
              <span className="text-xs" style={{ color: 'var(--muted)' }}>Less</span>
              {[0, 0.25, 0.5, 0.75, 1].map(r => (
                <div key={r} className="heatmap-cell" style={{ background: heatmapColor(r) }} />
              ))}
              <span className="text-xs" style={{ color: 'var(--muted)' }}>More</span>
            </div>
          </div>
        </div>
      )}

      {/* Week review / trends */}
      {activeTab === 'reflection' && <WeekReviewPanel />}

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
