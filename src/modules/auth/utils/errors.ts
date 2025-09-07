/**
 * Authentication error handling utilities
 * 
 * Maps Supabase authentication errors to user-friendly messages
 * and provides error classification for better user experience.
 */

import { AuthError } from '@supabase/supabase-js'
import { AuthErrorType } from '../types'

// ============================================================================
// ERROR MESSAGE MAPPINGS
// ============================================================================

/**
 * User-friendly error messages for authentication failures
 * Maps technical error codes to messages users can understand and act upon
 */
export const AUTH_ERROR_MESSAGES: Record<AuthErrorType, string> = {
  invalid_credentials: 'Invalid email or password. Please check your credentials and try again.',
  email_not_confirmed: 'Please check your email and click the confirmation link before signing in.',
  too_many_requests: 'Too many login attempts. Please wait a few minutes before trying again.',
  network_error: 'Network connection error. Please check your internet connection and try again.',
  unknown_error: 'An unexpected error occurred. Please try again or contact support if the problem persists.'
}

/**
 * Supabase error code mappings to our error types
 * Maps specific Supabase error messages to standardized error types
 */
const SUPABASE_ERROR_MAPPINGS: Record<string, AuthErrorType> = {
  'Invalid login credentials': 'invalid_credentials',
  'Email not confirmed': 'email_not_confirmed',
  'Too many requests': 'too_many_requests',
  'signup_disabled': 'unknown_error',
  'email_address_invalid': 'invalid_credentials',
  'password_too_short': 'invalid_credentials',
  'weak_password': 'invalid_credentials',
  'user_not_found': 'invalid_credentials',
  'invalid_credentials': 'invalid_credentials'
}

// ============================================================================
// ERROR CLASSIFICATION FUNCTIONS
// ============================================================================

/**
 * Classifies a Supabase authentication error into a standardized error type
 * 
 * This function analyzes the error message and code to determine the most
 * appropriate user-facing error type and message.
 * 
 * @param error - Supabase AuthError or generic Error
 * @returns Standardized error type for consistent handling
 */
export function classifyAuthError(error: AuthError | Error | unknown): AuthErrorType {
  // Handle null/undefined errors
  if (!error) {
    return 'unknown_error'
  }
  
  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'network_error'
  }
  
  // Handle Supabase AuthError
  if (error && typeof error === 'object' && 'message' in error) {
    const errorMessage = (error as AuthError).message
    
    // Check for specific error message mappings
    for (const [supabaseMessage, errorType] of Object.entries(SUPABASE_ERROR_MAPPINGS)) {
      if (errorMessage.includes(supabaseMessage)) {
        return errorType
      }
    }
    
    // Check for rate limiting
    if (errorMessage.includes('rate limit') || errorMessage.includes('too many')) {
      return 'too_many_requests'
    }
    
    // Check for email confirmation issues
    if (errorMessage.includes('confirm') || errorMessage.includes('verification')) {
      return 'email_not_confirmed'
    }
    
    // Check for credential issues
    if (errorMessage.includes('invalid') || errorMessage.includes('wrong') || errorMessage.includes('incorrect')) {
      return 'invalid_credentials'
    }
  }
  
  // Default to unknown error
  return 'unknown_error'
}

/**
 * Gets a user-friendly error message for an authentication error
 * 
 * @param error - Supabase AuthError or generic Error
 * @returns User-friendly error message
 */
export function getAuthErrorMessage(error: AuthError | Error | unknown): string {
  const errorType = classifyAuthError(error)
  return AUTH_ERROR_MESSAGES[errorType]
}

/**
 * Determines if an authentication error is recoverable by the user
 * 
 * Some errors (like network issues) can be retried, while others
 * (like invalid credentials) require user action.
 * 
 * @param errorType - Classified error type
 * @returns True if the user can retry the action
 */
export function isRecoverableError(errorType: AuthErrorType): boolean {
  switch (errorType) {
    case 'network_error':
    case 'too_many_requests':
    case 'unknown_error':
      return true
    case 'invalid_credentials':
    case 'email_not_confirmed':
      return false
    default:
      return false
  }
}

/**
 * Gets suggested actions for the user based on the error type
 * 
 * @param errorType - Classified error type
 * @returns Array of suggested actions for the user
 */
export function getErrorSuggestions(errorType: AuthErrorType): string[] {
  switch (errorType) {
    case 'invalid_credentials':
      return [
        'Double-check your email address and password',
        'Try using the "Forgot Password" option if you\'ve forgotten your password',
        'Make sure Caps Lock is not enabled'
      ]
    case 'email_not_confirmed':
      return [
        'Check your email inbox for a confirmation message',
        'Check your spam/junk folder',
        'Request a new confirmation email if needed'
      ]
    case 'too_many_requests':
      return [
        'Wait a few minutes before trying again',
        'Clear your browser cache and cookies',
        'Try using a different browser or device'
      ]
    case 'network_error':
      return [
        'Check your internet connection',
        'Try refreshing the page',
        'Disable any VPN or proxy if you\'re using one'
      ]
    case 'unknown_error':
      return [
        'Try refreshing the page and logging in again',
        'Clear your browser cache and cookies',
        'Contact support if the problem continues'
      ]
    default:
      return ['Please try again or contact support if the problem persists']
  }
}
