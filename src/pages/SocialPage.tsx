import { useState, useEffect } from 'react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'
import { Trophy, Users, Handshake, Rocket, Flame } from 'lucide-react'
import { cn } from '../utils/helpers'

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


  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif italic text-5xl tracking-tight" style={{ color: 'var(--text)' }}>Social</h1>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] mt-2 opacity-40" style={{ color: 'var(--muted)' }}>
          Compete • Connect • Celebrate
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 rounded-2xl w-fit" style={{ background: 'var(--border)', opacity: 0.8 }}>
        {[
          { id: 'leaderboard', label: 'Leaderboard', Icon: Trophy },
          { id: 'friends',     label: 'Friends',     Icon: Users },
          { id: 'groups',      label: 'Groups',      Icon: Handshake },
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as typeof tab)}
            className="px-6 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 uppercase tracking-widest"
            style={{
              background: tab === t.id ? 'var(--card)' : 'transparent',
              color: tab === t.id ? 'var(--text)' : 'var(--muted)'
            }}
          >
            <t.Icon size={14} strokeWidth={2.5} />
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
              <div className="p-8 text-center flex flex-col items-center gap-3" style={{ color: 'var(--muted)' }}>
                <Rocket size={32} className="opacity-20" />
                <p>No streaks yet. Be the first!</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {leaderboard.map((entry, i) => {
                  const isMe = entry.user_id === user?.id
                  const isTop3 = i < 3
                  const rankColors = ['#fbbf24', '#94a3b8', '#b45309'] // Gold, Silver, Bronze
                  
                  return (
                    <div
                      key={entry.user_id}
                      className="flex items-center gap-4 px-5 py-4 transition-colors"
                      style={{ background: isMe ? 'rgba(var(--primary-600-rgb), 0.05)' : 'transparent' }}
                    >
                      <div className="w-10 flex-shrink-0 flex items-center justify-center">
                        {isTop3 ? (
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center shadow-sm"
                            style={{ background: rankColors[i] + '20', color: rankColors[i], border: `1px solid ${rankColors[i]}40` }}
                          >
                            <Trophy size={14} strokeWidth={3} />
                          </div>
                        ) : (
                          <span className="text-xs font-black opacity-30" style={{ color: 'var(--text)' }}>#{i + 1}</span>
                        )}
                      </div>
                      <div className="w-10 h-10 rounded-2xl bg-white dark:bg-black/20 shadow-sm border border-black/5 flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                        {(entry.users?.full_name || entry.users?.email || '?')[0].toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm truncate" style={{ color: 'var(--text)' }}>
                          {entry.users?.full_name || entry.users?.email?.split('@')[0] || 'Anonymous'}
                          {isMe && <span className="ml-2 text-[10px] font-black uppercase tracking-widest text-primary-600">You</span>}
                        </p>
                        <p className="text-[10px] uppercase font-bold tracking-widest opacity-40 mt-0.5" style={{ color: 'var(--muted)' }}>
                          Consistency Score: {Math.round(entry.current_streak * 1.5)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 bg-white dark:bg-black/20 px-3 py-1.5 rounded-xl border border-black/5 shadow-sm">
                        <Flame size={14} className={cn(entry.current_streak > 0 ? "text-orange-500" : "text-gray-300")} />
                        <span className="font-display font-black text-sm" style={{ color: 'var(--text)' }}>{entry.current_streak}</span>
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
          <div className="flex justify-center mb-4 text-primary-500/20">
            <Users size={64} />
          </div>
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
          <div className="flex justify-center mb-4 text-primary-500/20">
            <Handshake size={64} />
          </div>
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
