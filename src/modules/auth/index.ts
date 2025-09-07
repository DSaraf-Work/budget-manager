/**
 * Authentication module barrel export
 * 
 * Centralizes all authentication module exports including components,
 * hooks, services, types, and utilities.
 */

// Components
export * from './components'

// Hooks
export { useAuth } from './hooks/useAuth'
export { AuthProvider, useAuthContext } from './hooks/AuthProvider'

// Services
export { authService } from './services/authService'

// Types
export type * from './types'

// Utilities
export * from './utils/validation'
export * from './utils/errors'
