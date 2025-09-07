/**
 * Gmail OAuth Callback Page
 * 
 * Handles the OAuth callback from Google and exchanges the authorization code
 * for access tokens, then redirects back to the settings page.
 */

'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { gmailService } from '@/modules/settings/services/gmailService'

/**
 * Gmail OAuth callback page component
 * 
 * Processes the OAuth callback from Google, exchanges the authorization code
 * for tokens, and redirects the user back to the settings page.
 */
export default function GmailCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'processing' | 'success' | 'error'>('processing')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Get authorization code from URL parameters
        const code = searchParams.get('code')
        const error = searchParams.get('error')

        if (error) {
          setError(`OAuth error: ${error}`)
          setStatus('error')
          return
        }

        if (!code) {
          setError('No authorization code received')
          setStatus('error')
          return
        }

        // Exchange code for tokens
        const tokens = await gmailService.exchangeCodeForTokens(code)
        
        setStatus('success')
        
        // Redirect back to settings page after a short delay
        setTimeout(() => {
          router.push('/settings?tab=gmail')
        }, 2000)

      } catch (error) {
        console.error('OAuth callback error:', error)
        setError('Failed to complete Gmail connection')
        setStatus('error')
      }
    }

    handleCallback()
  }, [searchParams, router])

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-8">
        {status === 'processing' && (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Connecting Gmail Account
            </h2>
            <p className="text-gray-600">
              Please wait while we complete the connection to your Gmail account...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="text-6xl mb-6">✅</div>
            <h2 className="text-xl font-semibold text-green-900 mb-2">
              Gmail Connected Successfully!
            </h2>
            <p className="text-green-700 mb-4">
              Your Gmail account has been connected successfully.
            </p>
            <p className="text-sm text-gray-600">
              Redirecting you back to settings...
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="text-6xl mb-6">❌</div>
            <h2 className="text-xl font-semibold text-red-900 mb-2">
              Connection Failed
            </h2>
            <p className="text-red-700 mb-4">
              {error || 'Failed to connect your Gmail account'}
            </p>
            <button
              onClick={() => router.push('/settings?tab=gmail')}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Back to Settings
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
