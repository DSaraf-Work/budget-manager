/**
 * Authentication hook for React components
 * 
 * Provides authentication state management and methods for React components.
 * Handles loading states, error management, and automatic session updates.
 */

'use client'

import { useState, useEffect, useCallback } from 'react'
import { User } from '@supabase/supabase-js'
import { authService } from '../services/authService'
import { AuthState } from '../types'

// ============================================================================
// AUTHENTICATION HOOK
// ============================================================================

/**
 * Custom hook for authentication state and operations
 * 
 * Provides a complete authentication interface for React components,
 * including user state, loading indicators, error handling, and auth methods.
 * 
 * @returns Authentication state and methods
 */
export function useAuth() {
  // ============================================================================
  // STATE MANAGEMENT
  // ============================================================================

  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Updates authentication state
   * 
   * @param updates - Partial state updates
   */
  const updateState = useCallback((updates: Partial<AuthState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }, [])

  /**
   * Sets loading state
   * 
   * @param loading - Loading state
   */
  const setLoading = useCallback((loading: boolean) => {
    updateState({ loading })
  }, [updateState])

  /**
   * Sets error state
   * 
   * @param error - Error message or null
   */
  const setError = useCallback((error: string | null) => {
    updateState({ error })
  }, [updateState])

  /**
   * Clears error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [setError])

  /**
   * Sets user state
   * 
   * @param user - User object or null
   */
  const setUser = useCallback((user: User | null) => {
    updateState({ user, loading: false })
  }, [updateState])

  // ============================================================================
  // AUTHENTICATION METHODS
  // ============================================================================

  /**
   * Signs in a user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   */
  const signIn = useCallback(async (email: string, password: string): Promise<void> => {
    try {
      setLoading(true)
      clearError()

      const response = await authService.signIn(email, password)

      if (response.success) {
        // User state will be updated by the auth state change listener
        // No need to manually set user here
      } else {
        setError(response.error || 'Sign in failed')
      }
    } catch (error) {
      setError('An unexpected error occurred during sign in')
      console.error('Sign in error:', error)
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, setError])

  /**
   * Signs up a new user with email and password
   * 
   * @param email - User's email address
   * @param password - User's password
   * @param metadata - Optional user metadata
   */
  const signUp = useCallback(async (
    email: string, 
    password: string, 
    metadata?: Record<string, any>
  ): Promise<void> => {
    try {
      setLoading(true)
      clearError()

      const response = await authService.signUp(email, password, metadata)

      if (response.success) {
        // For signup, we might not get a session immediately if email confirmation is required
        // The auth state change listener will handle user updates
      } else {
        setError(response.error || 'Sign up failed')
      }
    } catch (error) {
      setError('An unexpected error occurred during sign up')
      console.error('Sign up error:', error)
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, setError])

  /**
   * Signs out the current user
   */
  const signOut = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      clearError()

      const response = await authService.signOut()

      if (!response.success) {
        setError(response.error || 'Sign out failed')
      }
      // User state will be updated by the auth state change listener
    } catch (error) {
      setError('An unexpected error occurred during sign out')
      console.error('Sign out error:', error)
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, setError])

  /**
   * Sends a password reset email
   * 
   * @param email - User's email address
   */
  const resetPassword = useCallback(async (email: string): Promise<void> => {
    try {
      setLoading(true)
      clearError()

      const response = await authService.resetPassword(email)

      if (!response.success) {
        setError(response.message)
      }
      // Success message should be handled by the calling component
    } catch (error) {
      setError('An unexpected error occurred while sending reset email')
      console.error('Password reset error:', error)
    } finally {
      setLoading(false)
    }
  }, [setLoading, clearError, setError])

  // ============================================================================
  // INITIALIZATION AND CLEANUP
  // ============================================================================

  /**
   * Initialize authentication state and set up listeners
   */
  useEffect(() => {
    let mounted = true

    // Get initial user state
    const initializeAuth = async () => {
      try {
        const user = await authService.getCurrentUser()
        if (mounted) {
          setUser(user)
        }
      } catch (error) {
        console.error('Error initializing auth:', error)
        if (mounted) {
          setUser(null)
        }
      }
    }

    // Set up auth state change listener
    const unsubscribe = authService.onAuthStateChange((user) => {
      if (mounted) {
        setUser(user)
      }
    })

    initializeAuth()

    // Cleanup function
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [setUser])

  // ============================================================================
  // RETURN HOOK INTERFACE
  // ============================================================================

  return {
    // State
    user: state.user,
    loading: state.loading,
    error: state.error,
    
    // Computed state
    isAuthenticated: !!state.user,
    isLoading: state.loading,
    
    // Methods
    signIn,
    signUp,
    signOut,
    resetPassword,
    clearError
  }
}
