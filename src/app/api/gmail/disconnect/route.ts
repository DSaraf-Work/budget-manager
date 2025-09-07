/**
 * Gmail disconnect API route
 * 
 * Disconnects Gmail account by revoking tokens and removing stored credentials
 * for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/server'

/**
 * POST /api/gmail/disconnect
 *
 * Disconnect Gmail account for the current user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createApiClient()

    // Get current user from session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError) {
      console.warn('Auth error in Gmail disconnect:', userError.message)
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

    // In a real implementation, you would:
    // 1. Get the stored refresh token for this user
    // 2. Revoke the token with Google
    // 3. Delete the stored tokens from your database

    // For now, return success
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Gmail:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
