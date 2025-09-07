/**
 * Authentication context provider
 * 
 * Provides authentication state and methods to the entire application
 * through React Context. Manages global authentication state and
 * provides a consistent interface for all components.
 */

'use client'

import { createContext, useContext, ReactNode } from 'react'
import { AuthContextType } from '../types'
import { useAuth } from './useAuth'

// ============================================================================
// CONTEXT CREATION
// ============================================================================

/**
 * Authentication context
 * Provides authentication state and methods to child components
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================================================
// CONTEXT PROVIDER COMPONENT
// ============================================================================

/**
 * Authentication provider component props
 */
interface AuthProviderProps {
  children: ReactNode
}

/**
 * Authentication provider component
 * 
 * Wraps the application or specific routes to provide authentication
 * state and methods to all child components.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================================================
// CONTEXT HOOK
// ============================================================================

/**
 * Hook to access authentication context
 * 
 * Provides access to authentication state and methods from any component
 * within the AuthProvider tree.
 * 
 * @returns Authentication context value
 * @throws Error if used outside of AuthProvider
 */
export function useAuthContext(): AuthContextType {
  const context = useContext(AuthContext)
  
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  
  return context
}
