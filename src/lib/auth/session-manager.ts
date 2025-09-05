import { createClient } from '@/lib/supabase/client'
import { User, Session } from '@supabase/supabase-js'

export class SessionManager {
  private static instance: SessionManager
  private supabase = createClient()
  private sessionCheckInterval: NodeJS.Timeout | null = null
  private readonly SESSION_CHECK_INTERVAL = 5 * 60 * 1000 // 5 minutes
  private readonly TOKEN_REFRESH_THRESHOLD = 10 * 60 * 1000 // 10 minutes before expiry

  private constructor() {
    this.initializeSessionManagement()
  }

  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  /**
   * Initialize session management with automatic refresh
   */
  private initializeSessionManagement(): void {
    // Set up auth state change listener
    this.supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.email)
      
      switch (event) {
        case 'SIGNED_IN':
          this.startSessionMonitoring()
          // Ensure user profile exists
          this.ensureUserProfile(session)
          break
        case 'SIGNED_OUT':
          this.stopSessionMonitoring()
          this.clearSessionData()
          break
        case 'TOKEN_REFRESHED':
          console.log('Token refreshed successfully')
          break
        case 'USER_UPDATED':
          console.log('User data updated')
          break
      }
    })

    // Start monitoring if user is already logged in
    this.checkInitialSession()
  }

  /**
   * Check if user has an existing session on app load
   */
  private async checkInitialSession(): Promise<void> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error) {
        console.error('Error checking initial session:', error)
        return
      }

      if (session) {
        console.log('Found existing session for:', session.user.email)
        this.startSessionMonitoring()
        
        // Check if token needs refresh
        await this.checkAndRefreshToken(session)
      }
    } catch (error) {
      console.error('Failed to check initial session:', error)
    }
  }

  /**
   * Start monitoring session and token expiry
   */
  private startSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
    }

    this.sessionCheckInterval = setInterval(async () => {
      await this.monitorSession()
    }, this.SESSION_CHECK_INTERVAL)

    console.log('Session monitoring started')
  }

  /**
   * Stop session monitoring
   */
  private stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval)
      this.sessionCheckInterval = null
    }
    console.log('Session monitoring stopped')
  }

  /**
   * Monitor current session and refresh token if needed
   */
  private async monitorSession(): Promise<void> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error) {
        console.error('Error monitoring session:', error)
        return
      }

      if (!session) {
        console.log('No active session found during monitoring')
        this.stopSessionMonitoring()
        return
      }

      await this.checkAndRefreshToken(session)
    } catch (error) {
      console.error('Session monitoring error:', error)
    }
  }

  /**
   * Check if token needs refresh and refresh if necessary
   */
  private async checkAndRefreshToken(session: Session): Promise<void> {
    const expiresAt = session.expires_at
    if (!expiresAt) return

    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = (expiresAt - now) * 1000

    // Refresh token if it expires within the threshold
    if (timeUntilExpiry <= this.TOKEN_REFRESH_THRESHOLD) {
      console.log('Token expires soon, refreshing...')
      
      try {
        const { data, error } = await this.supabase.auth.refreshSession()
        
        if (error) {
          console.error('Token refresh failed:', error)
          // If refresh fails, sign out user
          await this.signOut()
        } else {
          console.log('Token refreshed successfully')
        }
      } catch (error) {
        console.error('Token refresh error:', error)
        await this.signOut()
      }
    }
  }

  /**
   * Get current user session
   */
  public async getCurrentSession(): Promise<{ user: User | null; session: Session | null }> {
    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error) {
        console.error('Error getting current session:', error)
        return { user: null, session: null }
      }

      return { user: session?.user || null, session }
    } catch (error) {
      console.error('Failed to get current session:', error)
      return { user: null, session: null }
    }
  }

  /**
   * Get current user
   */
  public async getCurrentUser(): Promise<User | null> {
    const { user } = await this.getCurrentSession()
    return user
  }

  /**
   * Check if user is authenticated
   */
  public async isAuthenticated(): Promise<boolean> {
    const { session } = await this.getCurrentSession()
    return !!session
  }

  /**
   * Sign out user and clear session
   */
  public async signOut(): Promise<void> {
    try {
      const { error } = await this.supabase.auth.signOut()
      
      if (error) {
        console.error('Error signing out:', error)
      }
      
      this.stopSessionMonitoring()
      this.clearSessionData()
      
      console.log('User signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  /**
   * Clear session data from storage
   */
  private clearSessionData(): void {
    try {
      // Let Supabase handle its own session cleanup
      // Don't manually manage auth tokens
      console.log('Session data cleared by Supabase')
    } catch (error) {
      console.error('Error clearing session data:', error)
    }
  }

  /**
   * Force refresh current session
   */
  public async refreshSession(): Promise<boolean> {
    try {
      const { data, error } = await this.supabase.auth.refreshSession()
      
      if (error) {
        console.error('Manual session refresh failed:', error)
        return false
      }

      console.log('Session refreshed manually')
      return true
    } catch (error) {
      console.error('Manual session refresh error:', error)
      return false
    }
  }

  /**
   * Get session expiry information
   */
  public async getSessionExpiry(): Promise<{ expiresAt: number | null; timeUntilExpiry: number | null }> {
    const { session } = await this.getCurrentSession()
    
    if (!session?.expires_at) {
      return { expiresAt: null, timeUntilExpiry: null }
    }

    const expiresAt = session.expires_at
    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = (expiresAt - now) * 1000

    return { expiresAt, timeUntilExpiry }
  }

  /**
   * Ensure user profile exists in database
   */
  private async ensureUserProfile(session: Session | null): Promise<void> {
    if (!session?.user) return

    try {
      // Use the client-side Supabase instance to check if profile exists
      const { data: existingProfile, error: checkError } = await this.supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (existingProfile) {
        console.log('User profile already exists')
        return
      }

      if (checkError && checkError.code !== 'PGRST116') {
        console.warn('Error checking user profile:', checkError)
        return
      }

      // Profile doesn't exist, try to create it via API
      const response = await fetch('/api/auth/create-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        console.log('User profile created successfully:', data)
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.warn('Failed to create user profile:', response.status, errorData)

        // If API fails, try direct client-side creation as fallback
        if (response.status === 401) {
          console.log('API authentication failed, trying direct client creation')
          await this.createProfileDirectly(session.user)
        }
      }
    } catch (error) {
      console.warn('Error ensuring user profile:', error)

      // Fallback: try direct client-side creation
      try {
        await this.createProfileDirectly(session.user)
      } catch (fallbackError) {
        console.error('Fallback profile creation also failed:', fallbackError)
      }
    }
  }

  /**
   * Create user profile directly using client-side Supabase
   */
  private async createProfileDirectly(user: any): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        if (error.code === '23505') {
          console.log('User profile already exists (unique violation)')
          return
        }
        throw error
      }

      console.log('User profile created directly:', data)
    } catch (error) {
      console.error('Direct profile creation failed:', error)
      throw error
    }
  }

  /**
   * Cleanup when component unmounts or app closes
   */
  public cleanup(): void {
    this.stopSessionMonitoring()
  }
}

// Export singleton instance
export const sessionManager = SessionManager.getInstance()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    sessionManager.cleanup()
  })
}
