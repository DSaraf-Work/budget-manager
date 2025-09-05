'use client'

import { useState, useEffect, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { sessionManager } from '@/lib/auth/session-manager'
import { createClient } from '@/lib/supabase/client'

interface UseSessionReturn {
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

export function useSession(): UseSessionReturn {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [sessionExpiry, setSessionExpiry] = useState<{
    expiresAt: number | null
    timeUntilExpiry: number | null
  }>({ expiresAt: null, timeUntilExpiry: null })

  const supabase = createClient()

  // Update session expiry information
  const updateSessionExpiry = useCallback(async () => {
    const expiry = await sessionManager.getSessionExpiry()
    setSessionExpiry(expiry)
  }, [])

  // Initialize session on mount
  useEffect(() => {
    let mounted = true

    const initializeSession = async () => {
      try {
        const { user: currentUser, session: currentSession } = await sessionManager.getCurrentSession()
        
        if (mounted) {
          setUser(currentUser)
          setSession(currentSession)
          setLoading(false)
          
          if (currentSession) {
            await updateSessionExpiry()
          }
        }
      } catch (error) {
        console.error('Error initializing session:', error)
        if (mounted) {
          setUser(null)
          setSession(null)
          setLoading(false)
        }
      }
    }

    initializeSession()

    return () => {
      mounted = false
    }
  }, [updateSessionExpiry])

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change in useSession:', event)
        
        setUser(session?.user || null)
        setSession(session)
        
        if (session) {
          await updateSessionExpiry()
        } else {
          setSessionExpiry({ expiresAt: null, timeUntilExpiry: null })
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth, updateSessionExpiry])

  // Update session expiry periodically
  useEffect(() => {
    if (!session) return

    const interval = setInterval(async () => {
      await updateSessionExpiry()
    }, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [session, updateSessionExpiry])

  // Sign out function
  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await sessionManager.signOut()
      // State will be updated by the auth state change listener
    } catch (error) {
      console.error('Error signing out:', error)
      setLoading(false)
    }
  }, [])

  // Refresh session function
  const refreshSession = useCallback(async (): Promise<boolean> => {
    try {
      const success = await sessionManager.refreshSession()
      if (success) {
        await updateSessionExpiry()
      }
      return success
    } catch (error) {
      console.error('Error refreshing session:', error)
      return false
    }
  }, [updateSessionExpiry])

  return {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    signOut,
    refreshSession,
    sessionExpiry,
  }
}

// Hook for checking authentication status only
export function useAuth(): { isAuthenticated: boolean; loading: boolean; user: User | null } {
  const { isAuthenticated, loading, user } = useSession()
  return { isAuthenticated, loading, user }
}

// Hook for protected routes
export function useRequireAuth(): { user: User; session: Session; loading: boolean } {
  const { user, session, loading } = useSession()
  
  useEffect(() => {
    if (!loading && !user) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login'
    }
  }, [user, loading])

  return {
    user: user!,
    session: session!,
    loading,
  }
}
