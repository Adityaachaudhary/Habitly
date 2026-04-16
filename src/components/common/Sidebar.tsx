import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, BarChart2, Settings,
  ChevronLeft, ChevronRight
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '../../utils/helpers'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS: { to: string; icon: any; label: string; premium?: boolean }[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
  // { to: '/ai-coach',  icon: Sparkles,        label: 'AI Coach',   premium: true },
  // { to: '/social',    icon: Users,           label: 'Social' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

interface SidebarProps {
  mobileOpen?: boolean
  onCloseMobile?: () => void
}

export default function Sidebar({ mobileOpen = false, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const { user } = useAuth()

  const canAccessAI = user?.is_premium || user?.id === 'guest-user-123'
  const filteredNav = NAV_ITEMS.filter(item => !item.premium || canAccessAI)

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden fixed inset-0 z-[140] bg-black/35 backdrop-blur-[1px]"
          aria-label="Close navigation"
        />
      )}
      <aside
        className={cn(
          'fixed md:relative top-0 left-0 flex flex-col h-full transition-all duration-300 z-[150] md:z-20',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
        style={{
          width: collapsed ? '72px' : '224px',
          background: 'var(--glass-bg)',
          backdropFilter: 'blur(24px)',
          borderRight: '1px solid var(--glass-border)',
          flexShrink: 0,
        }}
      >

        {/* Logo */}
        <div
          className={cn(
            "flex items-center px-6 border-b transition-all duration-300",
            collapsed ? "pt-8 pb-4 justify-center" : "py-8 justify-between"
          )}
          style={{ borderColor: 'var(--glass-border)' }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-primary-500 flex items-center justify-center flex-shrink-0 shadow-lg cursor-pointer">
              <span className="text-white text-lg font-bold">H</span>
            </div>
            {!collapsed && (
              <span className="font-display font-bold text-xl tracking-tight" style={{ color: 'var(--text)' }}>
                Habitly
              </span>
            )}
          </div>

          {!collapsed && (
            <button
              onClick={() => setCollapsed(true)}
              className="p-2 rounded-xl transition-colors"
              style={{ color: 'var(--muted)' }}
            >
              <ChevronLeft size={20} strokeWidth={2.5} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-hidden">
          {collapsed && (
            <button
              onClick={() => setCollapsed(false)}
              className="w-full flex justify-center py-4 rounded-xl transition-all duration-200"
              style={{ color: 'var(--muted)' }}
            >
              <ChevronRight size={20} strokeWidth={2.5} />
            </button>
          )}
          {filteredNav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `nav-link px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'active shadow-sm' : ''} ${collapsed ? 'justify-center' : ''}`
              }
              title={collapsed ? label : undefined}
            >
              <Icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="font-medium">{label}</span>}
            </NavLink>
          ))}

          {/* Premium */}
          {/* <NavLink
          to="/premium"
          className={({ isActive }) =>
            `nav-link mt-4 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'active shadow-sm' : ''} ${collapsed ? 'justify-center border-t border-amber-100/20 pt-6' : ''}`
          }
          title={collapsed ? 'Premium' : undefined}
          style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}
        >
          <Zap size={20} className="flex-shrink-0 animate-pulse" />
          {!collapsed && <span className="font-bold tracking-tight">Premium</span>}
        </NavLink> */}
        </nav>
      </aside>
    </>
  )
}
