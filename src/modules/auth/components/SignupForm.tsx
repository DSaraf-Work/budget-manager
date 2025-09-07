/**
 * Signup form component
 * 
 * Complete signup form with email/password fields, validation, error handling,
 * and login redirect. Implements responsive design and accessibility best practices.
 */

'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { SignupFormData } from '../types'
import { validateSignupForm } from '../utils/validation'
import { AuthInput } from './AuthInput'
import { AuthButton } from './AuthButton'

/**
 * Signup form component props
 */
interface SignupFormProps {
  onSubmit: (data: SignupFormData) => Promise<void>
  loading?: boolean
  error?: string | null
  onSignIn?: () => void
}

/**
 * Signup form component
 * 
 * Provides a complete signup interface with form validation, error handling,
 * and integration with authentication services.
 */
export function SignupForm({
  onSubmit,
  loading = false,
  error = null,
  onSignIn
}: SignupFormProps) {
  const router = useRouter()
  
  // ============================================================================
  // FORM STATE MANAGEMENT
  // ============================================================================

  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: ''
  })

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const [acceptTerms, setAcceptTerms] = useState(false)

  // ============================================================================
  // FORM HANDLERS
  // ============================================================================

  /**
   * Updates form field values
   */
  const updateField = useCallback((field: keyof SignupFormData, value: string) => {
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
    
    // Check terms acceptance
    if (!acceptTerms) {
      setFieldErrors({ terms: 'You must accept the Terms of Service and Privacy Policy' })
      return
    }
    
    // Validate form data
    const validation = validateSignupForm(formData)
    
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
      console.error('Signup form submission error:', error)
    }
  }, [formData, acceptTerms, onSubmit])

  /**
   * Handles sign in redirect
   */
  const handleSignIn = useCallback(() => {
    if (onSignIn) {
      onSignIn()
    } else {
      router.push('/login')
    }
  }, [onSignIn, router])

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div className="w-full max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Form Title */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Budget Manager to start tracking your finances
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

        {/* Full Name Field */}
        <AuthInput
          label="Full Name"
          type="text"
          value={formData.fullName}
          onChange={(value) => updateField('fullName', value)}
          error={fieldErrors.fullName}
          placeholder="Enter your full name"
          disabled={loading}
        />

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
          placeholder="Create a password"
          required
          disabled={loading}
        />

        {/* Confirm Password Field */}
        <AuthInput
          label="Confirm Password"
          type="password"
          value={formData.confirmPassword}
          onChange={(value) => updateField('confirmPassword', value)}
          error={fieldErrors.confirmPassword}
          placeholder="Confirm your password"
          required
          disabled={loading}
        />

        {/* Terms and Conditions */}
        <div className="space-y-2">
          <div className="flex items-start">
            <input
              id="accept-terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              disabled={loading}
              className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="accept-terms" className="ml-2 text-sm text-gray-700">
              I agree to the{' '}
              <a href="/terms" className="text-blue-600 hover:text-blue-500" target="_blank">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="/privacy" className="text-blue-600 hover:text-blue-500" target="_blank">
                Privacy Policy
              </a>
            </label>
          </div>
          {fieldErrors.terms && (
            <p className="text-sm text-red-600 flex items-center">
              <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              {fieldErrors.terms}
            </p>
          )}
        </div>

        {/* Submit Button */}
        <AuthButton
          type="submit"
          loading={loading}
          variant="primary"
        >
          {loading ? 'Creating account...' : 'Create account'}
        </AuthButton>

        {/* Sign In Link */}
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <button
              type="button"
              onClick={handleSignIn}
              className="font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              disabled={loading}
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  )
}
