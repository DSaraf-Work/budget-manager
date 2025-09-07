/**
 * Authentication service for Supabase integration
 * 
 * Provides centralized authentication methods for sign in, sign up,
 * password reset, and session management using Supabase Auth.
 * Handles error processing and provides consistent API responses.
 */

import { createClient } from '@/lib/supabase/client'
import { AuthResponse, PasswordResetResponse } from '../types'
import { getAuthErrorMessage, classifyAuthError } from '../utils/errors'

// ============================================================================
// AUTHENTICATION SERVICE CLASS
// ============================================================================

/**
 * Authentication service class
 * 
 * Encapsulates all authentication operations and provides a clean API
 * for components to interact with Supabase Auth.
 */
export class AuthService {
  private supabase: ReturnType<typeof createClient>

  constructor() {
    try {
      this.supabase = createClient()
    } catch (error) {
      console.error('Failed to initialize Supabase client:', error)
      throw error
    }
  }

  /**
   * Signs in a user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @returns Promise with authentication response
   */
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password
      })

      if (error) {
        return {
          success: false,
          error: getAuthErrorMessage(error)
        }
      }

      if (!data.user) {
        return {
          success: false,
          error: 'Authentication failed. Please try again.'
        }
      }

      return {
        success: true,
        user: data.user,
        message: 'Successfully signed in!'
      }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }
  }

  /**
   * Signs up a new user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @param metadata - Optional user metadata (e.g., full name)
   * @returns Promise with authentication response
   */
  async signUp(
    email: string, 
    password: string, 
    metadata?: Record<string, any>
  ): Promise<AuthResponse> {
    try {
      const { data, error } = await this.supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: metadata || {}
        }
      })

      if (error) {
        return {
          success: false,
          error: getAuthErrorMessage(error)
        }
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        return {
          success: true,
          user: data.user,
          message: 'Please check your email and click the confirmation link to complete your registration.'
        }
      }

      return {
        success: true,
        user: data.user,
        message: 'Account created successfully!'
      }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }
  }

  /**
   * Signs out the current user
   * 
   * @returns Promise with authentication response
   */
  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        return {
          success: false,
          error: getAuthErrorMessage(error)
        }
      }

      return {
        success: true,
        message: 'Successfully signed out!'
      }
    } catch (error) {
      return {
        success: false,
        error: getAuthErrorMessage(error)
      }
    }
  }

  /**
   * Sends a password reset email to the user
   * 
   * @param email - User's email address
   * @returns Promise with password reset response
   */
  async resetPassword(email: string): Promise<PasswordResetResponse> {
    try {
      const { error } = await this.supabase.auth.resetPasswordForEmail(
        email.trim().toLowerCase(),
        {
          redirectTo: `${window.location.origin}/reset-password`
        }
      )

      if (error) {
        return {
          success: false,
          message: getAuthErrorMessage(error)
        }
      }

      return {
        success: true,
        message: 'Password reset email sent! Please check your inbox and follow the instructions.'
      }
    } catch (error) {
      return {
        success: false,
        message: getAuthErrorMessage(error)
      }
    }
  }

  /**
   * Gets the current user session
   * 
   * @returns Promise with current user or null
   */
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser()
      
      if (error) {
        console.error('Error getting current user:', error)
        return null
      }
      
      return user
    } catch (error) {
      console.error('Error getting current user:', error)
      return null
    }
  }

  /**
   * Gets the current session with enhanced persistence handling
   *
   * @returns Promise with current session data
   */
  async getCurrentSession() {
    try {
      // First attempt to get session
      let result = await this.supabase.auth.getSession()

      // If no session but we have stored auth data, try to refresh
      if (!result.data.session && typeof window !== 'undefined') {
        const storedSession = localStorage.getItem('budget-manager-auth')
        if (storedSession) {
          console.log('Attempting to refresh session from stored data')
          // Attempt to refresh the session
          const refreshResult = await this.supabase.auth.refreshSession()
          if (refreshResult.data.session) {
            result = refreshResult
          }
        }
      }

      return result
    } catch (error) {
      console.warn('Error getting current session:', error)
      return {
        data: { session: null },
        error: error as any
      }
    }
  }

  /**
   * Sign out the current user
   *
   * @returns Promise with sign out response
   */
  async signOut(): Promise<AuthResponse> {
    try {
      const { error } = await this.supabase.auth.signOut()

      if (error) {
        return {
          success: false,
          error: getAuthErrorMessage(error)
        }
      }

      // Clear local storage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('budget-manager-auth')
      }

      return {
        success: true,
        message: 'Successfully signed out'
      }
    } catch (error) {
      console.error('Error signing out:', error)
      return {
        success: false,
        error: 'An unexpected error occurred during sign out'
      }
    }
  }

  /**
   * Refresh the current session
   *
   * @returns Promise with refreshed session data
   */
  async refreshSession() {
    try {
      const result = await this.supabase.auth.refreshSession()
      return result
    } catch (error) {
      console.error('Error refreshing session:', error)
      return {
        data: { session: null, user: null },
        error: error as any
      }
    }
  }

  /**
   * Sets up authentication state change listener with enhanced session handling
   *
   * @param callback - Function to call when auth state changes
   * @returns Unsubscribe function
   */
  onAuthStateChange(callback: (user: any) => void) {
    const { data: { subscription } } = this.supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email || 'no user')

        // Handle token refresh events
        if (event === 'TOKEN_REFRESHED' && session) {
          console.log('Token refreshed successfully')
        }

        // Handle sign out events
        if (event === 'SIGNED_OUT') {
          console.log('User signed out')
          // Clear any stored session data
          if (typeof window !== 'undefined') {
            localStorage.removeItem('budget-manager-auth')
          }
        }

        callback(session?.user || null)
      }
    )

    return () => subscription.unsubscribe()
  }
}

// ============================================================================
// SINGLETON INSTANCE
// ============================================================================

/**
 * Singleton instance of the authentication service
 * Use this instance throughout the application for consistency
 */
export const authService = new AuthService()
