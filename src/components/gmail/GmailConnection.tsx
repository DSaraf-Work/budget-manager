'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'

interface GmailConnectionProps {
  onConnectionChange?: (connected: boolean) => void
}

export function GmailConnection({ onConnectionChange }: GmailConnectionProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    checkGmailConnection()
  }, [])

  const checkGmailConnection = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsConnected(false)
        return
      }

      // Check if user has Gmail tokens
      const { data, error } = await supabase
        .from('users')
        .select('gmail_access_token')
        .eq('id', user.id)
        .single()

      if (error) {
        // If user record doesn't exist or other error, assume not connected
        if (error.code === 'PGRST116') {
          // No rows returned - user record doesn't exist yet
          console.log('User record not found, Gmail not connected')
        } else {
          console.error('Error checking Gmail connection:', error.message || error)
        }
        setIsConnected(false)
        onConnectionChange?.(false)
        return
      }

      const connected = !!(data?.gmail_access_token)
      setIsConnected(connected)
      onConnectionChange?.(connected)
    } catch (error) {
      console.error('Error checking Gmail connection:', error instanceof Error ? error.message : error)
      setIsConnected(false)
      onConnectionChange?.(false)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    try {
      setConnecting(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/gmail/auth')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get authorization URL')
      }

      // Redirect to Gmail OAuth
      window.location.href = data.authUrl
    } catch (error: any) {
      setError(error.message)
      setConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      setDisconnecting(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/gmail/disconnect', {
        method: 'POST',
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to disconnect Gmail')
      }

      setIsConnected(false)
      setSuccess('Gmail disconnected successfully')
      onConnectionChange?.(false)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setDisconnecting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">Checking Gmail connection...</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          {success}
        </Alert>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-12 w-12 rounded-md ${
              isConnected ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {isConnected ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : (
                <Mail className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Gmail Integration
              </h3>
              <p className="text-sm text-gray-500">
                {isConnected 
                  ? 'Your Gmail account is connected and ready for transaction tracking'
                  : 'Connect your Gmail account to start automatic transaction tracking'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {isConnected ? (
              <>
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Connected
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={disconnecting}
                >
                  {disconnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    'Disconnect'
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="flex items-center"
              >
                {connecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mail className="h-4 w-4 mr-2" />
                    Connect Gmail
                  </>
                )}
              </Button>
            )}
          </div>
        </div>

        {!isConnected && (
          <div className="mt-4 p-4 bg-blue-50 rounded-md">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-blue-400 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-blue-800">
                  What happens when you connect?
                </h4>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>We'll access your Gmail with read-only permissions</li>
                    <li>Only transaction-related emails will be processed</li>
                    <li>Your email content is never stored, only extracted transaction data</li>
                    <li>You can disconnect at any time</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
