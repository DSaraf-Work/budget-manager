/**
 * Signup page component
 * 
 * Provides the main signup interface at /signup route with form handling,
 * authentication integration, and proper redirect logic.
 */

'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SignupForm } from '@/modules/auth/components/SignupForm'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { SignupFormData } from '@/modules/auth/types'

/**
 * Signup page component
 * 
 * Renders the signup form and handles authentication logic including
 * form submission, error handling, and post-signup redirects.
 */
export default function SignupPage() {
  const router = useRouter()
  const { user, loading, error, signUp, clearError } = useAuth()
  const [signupSuccess, setSignupSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')

  // ============================================================================
  // REDIRECT LOGIC
  // ============================================================================

  /**
   * Redirect authenticated users to dashboard
   */
  useEffect(() => {
    if (user && !loading && !signupSuccess) {
      router.push('/')
    }
  }, [user, loading, signupSuccess, router])

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  /**
   * Handles signup form submission
   * 
   * @param formData - Signup form data with email, password, and full name
   */
  const handleSignup = useCallback(async (formData: SignupFormData) => {
    try {
      clearError()
      
      // Prepare metadata for user profile
      const metadata = {
        full_name: formData.fullName || '',
        display_name: formData.fullName || formData.email.split('@')[0],
      }

      await signUp(formData.email, formData.password, metadata)
      
      // Show success message
      setSignupSuccess(true)
      setSuccessMessage(
        'Account created successfully! You can now sign in with your credentials.'
      )
    } catch (error) {
      console.error('Signup error:', error)
      // Error will be handled by the useAuth hook
    }
  }, [signUp, clearError])

  /**
   * Handles sign in redirect
   */
  const handleSignIn = useCallback(() => {
    router.push('/login')
  }, [router])

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  /**
   * Show loading spinner while checking authentication state
   */
  if (loading && !signupSuccess) {
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
   * Don't render signup form if user is already authenticated (unless just signed up)
   */
  if (user && !signupSuccess) {
    return null
  }

  // ============================================================================
  // SUCCESS STATE
  // ============================================================================

  /**
   * Show success message after successful signup
   */
  if (signupSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Logo/Brand Section */}
          <div className="text-center">
            <div className="mx-auto h-12 w-12 bg-green-600 rounded-lg flex items-center justify-center">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mt-4 text-2xl font-bold text-gray-900">
              Account Created!
            </h1>
          </div>

          {/* Success Message */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6">
            <div className="flex">
              <svg className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-green-800">
                  Welcome to Budget Manager!
                </h3>
                <p className="mt-2 text-sm text-green-700">
                  {successMessage}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            <button
              onClick={handleSignIn}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Continue to Sign In
            </button>
            
            <button
              onClick={() => router.push('/')}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ============================================================================
  // RENDER SIGNUP PAGE
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

        {/* Signup Form */}
        <div className="bg-white py-8 px-6 shadow-lg rounded-lg">
          <SignupForm
            onSubmit={handleSignup}
            loading={loading}
            error={error}
            onSignIn={handleSignIn}
          />
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500">
            By creating an account, you agree to our{' '}
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
