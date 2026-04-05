import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { supabase } from '../utils/supabase'
import type { User } from '../types/index'

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isMock = import.meta.env.VITE_SUPABASE_URL === undefined || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

  useEffect(() => {
    if (isMock) {
      // Auto-login a guest user if in mock mode
      setUser({
        id: 'guest-user-123',
        email: 'guest@habitly.app',
        full_name: 'Guest User',
        profile_pic_url: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        is_premium: false,
        created_at: new Date().toISOString()
      })
      setLoading(false)
      return
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUser(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch(() => setLoading(false))

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        await fetchUser(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [isMock])

  async function fetchUser(userId: string) {
    try {
      const { data } = await supabase.from('users').select('*').eq('id', userId).single()
      setUser(data as User)
    } catch {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  async function signUp(email: string, password: string, fullName: string) {
    if (isMock) {
      setUser({
        id: 'guest-user-123',
        email,
        full_name: fullName,
        profile_pic_url: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        is_premium: false,
        created_at: new Date().toISOString()
      })
      return
    }
    const { data: { user: authUser }, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    if (authUser) {
      await supabase.from('users').insert({
        id: authUser.id,
        email,
        full_name: fullName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      })
    }
  }

  async function signIn(email: string, password: string) {
    if (isMock) {
      setUser({
        id: 'guest-user-123',
        email,
        full_name: 'Guest User',
        profile_pic_url: null,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        is_premium: false,
        created_at: new Date().toISOString()
      })
      return
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }

  async function signOut() {
    if (isMock) {
      setUser(null)
      return
    }
    await supabase.auth.signOut()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
