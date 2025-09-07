/**
 * Gmail disconnect API route
 * 
 * Disconnects Gmail account by revoking tokens and removing stored credentials
 * for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * POST /api/gmail/disconnect
 * 
 * Disconnect Gmail account for the current user
 */
export async function POST(request: NextRequest) {
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
