import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

interface LeaderboardEntry {
  user_id: string
  current_streak: number
  users: { full_name: string | null; email: string } | null
}

export default function SocialPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'friends' | 'leaderboard' | 'groups'>('leaderboard')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [user])

  async function fetchLeaderboard() {
    const { data } = await supabase
      .from('habit_streaks')
      .select('user_id, current_streak, users(full_name, email)')
      .order('current_streak', { ascending: false })
      .limit(20)
    setLeaderboard((data as unknown as LeaderboardEntry[]) || [])
    setLoading(false)
  }

  const rankEmoji = (i: number) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}`

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>Social</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Compete, connect, and celebrate together</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: 'var(--border)' }}>
        {[
          { id: 'leaderboard', label: '🏆 Leaderboard' },
          { id: 'friends',     label: '👥 Friends' },
          { id: 'groups',      label: '🤝 Groups' },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
            style={{
              background: tab === t.id ? 'var(--card)' : 'transparent',
              color: tab === t.id ? 'var(--text)' : 'var(--muted)',
              boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Leaderboard */}
      {tab === 'leaderboard' && (
        <div className="animate-slide-up space-y-3">
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Global Streak Leaderboard</h3>
              <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Top longest current streaks</p>
            </div>
            {loading ? (
              <div className="p-5 space-y-3">
                {[1,2,3,4,5].map(i => <div key={i} className="skeleton h-10 w-full" />)}
              </div>
            ) : leaderboard.length === 0 ? (
              <div className="p-8 text-center" style={{ color: 'var(--muted)' }}>
                No streaks yet. Be the first! 🚀
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {leaderboard.map((entry, i) => {
                  const isMe = entry.user_id === user?.id
                  return (
                    <div
                      key={entry.user_id}
                      className="flex items-center gap-4 px-5 py-3 transition-colors"
                      style={{ background: isMe ? 'var(--primary-50, #f0fdf4)' : 'transparent' }}
                    >
                      <span className="text-lg w-8 text-center flex-shrink-0">{rankEmoji(i)}</span>
                      <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                        {(entry.users?.full_name || entry.users?.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate" style={{ color: 'var(--text)' }}>
                          {entry.users?.full_name || entry.users?.email?.split('@')[0] || 'Anonymous'}
                          {isMe && <span className="ml-2 text-xs text-primary-600">(you)</span>}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-base">🔥</span>
                        <span className="font-bold text-sm" style={{ color: 'var(--text)' }}>{entry.current_streak}</span>
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>days</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Friends */}
      {tab === 'friends' && (
        <div className="animate-slide-up card p-12 text-center">
          <div className="text-5xl mb-4">👥</div>
          <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>Friends</h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Adding friends and tracking their progress is coming soon.
          </p>
          <span className="mt-4 inline-block text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#fffbeb', color: '#d97706' }}>
            Coming soon
          </span>
        </div>
      )}

      {/* Groups - coming soon */}
      {tab === 'groups' && (
        <div className="animate-slide-up card p-12 text-center">
          <div className="text-5xl mb-4">🤝</div>
          <h3 className="font-display font-bold text-lg mb-2" style={{ color: 'var(--text)' }}>Habit Groups</h3>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Group challenges are coming soon. Build habits together with friends!
          </p>
          <span className="mt-4 inline-block text-xs px-3 py-1 rounded-full font-medium" style={{ background: '#fffbeb', color: '#d97706' }}>
            Coming soon
          </span>
        </div>
      )}
    </div>
  )
}
