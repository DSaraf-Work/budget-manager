/**
 * Gmail Connection Card Component
 * 
 * Displays Gmail connection status and provides connect/disconnect functionality
 * with proper OAuth flow handling and error management.
 */

'use client'

import { useState } from 'react'
import { GmailConnectionStatus } from '../types'
import { gmailService } from '../services/gmailService'

/**
 * Gmail Connection Card props
 */
interface GmailConnectionCardProps {
  connectionStatus: GmailConnectionStatus
  onConnectionSuccess: () => void
  onDisconnection: () => void
}

/**
 * Gmail Connection Card component
 * 
 * Handles Gmail OAuth connection flow, displays connection status,
 * and provides connect/disconnect functionality.
 */
export function GmailConnectionCard({
  connectionStatus,
  onConnectionSuccess,
  onDisconnection
}: GmailConnectionCardProps) {
  const [connecting, setConnecting] = useState(false)
  const [disconnecting, setDisconnecting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ============================================================================
  // CONNECTION HANDLERS
  // ============================================================================

  /**
   * Handle Gmail connection
   */
  const handleConnect = async () => {
    try {
      setConnecting(true)
      setError(null)

      // Initiate OAuth flow
      const authUrl = await gmailService.initiateOAuth()
      
      // Redirect to Google OAuth
      window.location.href = authUrl
    } catch (error) {
      console.error('Error initiating Gmail OAuth:', error)
      setError('Failed to initiate Gmail connection. Please try again.')
      setConnecting(false)
    }
  }

  /**
   * Handle Gmail disconnection
   */
  const handleDisconnect = async () => {
    try {
      setDisconnecting(true)
      setError(null)

      const success = await gmailService.disconnect()
      
      if (success) {
        onDisconnection()
      } else {
        setError('Failed to disconnect Gmail account. Please try again.')
      }
    } catch (error) {
      console.error('Error disconnecting Gmail:', error)
      setError('Failed to disconnect Gmail account. Please try again.')
    } finally {
      setDisconnecting(false)
    }
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Render connection status indicator
   */
  const renderConnectionStatus = () => {
    if (connectionStatus.isConnected) {
      return (
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
          <span className="text-green-700 font-medium">Connected</span>
        </div>
      )
    }

    return (
      <div className="flex items-center">
        <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
        <span className="text-gray-600 font-medium">Not Connected</span>
      </div>
    )
  }

  /**
   * Render connected state
   */
  const renderConnectedState = () => (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="text-3xl mr-4">✅</div>
          <div>
            <h3 className="text-lg font-medium text-green-900 mb-1">
              Gmail Connected
            </h3>
            <p className="text-green-700 mb-2">
              Connected to: <strong>{connectionStatus.userEmail}</strong>
            </p>
            {connectionStatus.connectedAt && (
              <p className="text-sm text-green-600">
                Connected on: {new Date(connectionStatus.connectedAt).toLocaleDateString()}
              </p>
            )}
            {connectionStatus.lastSyncAt && (
              <p className="text-sm text-green-600">
                Last sync: {new Date(connectionStatus.lastSyncAt).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <button
          onClick={handleDisconnect}
          disabled={disconnecting}
          className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {disconnecting ? 'Disconnecting...' : 'Disconnect'}
        </button>
      </div>
    </div>
  )

  /**
   * Render disconnected state
   */
  const renderDisconnectedState = () => (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start">
          <div className="text-3xl mr-4">📧</div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Connect Gmail Account
            </h3>
            <p className="text-gray-600 mb-4">
              Connect your Gmail account to enable email-based transaction detection and financial insights.
            </p>
            <div className="text-sm text-gray-500 space-y-1">
              <p>• Read-only access to your emails</p>
              <p>• Secure OAuth 2.0 authentication</p>
              <p>• No emails stored permanently</p>
            </div>
          </div>
        </div>
        <button
          onClick={handleConnect}
          disabled={connecting}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
        >
          {connecting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Connecting...
            </>
          ) : (
            <>
              <span className="mr-2">🔗</span>
              Connect Gmail
            </>
          )}
        </button>
      </div>
    </div>
  )

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div className="space-y-4">
      {/* Connection Status Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Connection Status
        </h3>
        {renderConnectionStatus()}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Connection State */}
      {connectionStatus.isConnected ? renderConnectedState() : renderDisconnectedState()}
    </div>
  )
}
