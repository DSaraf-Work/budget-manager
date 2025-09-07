/**
 * Gmail connection status API route
 * 
 * Returns the current Gmail connection status for the authenticated user
 * including connection state, user email, and last sync information.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/server'

/**
 * GET /api/gmail/status
 *
 * Returns Gmail connection status for the current user
 */
export async function GET(request: NextRequest) {
  try {
    // Check for Authorization header first
    const authHeader = request.headers.get('Authorization')
    console.log('🔑 Authorization header:', authHeader ? 'Present (Bearer token)' : 'Missing')

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract token from Authorization header
      const token = authHeader.substring(7)
      console.log('🎫 Token extracted from header:', token.substring(0, 20) + '...')

      // Create Supabase client and validate token
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Validate the token by getting user
      const { data: { user }, error } = await supabase.auth.getUser(token)

      if (error) {
        console.warn('❌ Token validation failed:', error.message)
        return NextResponse.json(
          { error: 'Invalid token', details: error.message },
          { status: 401 }
        )
      }

      if (user) {
        console.log('✅ User authenticated via token:', user.email)

        // Check for Gmail connection in database
        const { createClient } = await import('@supabase/supabase-js')
        const dbSupabase = createClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.SUPABASE_SERVICE_ROLE_KEY!
        )

        const { data: connection, error: connectionError } = await dbSupabase
          .from('bm_gmail_connections')
          .select('user_email, connected_at, last_sync_at, expires_at')
          .eq('user_id', user.id)
          .single()

        if (connectionError && connectionError.code !== 'PGRST116') {
          console.error('❌ Error checking Gmail connection:', connectionError)
          return NextResponse.json(
            { error: 'Failed to check Gmail connection' },
            { status: 500 }
          )
        }

        const connectionStatus = {
          isConnected: !!connection,
          userEmail: connection?.user_email,
          connectedAt: connection?.connected_at,
          lastSyncAt: connection?.last_sync_at,
          expiresAt: connection?.expires_at
        }

        console.log('📊 Gmail connection status:', connectionStatus)
        return NextResponse.json(connectionStatus)
      }
    }

    // Fallback to cookie-based authentication
    console.log('🍪 Falling back to cookie-based auth...')
    const supabase = await createApiClient()

    // Get current user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.warn('❌ Auth error in Gmail status:', userError.message)
      return NextResponse.json(
        { error: 'Authentication failed', details: userError.message },
        { status: 401 }
      )
    }

    if (!user) {
      console.warn('❌ No authenticated user found')
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      )
    }

    console.log('✅ User authenticated via cookies:', user.email)

    // Check for Gmail connection in database
    const { data: connection, error: connectionError } = await supabase
      .from('bm_gmail_connections')
      .select('user_email, connected_at, last_sync_at, expires_at')
      .eq('user_id', user.id)
      .single()

    if (connectionError && connectionError.code !== 'PGRST116') {
      console.error('❌ Error checking Gmail connection:', connectionError)
      return NextResponse.json(
        { error: 'Failed to check Gmail connection' },
        { status: 500 }
      )
    }

    const connectionStatus = {
      isConnected: !!connection,
      userEmail: connection?.user_email,
      connectedAt: connection?.connected_at,
      lastSyncAt: connection?.last_sync_at,
      expiresAt: connection?.expires_at
    }

    console.log('📊 Gmail connection status:', connectionStatus)
    return NextResponse.json(connectionStatus)
  } catch (error) {
    console.error('Error getting Gmail status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
