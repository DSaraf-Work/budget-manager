/**
 * Login page component
 * 
 * Provides the main login interface at /login route with form handling,
 * authentication integration, and proper redirect logic.
 */

'use client'

import { useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { LoginForm } from '@/modules/auth/components/LoginForm'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { authService } from '@/modules/auth/services/authService'
import { LoginFormData } from '@/modules/auth/types'

/**
 * Login page component
 * 
 * Renders the login form and handles authentication logic including
 * form submission, error handling, and post-login redirects.
 */
export default function LoginPage() {
  const router = useRouter()
  const { user, loading, error, signIn, resetPassword, clearError } = useAuth()

  // ============================================================================
  // REDIRECT LOGIC
  // ============================================================================

  /**
   * Redirect authenticated users to dashboard
   */
  useEffect(() => {
    if (user && !loading) {
      router.push('/')
    }
  }, [user, loading, router])

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  /**
   * Handles login form submission
   * 
   * @param formData - Login form data with email and password
   */
  const handleLogin = useCallback(async (formData: LoginFormData) => {
    try {
      await signIn(formData.email, formData.password)
      // Redirect will be handled by the useEffect above
    } catch (error) {
      console.error('Login error:', error)
      // Error will be handled by the useAuth hook
    }
  }, [signIn])

  /**
   * Handles forgot password functionality
   */
  const handleForgotPassword = useCallback(async () => {
    // This will be handled by the LoginForm component
    // The form manages its own forgot password state
  }, [])

  /**
   * Handles signup redirect
   */
  const handleSignUp = useCallback(() => {
    router.push('/signup')
  }, [router])

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  /**
   * Show loading spinner while checking authentication state
   */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  /**
   * Don't render login form if user is already authenticated
   */
  if (user) {
    return null
  }

  // ============================================================================
  // RENDER LOGIN PAGE
  // ============================================================================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo/Brand Section */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">
            Budget Manager
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Your personal finance management solution
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <LoginForm
            onSubmit={handleLogin}
            loading={loading}
            error={error}
            onForgotPassword={handleForgotPassword}
            onSignUp={handleSignUp}
          />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By signing in, you agree to our{' '}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="/privacy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
