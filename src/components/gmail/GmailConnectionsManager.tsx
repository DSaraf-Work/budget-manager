'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { GmailPermissionReset, useGmailPermissionReset } from './GmailPermissionReset'
import { Mail, CheckCircle, AlertCircle, Loader2, Plus, Trash2, Clock, RefreshCw } from 'lucide-react'

interface GmailConnection {
  id: string
  gmail_email: string
  is_active: boolean
  last_sync_at: string | null
  sync_status: string | null
  error_count: number | null
  created_at: string
  updated_at: string
}

interface GmailConnectionsManagerProps {
  onConnectionChange?: (connected: boolean) => void
}

export function GmailConnectionsManager({ onConnectionChange }: GmailConnectionsManagerProps) {
  const [connections, setConnections] = useState<GmailConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const { showReset, checkForPermissionError, hideReset } = useGmailPermissionReset()
  const supabase = createClient()

  useEffect(() => {
    console.log('=== GMAIL CONNECTIONS MANAGER: useEffect triggered ===')
    checkGmailConnections()
  }, [])

  const checkGmailConnections = async () => {
    console.log('=== GMAIL CONNECTIONS MANAGER: checkGmailConnections START ===')
    try {
      setLoading(true)
      console.log('Getting user from Supabase client...')
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      console.log('Auth check result:', {
        hasUser: !!user,
        userId: user?.id,
        userEmail: user?.email,
        authError: authError?.message
      })

      if (!user) {
        console.log('No user found, setting empty connections')
        setConnections([])
        onConnectionChange?.(false)
        setLoading(false)
        return
      }

      console.log('Making fetch request to /api/gmail/connections...')
      // Fetch Gmail connections for the user
      const response = await fetch('/api/gmail/connections')
      console.log('Fetch response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Gmail connections data received:', {
          hasConnections: !!data.connections,
          connectionsCount: data.connections?.length || 0,
          connections: data.connections
        })
        setConnections(data.connections || [])
        const hasActiveConnections = (data.connections || []).some((conn: GmailConnection) => conn.is_active)
        onConnectionChange?.(hasActiveConnections)
        console.log('Gmail connections state updated successfully')
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }))
        console.error('Failed to fetch Gmail connections:', response.status, errorData)
        setError(`Failed to fetch Gmail connections: ${errorData.error || 'Unknown error'}`)
        setConnections([])
        onConnectionChange?.(false)
      }
    } catch (error) {
      console.error('Error checking Gmail connections:', error)
      setError(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setConnections([])
      onConnectionChange?.(false)
    } finally {
      console.log('Setting loading to false')
      setLoading(false)
      console.log('=== GMAIL CONNECTIONS MANAGER: checkGmailConnections END ===')
    }
  }

  const handleConnect = async () => {
    try {
      setConnecting(true)
      setError(null)
      setSuccess(null)
      hideReset() // Hide any existing reset dialog

      const response = await fetch('/api/gmail/auth')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get authorization URL')
      }

      // Redirect to Gmail OAuth
      window.location.href = data.authUrl
    } catch (error: any) {
      const errorMessage = error.message
      setConnecting(false)
      
      // Check if this is a refresh token error
      if (!checkForPermissionError(errorMessage)) {
        // If not a permission error, show regular error
        setError(errorMessage)
      }
    }
  }

  const handleDisconnect = async (connectionId: string, gmailEmail: string) => {
    try {
      setDisconnecting(connectionId)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/gmail/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to disconnect Gmail')
      }

      const data = await response.json()
      setSuccess(data.message || `${gmailEmail} disconnected successfully`)
      
      // Refresh connections
      await checkGmailConnections()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setDisconnecting(null)
    }
  }

  const formatLastSync = (lastSyncAt: string | null) => {
    if (!lastSyncAt) return 'Never'
    
    const date = new Date(lastSyncAt)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    return `${diffDays}d ago`
  }

  const getSyncStatusColor = (status: string | null) => {
    switch (status) {
      case 'completed': return 'text-green-600'
      case 'syncing': return 'text-blue-600'
      case 'error': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  const getSyncStatusIcon = (status: string | null) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'syncing': return <RefreshCw className="h-4 w-4 animate-spin" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  // Show permission reset dialog if needed
  if (showReset) {
    return (
      <GmailPermissionReset
        onRetry={handleConnect}
        onClose={hideReset}
      />
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">Loading Gmail connections...</span>
      </div>
    )
  }

  const activeConnections = connections.filter(conn => conn.is_active)
  const inactiveConnections = connections.filter(conn => !conn.is_active)

  return (
    <div className="space-y-4">
      {error && !showReset && (
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className={`flex items-center justify-center h-12 w-12 rounded-md ${
              activeConnections.length > 0 ? 'bg-green-100' :
              inactiveConnections.length > 0 ? 'bg-yellow-100' : 'bg-gray-100'
            }`}>
              {activeConnections.length > 0 ? (
                <CheckCircle className="h-6 w-6 text-green-600" />
              ) : inactiveConnections.length > 0 ? (
                <AlertCircle className="h-6 w-6 text-yellow-600" />
              ) : (
                <Mail className="h-6 w-6 text-gray-400" />
              )}
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-medium text-gray-900">
                Gmail Integration
              </h3>
              <p className="text-sm text-gray-500">
                {activeConnections.length > 0
                  ? `${activeConnections.length} Gmail account${activeConnections.length > 1 ? 's' : ''} connected`
                  : inactiveConnections.length > 0
                  ? `${inactiveConnections.length} Gmail account${inactiveConnections.length > 1 ? 's' : ''} disconnected (click to reconnect)`
                  : 'Connect your Gmail accounts to start automatic transaction tracking'
                }
              </p>
            </div>
          </div>

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
                <Plus className="h-4 w-4 mr-2" />
                Connect Gmail Account
              </>
            )}
          </Button>
        </div>

        {/* Connected Accounts List */}
        {activeConnections.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Connected Accounts</h4>
            {activeConnections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {connection.gmail_email}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className={`flex items-center space-x-1 ${getSyncStatusColor(connection.sync_status)}`}>
                        {getSyncStatusIcon(connection.sync_status)}
                        <span className="capitalize">{connection.sync_status || 'pending'}</span>
                      </span>
                      <span>•</span>
                      <span>Last sync: {formatLastSync(connection.last_sync_at)}</span>
                      {connection.error_count && connection.error_count > 0 && (
                        <>
                          <span>•</span>
                          <span className="text-red-600">{connection.error_count} error{connection.error_count > 1 ? 's' : ''}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDisconnect(connection.id, connection.gmail_email)}
                  disabled={disconnecting === connection.id}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  {disconnecting === connection.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Disconnecting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Disconnect
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Inactive/Disconnected Accounts List */}
        {inactiveConnections.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">Disconnected Accounts</h4>
            {inactiveConnections.map((connection) => (
              <div
                key={connection.id}
                className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {connection.gmail_email}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="text-yellow-600">Disconnected</span>
                      <span>•</span>
                      <span>Last sync: {formatLastSync(connection.last_sync_at)}</span>
                      <span>•</span>
                      <span>Click reconnect to reactivate</span>
                    </div>
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleConnect}
                  disabled={connecting}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  {connecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                      Reconnecting...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reconnect
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Information Section */}
        {activeConnections.length === 0 && inactiveConnections.length === 0 && (
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
                    <li>You can connect multiple Gmail accounts</li>
                    <li>You can disconnect any account at any time</li>
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
