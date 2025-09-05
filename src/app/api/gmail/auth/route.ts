import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GmailOAuth } from '@/lib/gmail/oauth'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Generate Gmail OAuth URL
    const gmailOAuth = new GmailOAuth()
    const authUrl = gmailOAuth.getAuthUrl(user.id)

    return NextResponse.json({ authUrl })
  } catch (error) {
    console.error('Error generating Gmail auth URL:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
