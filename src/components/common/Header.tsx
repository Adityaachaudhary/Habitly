import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LogOut, ChevronDown, Sun, Moon, Menu } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useTheme } from '../../context/ThemeContext'
import { cn } from '../../utils/helpers'

interface HeaderProps {
  onOpenMobileNav?: () => void
}

export default function Header({ onOpenMobileNav }: HeaderProps) {
  const { user, signOut } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)

  async function handleSignOut() {
    await signOut()
    navigate('/')
  }

  return (
    <header className="h-14 border-b flex items-center justify-between px-4 sm:px-6 gap-3 sm:gap-4 bg-glass-bg backdrop-blur-3xl relative z-[100]" style={{ borderColor: 'var(--glass-border)' }}>
      <button
        type="button"
        onClick={onOpenMobileNav}
        className="md:hidden btn-ghost p-2 rounded-xl transition-all active:scale-90 flex items-center justify-center h-10 w-10"
        title="Open navigation"
        style={{ color: 'var(--text)' }}
      >
        <Menu size={20} />
      </button>
      <div className="flex items-center gap-2 sm:gap-3 ml-auto">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="btn-ghost p-2 rounded-xl transition-all active:scale-90 flex items-center justify-center h-10 w-10"
          title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          style={{ color: 'var(--text)' }}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        {/* User profile with dropdown */}
        {user && (
        <div className="relative">
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border bg-black/5 dark:bg-white/5 transition-all" 
            style={{ borderColor: 'var(--glass-border)' }}
          >
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-black shadow-sm border-2 border-primary-500">
              {user.full_name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-black truncate leading-tight" style={{ color: 'var(--text)' }}>
                {user.full_name || 'User'}
              </p>
            </div>
            <ChevronDown size={14} className={cn('transition-transform duration-200', showMenu && 'rotate-180')} />
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <>
              <div className="fixed inset-0 z-[101]" onClick={() => setShowMenu(false)} />
              <div 
                className="absolute right-0 top-12 z-[102] w-48 glass-card py-2 shadow-2xl animate-bounce-in origin-top-right overflow-hidden border" 
                style={{ 
                  borderColor: 'var(--glass-border)',
                  background: 'var(--card)', // Opaque background from current theme
                  boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                }}
              >
                <div className="px-4 py-2 border-b mb-1" style={{ borderColor: 'var(--glass-border)' }}>
                  <p className="text-[10px] uppercase font-black tracking-widest opacity-50 mb-0.5" style={{ color: 'var(--muted)' }}>Account Status</p>
                  <p className="text-[10px] font-black" style={{ color: user.is_premium ? '#f59e0b' : 'var(--text)' }}>
                    {user.is_premium ? '✨ Premium Member' : 'Free Plan'}
                  </p>
                </div>
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm font-bold text-red-500 transition-colors"
                >
                  <LogOut size={16} />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      )}
      </div>
    </header>
  )
}
