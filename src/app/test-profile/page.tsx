'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { useAuth } from '@/components/providers/AuthProvider'

export default function TestProfilePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const handleFixProfile = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/auth/fix-profile', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to fix profile')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckGmail = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/gmail/auth')
      const data = await response.json()

      if (response.ok) {
        setResult({ message: 'Gmail auth URL generated', authUrl: data.authUrl })
      } else {
        setError(data.error || 'Failed to generate Gmail auth URL')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckAuthStatus = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/debug/auth-status')
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to check auth status')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckEnvironment = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/debug/env-check')
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to check environment')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleMigrateSession = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      // Get the custom token from localStorage
      const customToken = localStorage.getItem('budget-manager-auth-token')

      if (!customToken) {
        setError('No custom auth token found in localStorage')
        return
      }

      const response = await fetch('/api/auth/migrate-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customToken })
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          ...data,
          message: 'Session migrated! Please refresh the page to use the new session.'
        })

        // Clear the old custom token
        localStorage.removeItem('budget-manager-auth-token')

        // Suggest page refresh
        setTimeout(() => {
          if (confirm('Session migrated successfully! Refresh the page to use the new session?')) {
            window.location.reload()
          }
        }, 2000)
      } else {
        setError(data.error || 'Failed to migrate session')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCleanupSession = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/debug/cleanup-session', { method: 'POST' })
      const data = await response.json()

      if (response.ok) {
        setResult(data)

        // Ask user if they want to run automatic cleanup
        setTimeout(() => {
          if (confirm('Run automatic session cleanup? This will clear all storage and refresh the page.')) {
            // Run the cleanup
            localStorage.clear()
            sessionStorage.clear()
            document.cookie.split(";").forEach(function(c) {
              document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
            })
            console.log('Session cleaned up successfully')
            window.location.reload()
          }
        }, 1000)
      } else {
        setError(data.error || 'Failed to get cleanup instructions')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  const handleCheckConnections = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch('/api/gmail/connections')
      const data = await response.json()

      if (response.ok) {
        setResult(data)
      } else {
        setError(data.error || 'Failed to fetch Gmail connections')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile Test Page</h1>
        
        {user && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Current User</h2>
            <div className="space-y-2 text-sm">
              <p><strong>ID:</strong> {user.id}</p>
              <p><strong>Email:</strong> {user.email}</p>
              <p><strong>Full Name:</strong> {user.user_metadata?.full_name || 'Not set'}</p>
              <p><strong>Email Confirmed:</strong> {user.email_confirmed_at ? 'Yes' : 'No'}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <Button
            onClick={handleCleanupSession}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700"
          >
            {loading ? 'Processing...' : 'Clean Up Session (Reset Everything)'}
          </Button>

          <Button
            onClick={handleMigrateSession}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700"
          >
            {loading ? 'Processing...' : 'Migrate Session (Fix 401 Errors)'}
          </Button>

          <Button
            onClick={handleCheckEnvironment}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Processing...' : 'Check Environment Variables'}
          </Button>

          <Button
            onClick={handleCheckAuthStatus}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Processing...' : 'Check Auth Status (Debug)'}
          </Button>

          <Button
            onClick={handleFixProfile}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Processing...' : 'Fix/Create User Profile'}
          </Button>

          <Button
            onClick={handleCheckConnections}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Processing...' : 'Check Gmail Connections'}
          </Button>

          <Button
            onClick={handleCheckGmail}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? 'Processing...' : 'Test Gmail Auth'}
          </Button>
        </div>

        {error && (
          <Alert variant="error" className="mt-6">
            <strong>Error:</strong> {error}
          </Alert>
        )}

        {result && (
          <Alert variant="success" className="mt-6">
            <strong>Success:</strong>
            <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </Alert>
        )}

        {!user && (
          <Alert className="mt-6">
            <strong>Not Authenticated:</strong> Please log in to test profile creation.
          </Alert>
        )}
      </div>
    </div>
  )
}
