/**
 * Main navigation component for Budget Manager
 * 
 * Provides links to all entry-level pages and features in the application.
 * Includes authentication status awareness and responsive design.
 */

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/modules/auth/hooks/useAuth'
import { useRouter } from 'next/navigation'

/**
 * Navigation link interface
 */
interface NavLink {
  href: string
  label: string
  description: string
  icon: string
  requiresAuth?: boolean
  external?: boolean
}

/**
 * Main navigation component
 * 
 * Displays all available pages and features in the Budget Manager application
 * with proper authentication state handling and responsive design.
 */
export function Navigation() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // ============================================================================
  // LOGOUT HANDLER
  // ============================================================================

  /**
   * Handle user logout
   */
  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  // ============================================================================
  // NAVIGATION LINKS CONFIGURATION
  // ============================================================================

  const authLinks: NavLink[] = [
    {
      href: '/login',
      label: 'Sign In',
      description: 'Access your account',
      icon: '🔑'
    },
    {
      href: '/signup',
      label: 'Sign Up',
      description: 'Create a new account',
      icon: '📝'
    }
  ]

  const publicLinks: NavLink[] = [
    {
      href: '/',
      label: 'Home',
      description: 'Welcome page and app overview',
      icon: '🏠'
    },
    {
      href: '/api/health',
      label: 'API Health',
      description: 'Check system status',
      icon: '⚡',
      external: true
    }
  ]

  const protectedLinks: NavLink[] = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      description: 'Your financial overview',
      icon: '📊',
      requiresAuth: true
    },
    {
      href: '/transactions',
      label: 'Transactions',
      description: 'Manage your transactions',
      icon: '💳',
      requiresAuth: true
    },
    {
      href: '/settings',
      label: 'Settings',
      description: 'Account settings and integrations',
      icon: '⚙️',
      requiresAuth: true
    }
    // Note: Additional features will be added as they are implemented
    // - Budgets, Categories, Reports coming soon
  ]

  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================

  /**
   * Determines which links to show based on authentication state
   */
  const getVisibleLinks = () => {
    const links = [...publicLinks]
    
    if (user) {
      // User is authenticated - show protected links
      links.push(...protectedLinks)
    } else {
      // User is not authenticated - show auth links
      links.push(...authLinks)
    }
    
    return links
  }

  /**
   * Renders a navigation link
   */
  const renderNavLink = (link: NavLink) => {
    const isExternal = link.external || link.href.startsWith('http')
    
    const linkContent = (
      <div className="group flex items-center p-4 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 bg-white hover:bg-blue-50">
        <div className="text-2xl mr-4 group-hover:scale-110 transition-transform duration-200">
          {link.icon}
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
            {link.label}
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            {link.description}
          </p>
        </div>
        <div className="text-gray-400 group-hover:text-blue-500 transition-colors">
          {isExternal ? '↗' : '→'}
        </div>
      </div>
    )

    if (isExternal) {
      return (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          {linkContent}
        </a>
      )
    }

    return (
      <Link key={link.href} href={link.href} className="block">
        {linkContent}
      </Link>
    )
  }

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  const visibleLinks = getVisibleLinks()

  return (
    <nav className="w-full max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Budget Manager Navigation
        </h2>
        <p className="text-gray-600">
          {user ? `Welcome back, ${user.email}!` : 'Explore the implemented features'}
        </p>
        
        {/* Authentication Status */}
        <div className="mt-4 flex items-center justify-center gap-4">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-sm">
            {loading ? (
              <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full">
                🔄 Checking authentication...
              </span>
            ) : user ? (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
                ✅ Signed in as {user.email}
              </span>
            ) : (
              <span className="bg-gray-100 text-gray-800 px-3 py-1 rounded-full">
                👤 Not signed in
              </span>
            )}
          </div>

          {/* Logout Button */}
          {user && !loading && (
            <button
              onClick={handleSignOut}
              className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors px-3 py-1 rounded-lg hover:bg-red-50"
            >
              Sign Out
            </button>
          )}
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleLinks.map(renderNavLink)}
      </div>

      {/* Footer Information */}
      <div className="mt-12 text-center">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">
            🚀 Application Status
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-medium text-blue-800">Frontend:</span>
              <span className="text-blue-600 ml-1">Next.js 15 + React 19</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Backend:</span>
              <span className="text-blue-600 ml-1">API Routes + Supabase</span>
            </div>
            <div>
              <span className="font-medium text-blue-800">Database:</span>
              <span className="text-blue-600 ml-1">PostgreSQL + Auth</span>
            </div>
          </div>
          
          {/* Development Info */}
          <div className="mt-4 pt-4 border-t border-blue-200">
            <p className="text-blue-700 text-xs">
              🔧 Development Mode - Core features implemented (Dashboard, Transactions, Authentication)
            </p>
            <p className="text-blue-600 text-xs mt-1">
              📋 Coming Soon: Budgets, Categories, Reports, Profile Management
            </p>
          </div>
        </div>
      </div>
    </nav>
  )
}
