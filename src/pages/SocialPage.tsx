import { useState, useEffect } from 'react'
import { UserPlus, Users, Search } from 'lucide-react'
import { supabase } from '../utils/supabase'
import { useAuth } from '../context/AuthContext'

interface Friend {
  id: string
  full_name: string | null
  email: string
  is_premium: boolean
  top_streak?: number
}

interface LeaderboardEntry {
  user_id: string
  current_streak: number
  users: { full_name: string | null; email: string } | null
}

export default function SocialPage() {
  const { user } = useAuth()
  const [tab, setTab] = useState<'friends' | 'leaderboard' | 'groups'>('leaderboard')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [friends, setFriends] = useState<Friend[]>([])
  const [addEmail, setAddEmail] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [addMsg, setAddMsg] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
    if (user) fetchFriends()
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

  async function fetchFriends() {
    if (!user) return
    const { data } = await supabase
      .from('friendships')
      .select('user_id_2, users!friendships_user_id_2_fkey(id, full_name, email, is_premium)')
      .eq('user_id_1', user.id)
      .eq('status', 'accepted')
    setFriends((data || []).map((f: any) => f.users).filter(Boolean))
  }

  async function handleAddFriend(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !addEmail.trim()) return
    setAddLoading(true)
    setAddMsg('')
    try {
      const { data: friend } = await supabase
        .from('users')
        .select('id')
        .eq('email', addEmail.trim())
        .single()

      if (!friend) { setAddMsg('User not found.'); return }
      if (friend.id === user.id) { setAddMsg("That's you!"); return }

      const { error } = await supabase.from('friendships').insert({
        user_id_1: user.id,
        user_id_2: friend.id,
        status: 'accepted',
      })
      if (error) { setAddMsg('Already friends or error occurred.'); return }
      setAddMsg('Friend added! 🎉')
      setAddEmail('')
      fetchFriends()
    } finally {
      setAddLoading(false)
    }
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
        <div className="animate-slide-up space-y-4">
          {/* Add friend */}
          <div className="card p-5">
            <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--text)' }}>Add a Friend</h3>
            <form onSubmit={handleAddFriend} className="flex gap-2">
              <div className="relative flex-1">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted)' }} />
                <input
                  type="email"
                  value={addEmail}
                  onChange={e => setAddEmail(e.target.value)}
                  className="input pl-9"
                  placeholder="Enter friend's email..."
                />
              </div>
              <button type="submit" disabled={addLoading || !addEmail.trim()} className="btn-primary flex-shrink-0">
                <UserPlus size={16} />
                {addLoading ? 'Adding...' : 'Add'}
              </button>
            </form>
            {addMsg && (
              <p className="text-xs mt-2" style={{ color: addMsg.includes('🎉') ? '#22c55e' : '#ef4444' }}>
                {addMsg}
              </p>
            )}
          </div>

          {/* Friends list */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>
                My Friends ({friends.length})
              </h3>
            </div>
            {friends.length === 0 ? (
              <div className="p-8 text-center">
                <Users size={32} className="mx-auto mb-3" style={{ color: 'var(--muted)' }} />
                <p className="text-sm" style={{ color: 'var(--muted)' }}>No friends yet. Add one above!</p>
              </div>
            ) : (
              <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
                {friends.map(f => (
                  <div key={f.id} className="flex items-center gap-3 px-5 py-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                      {(f.full_name || f.email)[0].toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm" style={{ color: 'var(--text)' }}>
                        {f.full_name || f.email.split('@')[0]}
                      </p>
                      <p className="text-xs truncate" style={{ color: 'var(--muted)' }}>{f.email}</p>
                    </div>
                    {f.is_premium && (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: '#fffbeb', color: '#d97706' }}>
                        ✨ Pro
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
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
