'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { GmailConnection } from '@/components/gmail/GmailConnection'
import { SyncButton } from '@/components/gmail/SyncButton'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { useAuth } from '@/components/providers/AuthProvider'
import { TrendingUp, Mail, Settings, LogOut, Eye, RefreshCw, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function DashboardContent() {
  const [gmailConnected, setGmailConnected] = useState(false)
  const { user, signOut, sessionExpiry, refreshSession } = useAuth()
  const router = useRouter()

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleRefreshSession = async () => {
    const success = await refreshSession()
    if (success) {
      console.log('Session refreshed successfully')
    } else {
      console.error('Failed to refresh session')
    }
  }

  // Format session expiry time
  const formatTimeUntilExpiry = (timeUntilExpiry: number | null) => {
    if (!timeUntilExpiry) return 'Unknown'

    const hours = Math.floor(timeUntilExpiry / (1000 * 60 * 60))
    const minutes = Math.floor((timeUntilExpiry % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `${days} day${days !== 1 ? 's' : ''}`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Budget Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {user?.user_metadata?.full_name || user?.email}
              </span>

              {/* Session Status */}
              <div className="flex items-center space-x-2 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                <span>Session: {formatTimeUntilExpiry(sessionExpiry.timeUntilExpiry)}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleRefreshSession}
                  className="text-xs px-2 py-1"
                >
                  Refresh
                </Button>
              </div>

              <Link href="/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">
            Welcome to your personal finance dashboard. Connect your Gmail to start tracking expenses.
          </p>
        </div>

        {/* Gmail Connection */}
        <div className="mb-8">
          <GmailConnection onConnectionChange={setGmailConnected} />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Sync Gmail</h3>
                <p className="text-sm text-gray-500">Fetch latest transaction emails</p>
              </div>
            </div>
            <div className="mt-4">
              <SyncButton disabled={!gmailConnected} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Eye className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">View Transactions</h3>
                <p className="text-sm text-gray-500">Review and categorize expenses</p>
              </div>
            </div>
            <Link href="/transactions">
              <Button className="mt-4 w-full" variant="outline">
                View Transactions
              </Button>
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Settings className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Settings</h3>
                <p className="text-sm text-gray-500">Configure your preferences</p>
              </div>
            </div>
            <Link href="/settings">
              <Button className="mt-4 w-full" variant="outline">
                Settings
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Card */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Development Status</h2>
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <p className="text-green-800">
              <strong>Phase 1: Foundation Setup</strong> - Complete ✅
            </p>
            <div className="text-green-600 mt-2 space-y-1">
              <p>✅ User Authentication</p>
              <p>✅ Gmail OAuth Integration</p>
              <p>✅ Transaction Extraction</p>
              <p>✅ Review Dashboard</p>
              <p>✅ Persistent Session Management</p>
            </div>
            <p className="text-green-600 mt-3">
              Ready for Phase 2: User Features & Insights
            </p>
          </div>

          {/* Session Information */}
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-blue-800 font-medium mb-2">Session Information</h3>
            <div className="text-blue-600 text-sm space-y-1">
              <p>User: {user?.email}</p>
              <p>Session expires in: {formatTimeUntilExpiry(sessionExpiry.timeUntilExpiry)}</p>
              <p>Auto-refresh: Enabled</p>
              <p>Persistent storage: Active</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
