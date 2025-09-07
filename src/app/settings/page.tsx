/**
 * Settings page with tabbed interface
 * 
 * Provides a comprehensive settings interface with multiple tabs for different
 * configuration options. Uses Next.js query parameters for tab navigation.
 */

'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { GmailIntegrationTab } from '@/modules/settings/components/GmailIntegrationTab'

/**
 * Available settings tabs
 */
interface SettingsTab {
  id: string
  label: string
  icon: string
  component: React.ComponentType
}

/**
 * Settings page component
 * 
 * Renders a tabbed interface for various application settings including
 * Gmail integration, profile management, and other configuration options.
 */
export default function SettingsPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState('gmail')

  // ============================================================================
  // TAB CONFIGURATION
  // ============================================================================

  const tabs: SettingsTab[] = [
    {
      id: 'gmail',
      label: 'Gmail Integration',
      icon: '📧',
      component: GmailIntegrationTab
    },
    {
      id: 'profile',
      label: 'Profile',
      icon: '👤',
      component: () => (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">👤</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Settings</h3>
          <p className="text-gray-500">Coming soon...</p>
        </div>
      )
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: '🔔',
      component: () => (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🔔</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Notification Settings</h3>
          <p className="text-gray-500">Coming soon...</p>
        </div>
      )
    }
  ]

  // ============================================================================
  // TAB NAVIGATION
  // ============================================================================

  /**
   * Initialize active tab from URL parameters
   */
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam && tabs.find(tab => tab.id === tabParam)) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

  /**
   * Handle tab change and update URL
   */
  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)
    router.push(`/settings?tab=${tabId}`, { scroll: false })
  }

  /**
   * Get the active tab component
   */
  const getActiveTabComponent = () => {
    const tab = tabs.find(t => t.id === activeTab)
    if (!tab) return null
    
    const Component = tab.component
    return <Component />
  }

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              ⚙️ Settings
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your account settings and integrations
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border">
          {/* Tab Navigation */}
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="mr-2">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {getActiveTabComponent()}
          </div>
        </div>
      </div>
    </div>
  )
}
