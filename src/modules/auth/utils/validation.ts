/**
 * Authentication form validation utilities
 * 
 * Provides validation functions for email, password, and form data.
 * Implements client-side validation rules for security and user experience.
 */

import { LoginFormData, SignupFormData, PasswordResetFormData, ValidationResult, FieldError } from '../types'

// ============================================================================
// VALIDATION CONSTANTS
// ============================================================================

/**
 * Password requirements for user security
 */
export const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: false, // Optional for better UX
} as const

/**
 * Email validation regex pattern
 * Validates standard email format
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

// ============================================================================
// INDIVIDUAL FIELD VALIDATORS
// ============================================================================

/**
 * Validates email address format
 * 
 * @param email - Email address to validate
 * @returns Validation error message or null if valid
 */
export function validateEmail(email: string): string | null {
  if (!email.trim()) {
    return 'Email is required'
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return 'Please enter a valid email address'
  }
  
  return null
}

/**
 * Validates password strength and requirements
 * 
 * @param password - Password to validate
 * @returns Validation error message or null if valid
 */
export function validatePassword(password: string): string | null {
  if (!password) {
    return 'Password is required'
  }
  
  if (password.length < PASSWORD_REQUIREMENTS.minLength) {
    return `Password must be at least ${PASSWORD_REQUIREMENTS.minLength} characters long`
  }
  
  if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
    return 'Password must contain at least one uppercase letter'
  }
  
  if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
    return 'Password must contain at least one lowercase letter'
  }
  
  if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
    return 'Password must contain at least one number'
  }
  
  if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return 'Password must contain at least one special character'
  }
  
  return null
}

/**
 * Validates password confirmation matches original password
 * 
 * @param password - Original password
 * @param confirmPassword - Confirmation password
 * @returns Validation error message or null if valid
 */
export function validatePasswordConfirmation(password: string, confirmPassword: string): string | null {
  if (!confirmPassword) {
    return 'Please confirm your password'
  }
  
  if (password !== confirmPassword) {
    return 'Passwords do not match'
  }
  
  return null
}

/**
 * Validates full name (optional field)
 * 
 * @param fullName - Full name to validate
 * @returns Validation error message or null if valid
 */
export function validateFullName(fullName: string): string | null {
  if (fullName && fullName.trim().length < 2) {
    return 'Full name must be at least 2 characters long'
  }
  
  return null
}

// ============================================================================
// FORM VALIDATORS
// ============================================================================

/**
 * Validates login form data
 * 
 * @param data - Login form data to validate
 * @returns Validation result with errors if any
 */
export function validateLoginForm(data: LoginFormData): ValidationResult {
  const errors: FieldError[] = []
  
  // Validate email
  const emailError = validateEmail(data.email)
  if (emailError) {
    errors.push({ field: 'email', message: emailError })
  }
  
  // Validate password
  const passwordError = validatePassword(data.password)
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates signup form data
 * 
 * @param data - Signup form data to validate
 * @returns Validation result with errors if any
 */
export function validateSignupForm(data: SignupFormData): ValidationResult {
  const errors: FieldError[] = []
  
  // Validate email
  const emailError = validateEmail(data.email)
  if (emailError) {
    errors.push({ field: 'email', message: emailError })
  }
  
  // Validate password
  const passwordError = validatePassword(data.password)
  if (passwordError) {
    errors.push({ field: 'password', message: passwordError })
  }
  
  // Validate password confirmation
  const confirmPasswordError = validatePasswordConfirmation(data.password, data.confirmPassword)
  if (confirmPasswordError) {
    errors.push({ field: 'confirmPassword', message: confirmPasswordError })
  }
  
  // Validate full name (if provided)
  if (data.fullName) {
    const fullNameError = validateFullName(data.fullName)
    if (fullNameError) {
      errors.push({ field: 'fullName', message: fullNameError })
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

/**
 * Validates password reset form data
 * 
 * @param data - Password reset form data to validate
 * @returns Validation result with errors if any
 */
export function validatePasswordResetForm(data: PasswordResetFormData): ValidationResult {
  const errors: FieldError[] = []
  
  // Validate email
  const emailError = validateEmail(data.email)
  if (emailError) {
    errors.push({ field: 'email', message: emailError })
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}
