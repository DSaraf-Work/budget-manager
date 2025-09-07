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
    const supabase = await createApiClient()

    // Get current user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.warn('Auth error in Gmail status:', userError.message)
      return NextResponse.json(
        { error: 'Authentication failed', details: userError.message },
        { status: 401 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      )
    }

    // Check for Gmail connection in database
    // This would typically be stored in a gmail_connections table
    // For now, return a mock response
    const connectionStatus = {
      isConnected: false,
      userEmail: undefined,
      connectedAt: undefined,
      lastSyncAt: undefined
    }

    return NextResponse.json(connectionStatus)
  } catch (error) {
    console.error('Error getting Gmail status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
