'use client'

import { useState } from 'react'
import { GmailConnection } from '@/components/gmail/GmailConnection'
import { SyncStatus } from '@/components/sync/SyncStatus'
import { SyncButton } from '@/components/gmail/SyncButton'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { Button } from '@/components/ui/Button'
import {
  TrendingUp,
  Settings,
  Mail,
  RefreshCw,
  Shield,
  Bell,
  User
} from 'lucide-react'
import Link from 'next/link'

function SettingsContent() {
  const [activeTab, setActiveTab] = useState<'gmail' | 'sync' | 'notifications' | 'account'>('gmail')

  const tabs = [
    { 
      id: 'gmail' as const, 
      label: 'Gmail Integration', 
      icon: Mail,
      description: 'Manage your Gmail connection and permissions'
    },
    { 
      id: 'sync' as const, 
      label: 'Sync Settings', 
      icon: RefreshCw,
      description: 'Configure automatic sync and scheduling'
    },
    { 
      id: 'notifications' as const, 
      label: 'Notifications', 
      icon: Bell,
      description: 'Manage notification preferences'
    },
    { 
      id: 'account' as const, 
      label: 'Account', 
      icon: User,
      description: 'Account settings and security'
    },
  ]

  const renderTabContent = () => {
    switch (activeTab) {
      case 'gmail':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Gmail Connection</h3>
              <p className="text-sm text-gray-600 mb-6">
                Connect your Gmail account to automatically extract transaction data from your emails.
              </p>
              <GmailConnection />
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Manual Sync</h3>
              <p className="text-sm text-gray-600 mb-4">
                Manually trigger a sync to fetch the latest emails and extract transactions.
              </p>
              <SyncButton />
            </div>
          </div>
        )

      case 'sync':
        return (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Automatic Sync</h3>
              <p className="text-sm text-gray-600 mb-6">
                Configure automatic syncing to keep your transactions up to date.
              </p>
              <SyncStatus />
            </div>
          </div>
        )

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Notification Preferences</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Sync Notifications</h4>
                    <p className="text-sm text-gray-500">Get notified when sync completes or fails</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Transaction Alerts</h4>
                    <p className="text-sm text-gray-500">Get notified of new transactions to review</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Weekly Summary</h4>
                    <p className="text-sm text-gray-500">Receive weekly spending summaries</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      case 'account':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">Connected via Supabase Auth</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Account Type</label>
                  <p className="mt-1 text-sm text-gray-900">Free Account</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Change Password</h4>
                    <p className="text-sm text-gray-500">Update your account password</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-500">Add an extra layer of security</p>
                  </div>
                  <Button variant="outline" size="sm" disabled>
                    Coming Soon
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
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
              <Link href="/dashboard">
                <Button variant="outline" size="sm">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="mt-2 text-gray-600">
            Manage your account, Gmail integration, and sync preferences
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-5 w-5 mr-3" />
                    {tab.label}
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {tabs.find(tab => tab.id === activeTab)?.description}
              </p>
            </div>

            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  )
}

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  )
}
