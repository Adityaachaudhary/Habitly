const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || ''
const GROQ_MODEL = 'llama-3.3-70b-versatile'

export async function generateInsight(prompt: string): Promise<string> {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500,
    }),
  })
  const data = await response.json()
  return data.choices?.[0]?.message?.content || ''
}

export async function generateHabitInsight(statsBlock: string): Promise<string> {
  const prompt = `You are a supportive habit coach. Use ONLY the real data below (computed from the user's last 7 days of logs, not guesses).

${statsBlock}

Give ONE short, specific, encouraging insight (2 sentences max). Reference an actual pattern from the data when possible. Be warm, practical, no emojis.`
  return generateInsight(prompt)
}

export async function generateWeeklyReport(statsBlock: string): Promise<string> {
  const prompt = `You are a habit coach. The block below is REAL data from the user's logs (last 7 days per habit, plus ~4-week weekday patterns, plus "full day" streak = every daily habit completed).

${statsBlock}

Write an encouraging 3–4 sentence weekly-style summary that reflects this data. Name which habits are strong vs need support if clear from the numbers. One concrete, small actionable tip. Warm tone, no guilt.`
  return generateInsight(prompt)
}

export async function generateStreakRecovery(habitName: string, brokenStreak: number): Promise<string> {
  const prompt = `A user just broke their ${brokenStreak}-day streak on "${habitName}". 
Write a 2-sentence supportive message that acknowledges the achievement and helps them restart without guilt. Be warm, not preachy.`
  return generateInsight(prompt)
}

export interface CoachContext {
  habits: { name: string; category: string; streak: number; completedToday: boolean }[]
  completedToday: number
  totalHabits: number
}

export async function generateCoachResponse(
  userMessage: string,
  context: CoachContext,
  history: { role: 'user' | 'assistant'; content: string }[],
  logDerivedSummary?: string
): Promise<string> {
  const logBlock = logDerivedSummary?.trim()
    ? `\n\nRecent log-derived summary (trust this for patterns):\n${logDerivedSummary.trim()}`
    : ''
  const systemPrompt = `You are a warm, knowledgeable habit coach. You have access to the user's current habit data:
- Total habits: ${context.totalHabits}
- Completed today: ${context.completedToday}/${context.totalHabits}
- Habits: ${context.habits.map(h => `${h.name} (${h.category}, ${h.streak}d streak, ${h.completedToday ? 'done today' : 'not done today'})`).join('; ')}${logBlock}

Be specific, practical, and encouraging. Keep responses concise (3-5 sentences max unless asked for more). Never be preachy or guilt-inducing.`

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${GROQ_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        ...history.slice(-10),
        { role: 'user', content: userMessage },
      ],
      max_tokens: 400,
    }),
  })
  const data = await response.json()
  return data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.'
}