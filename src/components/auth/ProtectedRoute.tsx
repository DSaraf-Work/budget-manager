'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

export function ProtectedRoute({ 
  children, 
  redirectTo = '/auth/login',
  requireAuth = true 
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated } = useAuth()
  const router = useRouter()
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    if (loading) {
      // Still loading, don't render anything yet
      setShouldRender(false)
      return
    }

    if (requireAuth && !isAuthenticated) {
      // User is not authenticated and auth is required
      console.log('User not authenticated, redirecting to:', redirectTo)
      router.push(redirectTo)
      setShouldRender(false)
      return
    }

    if (!requireAuth && isAuthenticated) {
      // User is authenticated but this route doesn't require auth (e.g., login page)
      console.log('User already authenticated, redirecting to dashboard')
      router.push('/dashboard')
      setShouldRender(false)
      return
    }

    // All checks passed, render the component
    setShouldRender(true)
  }, [user, loading, isAuthenticated, requireAuth, redirectTo, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!shouldRender) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}

// Higher-order component for protecting pages
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { redirectTo?: string; requireAuth?: boolean } = {}
) {
  const { redirectTo = '/auth/login', requireAuth = true } = options

  return function AuthenticatedComponent(props: P) {
    return (
      <ProtectedRoute redirectTo={redirectTo} requireAuth={requireAuth}>
        <Component {...props} />
      </ProtectedRoute>
    )
  }
}

// Component for public routes (redirects to dashboard if already authenticated)
export function PublicRoute({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute requireAuth={false}>
      {children}
    </ProtectedRoute>
  )
}
