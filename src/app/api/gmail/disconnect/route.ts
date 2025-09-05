import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GmailOAuth } from '@/lib/gmail/oauth'
import { getUserProfile, updateUserProfile } from '@/lib/database'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get user profile to access tokens
    const userProfile = await getUserProfile(user.id)
    
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Revoke Gmail access if tokens exist
    if (userProfile.gmail_access_token) {
      const gmailOAuth = new GmailOAuth()
      await gmailOAuth.revokeAccess(userProfile.gmail_access_token)
    }

    // Clear tokens from database
    const success = await updateUserProfile(user.id, {
      gmail_access_token: null,
      gmail_refresh_token: null,
      last_sync_at: null,
    })

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to disconnect Gmail' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error disconnecting Gmail:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
