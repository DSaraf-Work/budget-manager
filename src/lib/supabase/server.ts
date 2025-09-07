import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set cookie with 6-month expiry and secure options
              const cookieOptions = {
                ...options,
                maxAge: 15552000, // 6 months in seconds
                httpOnly: false, // Allow client-side access for auth
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                path: '/',
              }
              cookieStore.set(name, value, cookieOptions)
            })
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
      auth: {
        // Enable persistent sessions with 6-month expiry
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        // Storage key for session persistence
        storageKey: 'budget-manager-auth',
      },
    }
  )
}

/**
 * Create a Supabase client for API routes with proper session handling
 *
 * This client is specifically designed for use in API routes where we need
 * to access the authenticated user's session from cookies.
 */
export async function createApiClient() {
  const cookieStore = await cookies()

  const client = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          const allCookies = cookieStore.getAll()
          console.log('🍪 Server getting cookies:', allCookies.map(c => ({
            name: c.name,
            hasValue: !!c.value,
            length: c.value?.length || 0
          })))
          return allCookies
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set cookie with proper options for API routes
              const cookieOptions = {
                ...options,
                maxAge: 15552000, // 6 months in seconds
                httpOnly: false, // Allow client-side access for auth
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                path: '/',
              }
              console.log('🍪 Server setting cookie:', { name, hasValue: !!value, options: cookieOptions })
              cookieStore.set(name, value, cookieOptions)
            })
          } catch (error) {
            console.warn('Failed to set cookies in API route:', error)
          }
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: false, // Disable auto-refresh in API routes
        detectSessionInUrl: false, // Don't detect in API routes
        flowType: 'pkce',
        storageKey: 'budget-manager-auth',
        debug: false, // Debug mode disabled to reduce console noise
      },
    }
  )

  return client
}
