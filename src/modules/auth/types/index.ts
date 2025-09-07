/**
 * Authentication module type definitions
 * 
 * Defines all TypeScript types for authentication-related data structures,
 * form inputs, API responses, and component props.
 */

import { User } from '@supabase/supabase-js'

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

/**
 * Login form data structure
 * Used for email/password authentication
 */
export interface LoginFormData {
  email: string
  password: string
}

/**
 * Signup form data structure
 * Used for user registration
 */
export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
  fullName?: string
}

/**
 * Password reset form data
 * Used for forgot password functionality
 */
export interface PasswordResetFormData {
  email: string
}

/**
 * Authentication state interface
 * Represents the current authentication status
 */
export interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

/**
 * Authentication context interface
 * Provides authentication methods and state to components
 */
export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  clearError: () => void
}

// ============================================================================
// FORM VALIDATION TYPES
// ============================================================================

/**
 * Form field validation error
 */
export interface FieldError {
  field: string
  message: string
}

/**
 * Form validation result
 */
export interface ValidationResult {
  isValid: boolean
  errors: FieldError[]
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Authentication API response
 * Standard response format for auth operations
 */
export interface AuthResponse {
  success: boolean
  message?: string
  error?: string
  user?: User
}

/**
 * Password reset response
 */
export interface PasswordResetResponse {
  success: boolean
  message: string
}

// ============================================================================
// COMPONENT PROP TYPES
// ============================================================================

/**
 * Login form component props
 */
export interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>
  loading?: boolean
  error?: string | null
  onForgotPassword?: () => void
  onSignUp?: () => void
}

/**
 * Auth button component props
 */
export interface AuthButtonProps {
  loading?: boolean
  disabled?: boolean
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit'
  variant?: 'primary' | 'secondary'
}

/**
 * Auth input field component props
 */
export interface AuthInputProps {
  label: string
  type: 'email' | 'password' | 'text'
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

// ============================================================================
// UTILITY TYPES
// ============================================================================

/**
 * Authentication error types
 * Maps Supabase error codes to user-friendly messages
 */
export type AuthErrorType = 
  | 'invalid_credentials'
  | 'email_not_confirmed'
  | 'too_many_requests'
  | 'network_error'
  | 'unknown_error'

/**
 * Authentication action types
 * Used for state management and analytics
 */
export type AuthActionType = 
  | 'sign_in'
  | 'sign_up'
  | 'sign_out'
  | 'password_reset'
  | 'email_confirmation'
