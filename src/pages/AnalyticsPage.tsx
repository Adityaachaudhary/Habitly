import { useEffect, useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar
} from 'recharts'
import { useHabits } from '../context/HabitsContext'
import { useAuth } from '../context/AuthContext'
import { calculateCompletionRate, localDateString, cn } from '../utils/helpers'
import { fetchHabitLogsForUser } from '../utils/fetchHabitLogs'
import { CATEGORIES } from '../types'
import CalendarHeatmap from '../components/CalendarHeatmap'
import { Target, Flame, Trophy, ClipboardList, BookOpen } from 'lucide-react'


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
  const [range, setRange] = useState(30)

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
        const data = await fetchHabitLogsForUser(user!.id, 100, isMock)
        setLogs(data)
      } catch {
        setLogs([])
      } finally {
        setLoading(false)
      }
    }
    fetchLogs()
  }, [user, isMock])


  const rangeDates = useMemo(() => {
    const dates: string[] = []
    for (let i = range - 1; i >= 0; i--) {
      const d = new Date()
      d.setDate(d.getDate() - i)
      dates.push(localDateString(d))
    }
    return dates
  }, [range])

  const trendData: DayData[] = useMemo(() => {
    return rangeDates.map(date => {
      const dayLogs = logs.filter(l => l.log_date === date)
      const rate = calculateCompletionRate(
        dayLogs.filter(l => l.completed).length,
        habits.length || 1
      )
      return { date, rate, label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }
    })
  }, [logs, habits, rangeDates])

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


  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'heatmap', label: 'Heatmap' },
    { id: 'habits', label: 'Per Habit' },
    { id: 'reflection', label: 'Reflection' },
  ] as const

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif italic text-5xl tracking-tight" style={{ color: 'var(--text)' }}>Analytics</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-40" style={{ color: 'var(--muted)' }}>
          Insights • {habits.length} active habits
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Completion Rate', value: `${overallRate}%`, sub: '30 day avg', Icon: Target },
          { label: 'Active Streaks', value: activeStreaks, sub: 'Current', Icon: Flame },
          { label: 'Best Streak', value: `${bestStreak}d`, sub: 'All time', Icon: Trophy },
          { label: 'Total Habits', value: habits.length, sub: 'Tracking', Icon: ClipboardList },
        ].map(({ label, value, sub, Icon }) => (
          <div key={label} className="card p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-3 opacity-[0.03] group-hover:opacity-10 transition-opacity">
               <Icon size={64} />
            </div>
            <div className="mb-6 flex items-center justify-center w-10 h-10 rounded-xl" style={{ background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Icon size={20} strokeWidth={2.5} />
            </div>
            {loading ? (
              <div className="space-y-2">
                <div className="skeleton h-8 w-20 rounded" />
                <div className="skeleton h-3 w-24 rounded" />
              </div>
            ) : (
              <>
                <p className="font-display font-black text-3xl leading-none tracking-tighter" style={{ color: 'var(--text)' }}>{value}</p>
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider opacity-60" style={{ color: 'var(--text)' }}>{label}</p>
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-30" style={{ color: 'var(--muted)' }}>{sub}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Filters & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--border)' }}>
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{
                background: activeTab === t.id ? 'var(--card)' : 'transparent',
                color: activeTab === t.id ? 'var(--text)' : 'var(--muted)'
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Range Filters */}
        <div className="flex gap-2 p-1 rounded-xl bg-black/5 dark:bg-white/5 w-fit">
          {[7, 21, 30, 60, 90].map(r => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                range === r
                  ? "bg-primary-500 text-white shadow-sm"
                  : "opacity-40 hover:opacity-100"
              )}
            >
              {r}D
            </button>
          ))}
        </div>
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
        <div className="card p-6 animate-slide-up">
          <CalendarHeatmap logs={logs} habitCount={habits.length} />
        </div>
      )}

      {/* Week review / trends */}
      {activeTab === 'reflection' && (
        <div className="animate-slide-up card p-12 text-center">
          <div className="flex justify-center mb-4" style={{ color: 'var(--primary-500)' }}>
            <BookOpen size={48} strokeWidth={1.5} />
          </div>
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
            <div className="flex flex-col gap-4">
              {habits.map(h => {
                const color = resolveColor(h.color)
                const stat = habitStats.find(s => s.name === h.name)
                const barData = rangeDates.map(date => {
                  const log = logs.find(l => l.habit_id === h.id && l.log_date === date)
                  return {
                    date,
                    label: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                    done: log?.completed ? 1 : 0,
                  }
                })
                const doneCount = barData.filter(d => d.done).length

                return (
                  <div key={h.id} className="card p-5 space-y-4">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: color }} />
                        <p className="font-semibold text-sm truncate" style={{ color: 'var(--text)' }}>{h.name}</p>
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full flex-shrink-0" style={{ background: color + '20', color }}>
                        {h.category}
                      </span>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-xl py-2" style={{ background: 'var(--border)' }}>
                        <p className="font-black text-lg leading-none" style={{ color }}>{stat?.rate ?? 0}%</p>
                        <p className="text-[9px] uppercase font-bold tracking-wider mt-1 opacity-50" style={{ color: 'var(--muted)' }}>Done</p>
                      </div>
                      <div className="rounded-xl py-2" style={{ background: 'var(--border)' }}>
                        <p className="font-black text-lg leading-none" style={{ color: 'var(--text)' }}>{stat?.streak ?? 0}d</p>
                        <p className="text-[9px] uppercase font-bold tracking-wider mt-1 opacity-50" style={{ color: 'var(--muted)' }}>Streak</p>
                      </div>
                      <div className="rounded-xl py-2" style={{ background: 'var(--border)' }}>
                        <p className="font-black text-lg leading-none" style={{ color: 'var(--text)' }}>{doneCount}/{range}</p>
                        <p className="text-[9px] uppercase font-bold tracking-wider mt-1 opacity-50" style={{ color: 'var(--muted)' }}>Days</p>
                      </div>
                    </div>

                    {/* Bar chart */}
                    <ResponsiveContainer width="100%" height={160}>
                      <BarChart data={barData} margin={{ top: 0, right: 0, bottom: 30, left: 0 }} barCategoryGap="20%">
                        <XAxis
                          dataKey="label"
                          tick={{ fontSize: 8, fill: 'var(--muted)' }}
                          angle={-45}
                          textAnchor="end"
                          interval={0}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }}
                          itemStyle={{ color: 'var(--text)' }}
                          labelStyle={{ color: 'var(--text)' }}
                          formatter={(v: any) => [v === 1 ? '✅ Completed' : '❌ Missed', '']}
                          labelFormatter={(_, payload) => payload?.[0]?.payload?.label ?? ''}
                        />
                        <Bar dataKey="done" radius={[3, 3, 0, 0]}>
                          {barData.map((entry, i) => (
                            <Cell key={i} fill={entry.done ? color : 'var(--border)'} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
