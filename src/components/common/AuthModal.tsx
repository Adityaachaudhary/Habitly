import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { Eye, EyeOff, X } from 'lucide-react'

interface AuthModalProps {
  isOpen: boolean
  onClose: () => void
  initialMode?: 'login' | 'signup'
}

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }: AuthModalProps) {
  const { signIn, signUp, resetPassword } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'signup' | 'forgot_password'>(initialMode)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [notice, setNotice] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', password: '' })

  if (!isOpen) return null

  function setField(field: string, value: string) {
    setForm(f => ({ ...f, [field]: value }))
    setError('')
    setNotice('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setNotice('')
    if (mode === 'forgot_password') {
      if (!form.email.trim()) {
        setError('Email is required')
        return
      }
      setLoading(true)
      try {
        await resetPassword(form.email)
        setNotice('Password reset email sent. Check your inbox and spam folder.')
      } catch (err: any) {
        setError(err.message || 'Could not send reset email. Please try again.')
      } finally {
        setLoading(false)
      }
      return
    }
    if (mode === 'signup') {
      if (!form.name.trim()) { setError('Name is required'); return }
      if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    }
    setLoading(true)
    try {
      if (mode === 'signup') {
        await signUp(form.email, form.password, form.name)
      } else {
        await signIn(form.email, form.password)
      }
      onClose()
      navigate('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div
        className="w-full max-w-md glass-card overflow-hidden relative z-10 animate-scale-in"
        style={{ background: 'var(--card)', borderColor: 'var(--border)' }}
      >
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl transition-all"
          style={{ color: 'var(--muted)' }}
        >
          <X size={20} />
        </button>

        <div className="p-8 lg:p-10">
          <div className="text-center mb-8">
            <h2 className="font-display font-bold text-3xl mb-2 tracking-tight" style={{ color: 'var(--text)' }}>
              {mode === 'login' ? 'Welcome Back' : mode === 'signup' ? 'Create Account' : 'Reset Password'}
            </h2>
            <p className="text-sm font-medium" style={{ color: 'var(--muted)' }}>
              {mode === 'login'
                ? 'Sign in to continue tracking your habits.'
                : mode === 'signup'
                  ? 'Start your journey with Habitly today.'
                  : 'Enter your account email to receive a password reset link.'}
            </p>
          </div>

          {/* Toggle */}
          <div className="flex gap-1 p-1 rounded-xl mb-8" style={{ background: 'rgba(0,0,0,0.05)' }}>
            {(['login', 'signup'] as const).map(m => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(''); setNotice('') }}
                className="flex-1 py-2 rounded-lg text-sm font-semibold capitalize transition-all"
                style={{
                  background: mode === m ? 'var(--bg)' : 'transparent',
                  color: mode === m ? 'var(--text)' : 'var(--muted)',
                  boxShadow: mode === m ? '0 2px 8px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                {m === 'login' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide opacity-60" style={{ color: 'var(--text)' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={form.name}
                  onChange={e => setField('name', e.target.value)}
                  className="input px-4 py-3 rounded-xl border w-full outline-none focus:border-primary-500 transition-all font-medium text-sm"
                  style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                  placeholder="Your full name"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide opacity-60" style={{ color: 'var(--text)' }}>
                Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={e => setField('email', e.target.value)}
                className="input px-4 py-3 rounded-xl border w-full outline-none focus:border-primary-500 transition-all font-medium text-sm"
                style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                placeholder="you@example.com"
                required
              />
            </div>

            {mode !== 'forgot_password' && (
              <div>
                <label className="block text-xs font-bold mb-1.5 uppercase tracking-wide opacity-60" style={{ color: 'var(--text)' }}>
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    value={form.password}
                    onChange={e => setField('password', e.target.value)}
                    className="input px-4 py-3 rounded-xl border w-full outline-none focus:border-primary-500 transition-all font-medium text-sm pr-10"
                    style={{ background: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}
                    placeholder="••••••••"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(s => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted)' }}
                  >
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'login' && (
              <div className="text-right -mt-1">
                <button
                  type="button"
                  onClick={() => { setMode('forgot_password'); setError(''); setNotice('') }}
                  className="text-xs font-semibold text-primary-600"
                >
                  Forgot password?
                </button>
              </div>
            )}

            {error && (
              <p className="text-xs px-4 py-3 rounded-xl border animate-slide-up"
                style={{ background: 'rgba(239, 68, 68, 0.05)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                {error}
              </p>
            )}
            {notice && (
              <p
                className="text-xs px-4 py-3 rounded-xl border animate-slide-up"
                style={{ background: 'rgba(34, 197, 94, 0.08)', color: '#166534', borderColor: 'rgba(34, 197, 94, 0.25)' }}
              >
                {notice}
              </p>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3.5 mt-4 rounded-xl font-bold shadow-lg shadow-primary-500/20 active:scale-95 transition-all">
              {loading
                ? 'Please wait...'
                : mode === 'login'
                  ? 'Sign in to Habitly'
                  : mode === 'signup'
                    ? 'Create your Account'
                    : 'Send reset link'}
            </button>
          </form>

          <p className="text-center text-xs mt-8" style={{ color: 'var(--muted)' }}>
            {mode === 'login' ? "Don't have an account? " : mode === 'signup' ? 'Already have an account? ' : 'Remembered your password? '}
            <button
              onClick={() => {
                const next =
                  mode === 'login'
                    ? 'signup'
                    : mode === 'signup'
                      ? 'login'
                      : 'login'
                setMode(next)
                setError('')
                setNotice('')
              }}
              className="font-bold underline text-primary-600 transition-transform"
            >
              {mode === 'login' ? 'Sign up free' : 'Sign in here'}
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}
