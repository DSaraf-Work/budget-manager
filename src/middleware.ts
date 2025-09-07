/**
 * Next.js middleware for Supabase authentication
 *
 * Handles session refresh, cookie management, and authentication state
 * persistence across requests. Ensures users stay logged in for 6 months.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Middleware function to handle Supabase authentication
 *
 * This middleware runs on every request to:
 * - Refresh authentication tokens automatically
 * - Maintain session persistence with 6-month expiry
 * - Handle cookie management for authentication state
 *
 * @param request - Next.js request object
 * @returns Response with updated authentication cookies
 */
export async function middleware(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set cookies with 6-month expiry and secure options
              const cookieOptions = {
                ...options,
                maxAge: 15552000, // 6 months in seconds
                httpOnly: false, // Allow client-side access for auth
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax' as const,
                path: '/',
              }
              response.cookies.set(name, value, cookieOptions)
            })
          },
        },
      }
    )

    // Refresh session if it exists
    // This ensures the user stays logged in and tokens are refreshed
    await supabase.auth.getSession()

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
}

/**
 * Middleware configuration
 * 
 * Specifies which routes the middleware should run on.
 * We want it to run on all routes to ensure authentication
 * state is properly maintained throughout the application.
 */
export const config = {
  matcher: [
    // Enable middleware for all routes except static files
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
