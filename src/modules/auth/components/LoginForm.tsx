/**
 * Login form component
 * 
 * Complete login form with email/password fields, validation, error handling,
 * forgot password functionality, and signup redirect. Implements responsive
 * design and accessibility best practices.
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { LoginFormData, LoginFormProps } from '../types'
import { validateLoginForm } from '../utils/validation'
import { AuthInput } from './AuthInput'
import { AuthButton } from './AuthButton'

/**
 * Login form component
 * 
 * Provides a complete login interface with form validation, error handling,
 * and integration with authentication services.
 */
export function LoginForm({
  onSubmit,
  loading = false,
  error = null,
  onForgotPassword,
  onSignUp
}: LoginFormProps) {
  const router = useRouter()
  
  // ============================================================================
  // FORM STATE MANAGEMENT
  // ============================================================================

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('')
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false)
  const [forgotPasswordMessage, setForgotPasswordMessage] = useState('')

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  /**
   * Updates form field values
   */
  const updateField = useCallback((field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear field error when user starts typing
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }))
    }
  }, [fieldErrors])

  /**
   * Handles form submission with validation
   */
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate form data
    const validation = validateLoginForm(formData)
    
    if (!validation.isValid) {
      // Convert validation errors to field errors object
      const errors: Record<string, string> = {}
      validation.errors.forEach(error => {
        errors[error.field] = error.message
      })
      setFieldErrors(errors)
      return
    }

    // Clear any existing field errors
    setFieldErrors({})
    
    // Submit form
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('Login form submission error:', error)
    }
  }, [formData, onSubmit])

  /**
   * Handles forgot password functionality
   */
  const handleForgotPassword = useCallback(async () => {
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordMessage('Please enter your email address')
      return
    }

    try {
      setForgotPasswordLoading(true)
      setForgotPasswordMessage('')
      
      if (onForgotPassword) {
        await onForgotPassword()
        setForgotPasswordMessage('Password reset email sent! Please check your inbox.')
      }
    } catch (error) {
      setForgotPasswordMessage('Failed to send reset email. Please try again.')
    } finally {
      setForgotPasswordLoading(false)
    }
  }, [forgotPasswordEmail, onForgotPassword])

  /**
   * Handles signup redirect
   */
  const handleSignUp = useCallback(() => {
    if (onSignUp) {
      onSignUp()
    } else {
      router.push('/signup')
    }
  }, [onSignUp, router])

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Main Login Form */}
      {!showForgotPassword ? (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* Form Title */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Sign in to your account
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Welcome back! Please enter your details.
            </p>
          </div>

          {/* Global Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <svg className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          )}

          {/* Email Field */}
          <AuthInput
            label="Email address"
            type="email"
            value={formData.email}
            onChange={(value) => updateField('email', value)}
            error={fieldErrors.email}
            placeholder="Enter your email"
            required
            disabled={loading}
          />

          {/* Password Field */}
          <AuthInput
            label="Password"
            type="password"
            value={formData.password}
            onChange={(value) => updateField('password', value)}
            error={fieldErrors.password}
            placeholder="Enter your password"
            required
            disabled={loading}
          />

          {/* Forgot Password Link */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              disabled={loading}
            >
              Forgot your password?
            </button>
          </div>

          {/* Submit Button */}
          <AuthButton
            type="submit"
            loading={loading}
            variant="primary"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </AuthButton>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-sm text-gray-600">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={handleSignUp}
                className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
                disabled={loading}
              >
                Sign up
              </button>
            </p>
          </div>
        </form>
      ) : (
        /* Forgot Password Form */
        <div className="space-y-6">
          {/* Form Title */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Enter your email address and we'll send you a link to reset your password.
            </p>
          </div>

          {/* Success/Error Message */}
          {forgotPasswordMessage && (
            <div className={`border rounded-lg p-4 ${
              forgotPasswordMessage.includes('sent') 
                ? 'bg-green-50 border-green-200 text-green-800' 
                : 'bg-red-50 border-red-200 text-red-800'
            }`}>
              <p className="text-sm">{forgotPasswordMessage}</p>
            </div>
          )}

          {/* Email Field */}
          <AuthInput
            label="Email address"
            type="email"
            value={forgotPasswordEmail}
            onChange={setForgotPasswordEmail}
            placeholder="Enter your email"
            required
            disabled={forgotPasswordLoading}
          />

          {/* Action Buttons */}
          <div className="space-y-3">
            <AuthButton
              onClick={handleForgotPassword}
              loading={forgotPasswordLoading}
              variant="primary"
            >
              {forgotPasswordLoading ? 'Sending...' : 'Send reset email'}
            </AuthButton>

            <AuthButton
              onClick={() => setShowForgotPassword(false)}
              variant="secondary"
              disabled={forgotPasswordLoading}
            >
              Back to sign in
            </AuthButton>
          </div>
        </div>
      )}
    </div>
  )
}
