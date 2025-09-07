/**
 * Gmail connection status API route
 * 
 * Returns the current Gmail connection status for the authenticated user
 * including connection state, user email, and last sync information.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/gmail/status
 * 
 * Returns Gmail connection status for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
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
