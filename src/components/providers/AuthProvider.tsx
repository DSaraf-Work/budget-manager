'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { sessionManager } from '@/lib/auth/session-manager'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshSession: () => Promise<boolean>
  sessionExpiry: {
    expiresAt: number | null
    timeUntilExpiry: number | null
  }
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  isAuthenticated: false,
  signOut: async () => {},
  refreshSession: async () => false,
  sessionExpiry: { expiresAt: null, timeUntilExpiry: null },
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpiry, setSessionExpiry] = useState<{
    expiresAt: number | null
    timeUntilExpiry: number | null
  }>({ expiresAt: null, timeUntilExpiry: null })

  const supabase = createClient()

  // Update session expiry information
  const updateSessionExpiry = async () => {
    try {
      const expiry = await sessionManager.getSessionExpiry()
      setSessionExpiry(expiry)
    } catch (error) {
      console.error('Error updating session expiry:', error)
    }
  }

  useEffect(() => {
    let mounted = true

    // Initialize session with persistent session manager
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth with session manager...')
        const { user: currentUser, session: currentSession } = await sessionManager.getCurrentSession()
        
        if (mounted) {
          setUser(currentUser)
          setSession(currentSession)
          setLoading(false)
          
          if (currentSession) {
            console.log('Found existing session for user:', currentUser?.email)
            await updateSessionExpiry()
          } else {
            console.log('No existing session found')
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setUser(null)
          setSession(null)
          setLoading(false)
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    // Listen for auth state changes with enhanced session management
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change in AuthProvider:', event, session?.user?.email)
        
        setUser(session?.user ?? null)
        setSession(session)
        setLoading(false)
        
        if (session) {
          await updateSessionExpiry()
        } else {
          setSessionExpiry({ expiresAt: null, timeUntilExpiry: null })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Update session expiry periodically
  useEffect(() => {
    if (!session) return

    const interval = setInterval(async () => {
      await updateSessionExpiry()
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [session])

  const signOut = async () => {
    setLoading(true)
    try {
      console.log('Signing out user...')
      await sessionManager.signOut()
      // State will be updated by the auth state change listener
    } catch (error) {
      console.error('Error signing out:', error)
      setLoading(false)
    }
  }

  const refreshSession = async (): Promise<boolean> => {
    try {
      console.log('Manually refreshing session...')
      const success = await sessionManager.refreshSession()
      if (success) {
        await updateSessionExpiry()
      }
      return success
    } catch (error) {
      console.error('Error refreshing session:', error)
      return false
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      loading, 
      isAuthenticated: !!user,
      signOut,
      refreshSession,
      sessionExpiry,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook for protected routes that require authentication
export const useRequireAuth = () => {
  const { user, loading, isAuthenticated } = useAuth()
  
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      console.log('User not authenticated, redirecting to login...')
      window.location.href = '/auth/login'
    }
  }, [loading, isAuthenticated])

  return { user, loading, isAuthenticated }
}
