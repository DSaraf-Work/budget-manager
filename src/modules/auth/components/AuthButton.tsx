/**
 * Authentication button component
 *
 * Reusable button component for authentication forms with loading states,
 * consistent styling, and accessibility features.
 */

'use client'

import { AuthButtonProps } from '../types'

/**
 * Authentication button component
 *
 * Provides consistent button styling and behavior for authentication forms
 * with loading indicators and proper accessibility attributes.
 */
export function AuthButton({
  loading = false,
  disabled = false,
  children,
  onClick,
  type = 'button',
  variant = 'primary'
}: AuthButtonProps) {
  const isDisabled = disabled || loading

  // Base button classes
  const baseClasses = `
    w-full flex justify-center items-center px-4 py-2 border text-sm font-medium rounded-lg
    focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `

  // Variant-specific classes
  const variantClasses = {
    primary: `
      border-transparent text-white bg-blue-600 hover:bg-blue-700
      focus:ring-blue-500 disabled:hover:bg-blue-600
    `,
    secondary: `
      border-gray-300 text-gray-700 bg-white hover:bg-gray-50
      focus:ring-blue-500 disabled:hover:bg-white
    `
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      className={`${baseClasses} ${variantClasses[variant]}`}
      aria-disabled={isDisabled}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-current"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      <span className={loading ? 'opacity-75' : ''}>
        {children}
      </span>
    </button>
  )
}
