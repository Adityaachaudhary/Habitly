import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { AuthProvider, useAuth } from './context/AuthContext'
import { HabitsProvider } from './context/HabitsContext'
import { WeekReviewProvider } from './context/WeekReviewContext'
import { AchievementsProvider, useAchievements } from './context/AchievementsContext'
import BadgeUnlockToast from './components/BadgeUnlockToast'
import AppLayout from './components/common/AppLayout'
import HomePage from './pages/HomePage'
import DashboardPage from './pages/DashboardPage'
import AnalyticsPage from './pages/AnalyticsPage'
import SocialPage from './pages/SocialPage'
import SettingsPage from './pages/SettingsPage'
import PremiumPage from './pages/PremiumPage'
import AICoachPage from './pages/AICoachPage'

function AppLayoutWithAchievements() {
  const { toastQueue, dismissToast } = useAchievements()
  return (
    <>
      <BadgeUnlockToast item={toastQueue[0]} onDismiss={dismissToast} />
      <AppLayout />
    </>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-2xl bg-primary-500 flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <div className="flex gap-1.5">
            {[0,1,2].map(i => (
              <div key={i} className="w-2 h-2 rounded-full" style={{
                background: '#4ade80',
                animation: `bounce 1s ease-in-out ${i*0.15}s infinite`,
              }} />
            ))}
          </div>
        </div>
      </div>
    )
  }
  if (!user) return <Navigate to="/" replace />
  return <>{children}</>
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return null
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <HomePage />} />
      <Route element={
        <ProtectedRoute>
          <HabitsProvider>
            <WeekReviewProvider>
              <AchievementsProvider>
                <AppLayoutWithAchievements />
              </AchievementsProvider>
            </WeekReviewProvider>
          </HabitsProvider>
        </ProtectedRoute>
      }>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/analytics"  element={<AnalyticsPage />} />
        <Route path="/social"     element={<SocialPage />} />
        <Route path="/settings"   element={<SettingsPage />} />
        <Route path="/premium"    element={<PremiumPage />} />
        <Route path="/ai-coach"   element={<AICoachPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
