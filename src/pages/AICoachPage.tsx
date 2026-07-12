import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { Bot, Sparkles, BarChart3, AlertTriangle } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useHabits } from '../context/HabitsContext'
import { useAIInsights } from '../hooks/useAIInsights'
import { useHabitLogHistory } from '../hooks/useHabitLogHistory'
import AICoach from '../components/AICoach'
import AIInsightPanel from '../components/AIInsightPanel'
import { cn } from '../utils/helpers'

const TABS = [
  { id: 'coach', label: 'AI Coach', icon: <Bot size={18} /> },
  { id: 'insight', label: 'Daily Insight', icon: <Sparkles size={18} /> },
  { id: 'report', label: 'Weekly Report', icon: <BarChart3 size={18} /> },
] as const

type Tab = typeof TABS[number]['id']

export default function AICoachPage() {
  const { user } = useAuth()
  const { habits } = useHabits()
  const [activeTab, setActiveTab] = useState<Tab>('coach')

  const habitsLogSyncKey = useMemo(
    () =>
      habits
        .map(h => `${h.id}:${h.completed_today ? 1 : 0}:${h.streak?.current_streak ?? 0}`)
        .join('|'),
    [habits]
  )
  const { logs: historyLogs, loading: historyLogsLoading } = useHabitLogHistory(
    user?.id,
    40,
    habitsLogSyncKey
  )

  const {
    dailyInsight, getDailyInsight,
    weeklyReport, getWeeklyReport,
    chatHistory, chatLoading,
    sendChatMessage, clearChat,
  } = useAIInsights(habits, { logs: historyLogs, loading: historyLogsLoading })

  // Access control: Premium users or the development guest user
  const canAccess = user?.is_premium || user?.id === 'guest-user-123'

  if (!canAccess) {
    return <Navigate to="/premium" replace />
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in" style={{ background: 'var(--bg)' }}>
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="font-serif italic text-5xl tracking-tight" style={{ color: 'var(--text)' }}>
          AI Habit Coach
        </h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40" style={{ color: 'var(--muted)' }}>
          Personalized guidance • Advanced Analysis
        </p>
      </div>

      <div className="card overflow-hidden shadow-sm transition-all" style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex border-b overflow-x-auto no-scrollbar" style={{ borderColor: 'var(--border)' }}>
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className="flex items-center gap-3 px-8 py-5 text-sm font-bold transition-all relative whitespace-nowrap uppercase tracking-widest"
              style={{
                color: activeTab === t.id ? 'var(--primary-600)' : 'var(--muted)',
                background: activeTab === t.id ? 'rgba(var(--primary-600-rgb), 0.04)' : 'transparent',
              }}
            >
              <div className={cn("transition-transform duration-300", activeTab === t.id && "scale-110")}>
                {t.icon}
              </div>
              {t.label}
              {activeTab === t.id && (
                <span
                  className="absolute bottom-0 left-0 right-0 h-1 rounded-full"
                  style={{ background: 'var(--primary-600)' }}
                />
              )}
            </button>
          ))}
        </div>

        <div className="animate-slide-up">
          {activeTab === 'coach' && (
            <AICoach
              chatHistory={chatHistory}
              chatLoading={chatLoading}
              onSend={sendChatMessage}
              onClear={clearChat}
            />
          )}

          {activeTab === 'insight' && (
            <div className="p-6">
              <p className="text-sm mb-6" style={{ color: 'var(--muted)' }}>
                Get a personalized insight about your current habits and patterns. Refreshes any time you want a new perspective.
              </p>
              <AIInsightPanel
                insight={dailyInsight}
                onGenerate={getDailyInsight}
                isPremium={true}
              />
            </div>
          )}

          {activeTab === 'report' && (
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-lg font-semibold" style={{ color: 'var(--text)' }}>Weekly Progress Summary</p>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                    Deep-dive analysis of your consistency and performance this week.
                  </p>
                </div>
                <button
                  onClick={getWeeklyReport}
                  disabled={weeklyReport.loading}
                  className="btn-primary text-sm px-6 py-2.5 shadow-sm hover:shadow-md transition-shadow"
                >
                  {weeklyReport.loading ? 'Generating...' : weeklyReport.text ? 'Regenerate Report' : 'Generate Weekly Report'}
                </button>
              </div>

              {weeklyReport.loading && (
                <div className="space-y-3 p-6 rounded-2xl" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  <div className="skeleton h-4 w-full rounded-lg" style={{ background: 'var(--border)' }} />
                  <div className="skeleton h-4 w-5/6 rounded-lg" style={{ background: 'var(--border)' }} />
                  <div className="skeleton h-4 w-4/6 rounded-lg" style={{ background: 'var(--border)' }} />
                </div>
              )}

              {weeklyReport.error && (
                <div className="p-4 rounded-xl text-sm flex items-center gap-3 border shadow-sm" style={{ background: '#fef2f2', color: '#dc2626', borderColor: '#fecaca' }}>
                  <AlertTriangle size={18} /> {weeklyReport.error}
                </div>
              )}

              {weeklyReport.text && !weeklyReport.loading && (
                <div
                  className="p-6 rounded-2xl animate-slide-up shadow-sm border"
                  style={{ 
                    background: 'var(--primary-50)', 
                    borderColor: 'rgba(139, 92, 246, 0.2)' 
                  }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <BarChart3 size={20} className="text-blue-500" />
                    </div>
                    <div className="flex-1">
                      <p className="text-base leading-relaxed" style={{ color: 'var(--text)' }}>
                        {weeklyReport.text}
                      </p>
                      {weeklyReport.generatedAt && (
                        <p className="text-xs mt-4" style={{ color: 'var(--muted)' }}>
                          Last updated: {new Date(weeklyReport.generatedAt).toLocaleString('en-US', { 
                            weekday: 'long', month: 'short', day: 'numeric', 
                            hour: '2-digit', minute: '2-digit' 
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!weeklyReport.text && !weeklyReport.loading && !weeklyReport.error && (
                <div
                  className="flex flex-col items-center justify-center py-16 rounded-2xl text-center"
                  style={{ border: '2px dashed var(--border)', background: 'rgba(0,0,0,0.01)' }}
                >
                  <div className="w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
                    <BarChart3 size={32} style={{ color: 'var(--primary-500)' }} className="opacity-40" />
                  </div>
                  <h3 className="font-semibold text-lg mb-1" style={{ color: 'var(--text)' }}>No report generated yet</h3>
                  <p className="text-sm max-w-sm" style={{ color: 'var(--muted)' }}>
                    Your customized weekly summary is ready to be compiled. Click the button above to begin the AI analysis.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
