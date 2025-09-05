'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/Button'
import { GmailConnection } from '@/components/gmail/GmailConnection'
import { SyncButton } from '@/components/gmail/SyncButton'
import { TrendingUp, Mail, Settings, LogOut, Eye, RefreshCw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [gmailConnected, setGmailConnected] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [supabase.auth])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
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
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
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
            </div>
            <p className="text-green-600 mt-3">
              Ready for Phase 2: User Features & Insights
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
