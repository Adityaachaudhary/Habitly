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
  updateUser: (updates: Partial<User>) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => { },
  signIn: async () => { },
  signOut: async () => { },
  updateUser: () => { },
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isMock = import.meta.env.VITE_SUPABASE_URL === undefined || import.meta.env.VITE_SUPABASE_URL.includes('placeholder')

  useEffect(() => {
    // Safety failsafe: never stay in loading state more than 8 seconds
    const safetyTimer = setTimeout(() => {
      if (loading) {
        console.warn('Auth initialization taking too long, forcing loading to false')
        setLoading(false)
      }
    }, 8000)

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
      clearTimeout(safetyTimer)
      return
    }

    // Attempt to get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUser(session.user.id)
      } else {
        setLoading(false)
      }
    }).catch((e) => {
      console.error('Session fetch failed:', e instanceof Error ? e.message : 'unknown error')
      setLoading(false)
    })

    // Listen for changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_, session) => {
      if (session?.user) {
        await fetchUser(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => {
      clearTimeout(safetyTimer)
      subscription.unsubscribe()
    }
  }, [isMock])

  async function fetchUser(userId: string) {
    try {
      // Set a local timeout for this specific database call
      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Timeout')), 5000))
      const fetchPromise = supabase.from('users').select('*').eq('id', userId).single()

      const response = (await Promise.race([fetchPromise, timeoutPromise])) as any
      const data = response.data
      const error = response.error

      // If no profile exists yet, let's heal it by creating one
      if (error || !data) {
        // Only try healing if we have a valid auth session
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          const metaName = session.user.user_metadata?.full_name || ''
          const { data: newProfile, error: upsertError } = await supabase.from('users').upsert({
            id: userId,
            email: session.user.email,
            full_name: metaName,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          }).select().single()

          if (!upsertError && newProfile) {
            setUser(newProfile as User)
            return
          }
        }
      }

      if (data) {
        setUser(data as User)
      }
      // Note: We deliberately DO NOT set user to null here if fetch fails. 
      // We rely on the auth listener (onAuthStateChange) to handle actual sign-out events.
    } catch (err) {
      console.warn('Profile fetch hiccup (still logged in):', err instanceof Error ? err.message : 'unknown error')
    } finally {
      setLoading(false)
    }
  }

  function updateUser(updates: Partial<User>) {
    setUser(prev => prev ? { ...prev, ...updates } : prev)
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
    const { data: { user: authUser }, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName }
      }
    })

    if (error) throw error

    // Directly save the profile to ensure the name is captured immediately 
    // even if the database trigger is slow.
    if (authUser) {
      const { data: newProfile } = await supabase.from('users').upsert({
        id: authUser.id,
        email,
        full_name: fullName,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      }).select().single()

      if (newProfile) {
        setUser(newProfile as User)
      }
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
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
