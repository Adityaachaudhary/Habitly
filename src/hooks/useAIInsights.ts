import { useState, useCallback } from 'react'
import { generateHabitInsight, generateWeeklyReport, generateStreakRecovery, generateCoachResponse } from '../utils/groq'
import type { HabitLog, HabitWithStreak } from '../types'
import {
  buildCoachLogSummary,
  buildDailyInsightPayload,
  buildWeeklyReportStats,
} from '../utils/habitLogStats'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface InsightState {
  text: string
  generatedAt: Date | null
  loading: boolean
  error: string
}

export function useAIInsights(
  habits: HabitWithStreak[],
  logContext: { logs: HabitLog[]; loading: boolean }
) {
  const { logs, loading: logsLoading } = logContext

  const [dailyInsight, setDailyInsight] = useState<InsightState>({
    text: '', generatedAt: null, loading: false, error: '',
  })
  const [weeklyReport, setWeeklyReport] = useState<InsightState>({
    text: '', generatedAt: null, loading: false, error: '',
  })
  const [recoveryMsg, setRecoveryMsg] = useState<InsightState>({
    text: '', generatedAt: null, loading: false, error: '',
  })
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([])
  const [chatLoading, setChatLoading] = useState(false)

  const getDailyInsight = useCallback(async () => {
    setDailyInsight(s => ({ ...s, loading: true, error: '' }))
    try {
      const statsBlock =
        habits.length === 0
          ? 'No habits tracked yet.'
          : logs.length > 0
            ? buildDailyInsightPayload(habits, logs)
            : logsLoading
              ? `Log sync in progress. Snapshot today only: ${habits.map(h => `${h.name} (${h.completed_today ? 'completed' : 'not yet'})`).join('; ')}.`
              : `No recent logs in memory. Today: ${habits.map(h => `${h.name} (${h.completed_today ? 'completed' : 'not yet'})`).join('; ')}.`
      const text = await generateHabitInsight(statsBlock)
      setDailyInsight({ text, generatedAt: new Date(), loading: false, error: '' })
    } catch {
      setDailyInsight(s => ({ ...s, loading: false, error: 'Could not reach AI. Check your Groq API key.' }))
    }
  }, [habits, logs, logsLoading])

  const getWeeklyReport = useCallback(async () => {
    setWeeklyReport(s => ({ ...s, loading: true, error: '' }))
    try {
      const block =
        habits.length === 0
          ? 'No habits tracked.'
          : (() => {
              const { habitLines, overallSevenDay, perfectDayStreak } = buildWeeklyReportStats(habits, logs)
              return `Overall 7-day average completion (across habits): ${overallSevenDay}%.\nFull-day streak (all daily habits completed): ${perfectDayStreak} consecutive day(s).\nDetails:\n${habitLines}`
            })()
      const text = await generateWeeklyReport(block)
      setWeeklyReport({ text, generatedAt: new Date(), loading: false, error: '' })
    } catch {
      setWeeklyReport(s => ({ ...s, loading: false, error: 'Could not reach AI. Check your Groq API key.' }))
    }
  }, [habits, logs])

  const getStreakRecovery = useCallback(async (habitName: string, brokenStreak: number) => {
    setRecoveryMsg(s => ({ ...s, loading: true, error: '' }))
    try {
      const text = await generateStreakRecovery(habitName, brokenStreak)
      setRecoveryMsg({ text, generatedAt: new Date(), loading: false, error: '' })
    } catch {
      setRecoveryMsg(s => ({ ...s, loading: false, error: 'Could not reach AI.' }))
    }
  }, [])

  const sendChatMessage = useCallback(async (userMessage: string) => {
    const newMsg: ChatMessage = { role: 'user', content: userMessage, timestamp: new Date() }
    setChatHistory(h => [...h, newMsg])
    setChatLoading(true)
    try {
      const context = {
        habits: habits.map(h => ({
          name: h.name,
          category: h.category,
          streak: h.streak?.current_streak || 0,
          completedToday: h.completed_today,
        })),
        completedToday: habits.filter(h => h.completed_today).length,
        totalHabits: habits.length,
      }
      const logSummary = logs.length > 0 ? buildCoachLogSummary(habits, logs) : ''
      const history = [...chatHistory, newMsg].map(m => ({ role: m.role, content: m.content }))
      const reply = await generateCoachResponse(userMessage, context, history, logSummary)
      const assistantMsg: ChatMessage = { role: 'assistant', content: reply, timestamp: new Date() }
      setChatHistory(h => [...h, assistantMsg])
    } catch {
      setChatHistory(h => [...h, {
        role: 'assistant',
        content: 'Sorry, I couldn\'t connect to the AI. Please check your Groq API key.',
        timestamp: new Date(),
      }])
    } finally {
      setChatLoading(false)
    }
  }, [habits, logs, chatHistory])

  const clearChat = useCallback(() => setChatHistory([]), [])

  return {
    dailyInsight, getDailyInsight,
    weeklyReport, getWeeklyReport,
    recoveryMsg, getStreakRecovery,
    chatHistory, chatLoading,
    sendChatMessage, clearChat,
  }
}
