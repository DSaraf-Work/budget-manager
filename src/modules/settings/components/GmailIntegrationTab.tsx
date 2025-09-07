/**
 * Gmail Integration Tab Component
 * 
 * Provides Gmail OAuth connection management and email testing interface
 * with proper error handling and user feedback.
 */

'use client'

import { useState, useEffect } from 'react'
import { GmailConnectionStatus } from '../types'
import { gmailService } from '../services/gmailService'
import { GmailConnectionCard } from './GmailConnectionCard'
import { EmailTestingInterface } from './EmailTestingInterface'

/**
 * Gmail Integration Tab component
 * 
 * Main component for Gmail integration settings including connection status,
 * OAuth flow management, and email testing functionality.
 */
export function GmailIntegrationTab() {
  const [connectionStatus, setConnectionStatus] = useState<GmailConnectionStatus>({
    isConnected: false
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ============================================================================
  // CONNECTION STATUS MANAGEMENT
  // ============================================================================

  /**
   * Load Gmail connection status
   */
  const loadConnectionStatus = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const status = await gmailService.getConnectionStatus()
      setConnectionStatus(status)
    } catch (error) {
      console.error('Error loading Gmail connection status:', error)
      setError('Failed to load Gmail connection status')
    } finally {
      setLoading(false)
    }
  }

  /**
   * Initialize component
   */
  useEffect(() => {
    loadConnectionStatus()
  }, [])

  /**
   * Handle successful connection
   */
  const handleConnectionSuccess = () => {
    loadConnectionStatus()
  }

  /**
   * Handle disconnection
   */
  const handleDisconnection = () => {
    setConnectionStatus({ isConnected: false })
  }

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading Gmail integration status...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex">
          <svg className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">Error</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <button
              onClick={loadConnectionStatus}
              className="mt-3 text-sm text-red-600 hover:text-red-500 font-medium"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          📧 Gmail Integration
        </h2>
        <p className="text-gray-600">
          Connect your Gmail account to enable email-based transaction detection and financial insights.
        </p>
      </div>

      {/* Connection Status Card */}
      <GmailConnectionCard
        connectionStatus={connectionStatus}
        onConnectionSuccess={handleConnectionSuccess}
        onDisconnection={handleDisconnection}
      />

      {/* Email Testing Interface - Demo Mode */}
      <div className="border-t pt-8">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-blue-600 mr-2">ℹ️</span>
            <div>
              <p className="text-blue-800 font-medium">Demo Mode</p>
              <p className="text-blue-700 text-sm">
                {connectionStatus.isConnected
                  ? "Testing interface with your connected Gmail account"
                  : "Preview of email testing interface (connect Gmail to use with real data)"
                }
              </p>
            </div>
          </div>
        </div>
        <EmailTestingInterface />
      </div>

      {/* Feature Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-3">
          🔍 What can you do with Gmail Integration?
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
          <div className="flex items-start">
            <span className="mr-2">📊</span>
            <div>
              <strong>Transaction Detection:</strong> Automatically identify financial transactions from email receipts
            </div>
          </div>
          <div className="flex items-start">
            <span className="mr-2">🔍</span>
            <div>
              <strong>Email Filtering:</strong> Search and filter emails by sender, date range, and content
            </div>
          </div>
          <div className="flex items-start">
            <span className="mr-2">📈</span>
            <div>
              <strong>Spending Insights:</strong> Analyze spending patterns from email notifications
            </div>
          </div>
          <div className="flex items-start">
            <span className="mr-2">🔒</span>
            <div>
              <strong>Secure Access:</strong> Read-only access with OAuth 2.0 authentication
            </div>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          🔒 Privacy & Security
        </h3>
        <div className="text-sm text-gray-700 space-y-2">
          <p>
            • We only request <strong>read-only access</strong> to your Gmail account
          </p>
          <p>
            • Your email data is processed locally and not stored permanently
          </p>
          <p>
            • You can disconnect your Gmail account at any time
          </p>
          <p>
            • We use Google's secure OAuth 2.0 authentication system
          </p>
        </div>
      </div>
    </div>
  )
}
