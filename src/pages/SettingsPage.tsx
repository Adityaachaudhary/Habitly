import { useState } from 'react'
import { User, Bell, Shield, Download, Trash2, Award } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useAchievements } from '../context/AchievementsContext'
import { BADGE_DEFINITIONS } from '../types'
import { useTheme } from '../context/ThemeContext'
import { supabase } from '../utils/supabase'

export default function SettingsPage() {
  const { user, signOut } = useAuth()
  const { achievements, loading: achievementsLoading } = useAchievements()
  const { theme, toggleTheme } = useTheme()
  const [name, setName] = useState(user?.full_name || '')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSaveName(e: React.FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    await supabase.from('users').update({ full_name: name }).eq('id', user.id)
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const sections = [
    {
      icon: <User size={18} />, title: 'Profile',
      content: (
        <form onSubmit={handleSaveName} className="space-y-3">
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="input"
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1.5 uppercase tracking-wide" style={{ color: 'var(--muted)' }}>
              Email
            </label>
            <input
              type="email"
              value={user?.email || ''}
              disabled
              className="input opacity-60 cursor-not-allowed"
            />
          </div>
          <button type="submit" disabled={saving} className="btn-primary">
            {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      ),
    },
    {
      icon: <Bell size={18} />, title: 'Notifications',
      content: (
        <div className="space-y-4">
          {[
            { label: 'Streak reminders', sub: 'Alert before you lose a streak', defaultOn: true },
            { label: 'Daily check-in', sub: 'Morning reminder to track habits', defaultOn: false },
            { label: 'Weekly report', sub: 'Summary every Sunday', defaultOn: true },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{item.label}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{item.sub}</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked={item.defaultOn} className="sr-only peer" />
                <div className="w-10 h-5 rounded-full peer-checked:bg-primary-500 transition-colors" style={{ background: 'var(--border)' }}>
                  <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform peer-checked:translate-x-5" />
                </div>
              </label>
            </div>
          ))}
        </div>
      ),
    },
    {
      icon: <Shield size={18} />, title: 'Appearance',
      content: (
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Dark mode</p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>Switch between light and dark theme</p>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all border"
            style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
          >
            {theme === 'dark' ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      ),
    },
    {
      icon: <Download size={18} />, title: 'Data',
      content: (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Export your habit data as a CSV file for backup or analysis.
          </p>
          <button className="btn-ghost border" style={{ borderColor: 'var(--border)' }}>
            <Download size={14} /> Export CSV
          </button>
        </div>
      ),
    },
    {
      icon: <Trash2 size={18} className="text-red-500" />, title: 'Danger Zone',
      content: (
        <div className="space-y-3">
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            These actions are permanent and cannot be undone.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={signOut}
              className="text-sm font-medium px-4 py-2 rounded-xl border transition-all"
              style={{ borderColor: '#ef4444', color: '#ef4444' }}
            >
              Sign out
            </button>
            <button
              onClick={() => confirm('Delete all your data? This cannot be undone.') && alert('Contact support to delete your account.')}
              className="text-sm font-medium px-4 py-2 rounded-xl border transition-all"
              style={{ borderColor: '#ef4444', color: '#ef4444' }}
            >
              Delete account
            </button>
          </div>
        </div>
      ),
    },
  ]

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display font-bold text-2xl" style={{ color: 'var(--text)' }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Manage your account and preferences</p>
      </div>

      {/* Unlocked badges */}
      <div className="card overflow-hidden">
        <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
          <Award size={18} style={{ color: 'var(--muted)' }} />
          <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>Badges</h3>
        </div>
        <div className="p-5">
          {achievementsLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="skeleton h-24 rounded-xl" />
              ))}
            </div>
          ) : achievements.length === 0 ? (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              Complete a 7- or 21-day streak on a habit, or hit 7 / 21 full days (every daily habit done) to earn badges. They will show up here.
            </p>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {achievements.map(a => {
                const def = BADGE_DEFINITIONS[a.badge_name]
                return (
                  <li
                    key={a.id}
                    className="flex items-start gap-3 p-4 rounded-xl border"
                    style={{ borderColor: 'var(--border)', background: 'rgba(0,0,0,0.02)' }}
                  >
                    <span className="text-2xl flex-shrink-0">{def?.emoji ?? '🏅'}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm" style={{ color: 'var(--text)' }}>
                        {def?.label ?? a.badge_name}
                      </p>
                      {a.habit_id && (
                        <p className="text-[11px] mt-0.5 font-medium" style={{ color: 'var(--muted)' }}>
                          Habit milestone
                        </p>
                      )}
                      <p className="text-xs mt-1 leading-snug" style={{ color: 'var(--muted)' }}>
                        {def?.description ?? ''}
                      </p>
                      <p className="text-[10px] mt-2 opacity-60" style={{ color: 'var(--muted)' }}>
                        {new Date(a.unlocked_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </div>

      {/* Account badge */}
      <div className="card p-4 flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
          {(user?.full_name || user?.email || '?')[0].toUpperCase()}
        </div>
        <div>
          <p className="font-semibold" style={{ color: 'var(--text)' }}>{user?.full_name || 'User'}</p>
          <p className="text-xs" style={{ color: 'var(--muted)' }}>{user?.email}</p>
        </div>
        <div className="ml-auto">
          <span
            className="text-xs px-3 py-1 rounded-full font-semibold"
            style={{
              background: user?.is_premium ? '#fffbeb' : 'var(--primary-50, #f0fdf4)',
              color: user?.is_premium ? '#d97706' : '#16a34a',
            }}
          >
            {user?.is_premium ? '✨ Premium' : '🌱 Free'}
          </span>
        </div>
      </div>

      {/* Settings sections */}
      {sections.map(({ icon, title, content }) => (
        <div key={title} className="card overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <span style={{ color: 'var(--muted)' }}>{icon}</span>
            <h3 className="font-semibold text-sm" style={{ color: 'var(--text)' }}>{title}</h3>
          </div>
          <div className="p-5">{content}</div>
        </div>
      ))}
    </div>
  )
}
