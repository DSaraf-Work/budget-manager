import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GmailOAuth } from '@/lib/gmail/oauth'
import { updateGmailTokens, createUserProfile } from '@/lib/database'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // This should be the user ID
    const error = searchParams.get('error')

    if (error) {
      console.error('Gmail OAuth error:', error)
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?error=gmail_auth_failed`
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?error=missing_parameters`
      )
    }

    const supabase = createClient()
    
    // Verify the user exists and matches the state parameter
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user || user.id !== state) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?error=unauthorized`
      )
    }

    // Exchange code for tokens
    const gmailOAuth = new GmailOAuth()
    const tokens = await gmailOAuth.getTokensFromCode(code)

    if (!tokens) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?error=token_exchange_failed`
      )
    }

    // Encrypt and store tokens in database
    const success = await updateGmailTokens(
      user.id,
      tokens.access_token,
      tokens.refresh_token
    )

    if (!success) {
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?error=token_storage_failed`
      )
    }

    // Get Gmail profile to verify connection
    const profile = await gmailOAuth.getUserProfile(
      tokens.access_token,
      tokens.refresh_token
    )

    if (profile) {
      console.log(`Gmail connected successfully for user ${user.id}: ${profile.email}`)
    }

    return NextResponse.redirect(
      `${process.env.APP_URL}/dashboard?success=gmail_connected`
    )
  } catch (error) {
    console.error('Error in Gmail callback:', error)
    return NextResponse.redirect(
      `${process.env.APP_URL}/dashboard?error=internal_error`
    )
  }
}
