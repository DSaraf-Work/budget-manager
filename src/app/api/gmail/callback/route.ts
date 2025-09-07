import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GmailOAuth } from '@/lib/gmail/oauth'
import { createGmailConnection, getGmailConnectionByEmail } from '@/lib/database/gmail-connections'

export async function GET(request: NextRequest) {
  try {
    console.log('=== GMAIL OAUTH CALLBACK START ===')
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state') // This should be the user ID
    const error = searchParams.get('error')

    console.log('Gmail OAuth callback received:', {
      hasCode: !!code,
      codeLength: code?.length || 0,
      hasState: !!state,
      stateValue: state,
      error,
      fullUrl: request.url,
      allParams: Object.fromEntries(searchParams.entries())
    })

    if (error) {
      console.error('Gmail OAuth error received:', error)
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?error=gmail_auth_failed&details=${encodeURIComponent(error)}`
      )
    }

    if (!code || !state) {
      console.error('Missing required parameters:', { hasCode: !!code, hasState: !!state })
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?error=missing_parameters&code=${!!code}&state=${!!state}`
      )
    }

    console.log('Creating Supabase client...')
    const supabase = await createClient()

    // Verify the user exists and matches the state parameter
    console.log('Verifying user authentication...')
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('Auth verification result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      stateParam: state,
      userIdMatchesState: user?.id === state,
      authError: authError?.message
    })

    if (authError || !user || user.id !== state) {
      console.error('Authentication verification failed:', {
        authError: authError?.message,
        hasUser: !!user,
        userIdMatchesState: user?.id === state,
        expectedUserId: state,
        actualUserId: user?.id
      })
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?error=unauthorized&reason=${authError?.message || 'user_mismatch'}`
      )
    }

    // Exchange code for tokens
    console.log('Exchanging OAuth code for tokens...')
    const gmailOAuth = new GmailOAuth()
    const tokens = await gmailOAuth.getTokensFromCode(code)

    console.log('Token exchange result:', {
      hasTokens: !!tokens,
      hasAccessToken: !!tokens?.access_token,
      hasRefreshToken: !!tokens?.refresh_token,
      accessTokenLength: tokens?.access_token?.length || 0,
      refreshTokenLength: tokens?.refresh_token?.length || 0,
      expiryDate: tokens?.expiry_date
    })

    if (!tokens) {
      console.error('Token exchange failed - no tokens returned')
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?error=token_exchange_failed&details=no_tokens_returned`
      )
    }

    if (!tokens.refresh_token) {
      console.error('Token exchange failed - no refresh token')
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?error=token_exchange_failed&details=refresh_token_missing`
      )
    }

    // Get Gmail profile to get the email address
    console.log('Fetching Gmail user profile...')
    const profile = await gmailOAuth.getUserProfile(
      tokens.access_token,
      tokens.refresh_token
    )

    console.log('Profile fetch result:', {
      hasProfile: !!profile,
      hasEmail: !!profile?.email,
      email: profile?.email,
      profileKeys: profile ? Object.keys(profile) : []
    })

    if (!profile || !profile.email) {
      console.error('Profile fetch failed:', {
        hasProfile: !!profile,
        hasEmail: !!profile?.email,
        profile: profile
      })
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?error=profile_fetch_failed&hasProfile=${!!profile}&hasEmail=${!!profile?.email}`
      )
    }

    // Check if this Gmail account is already connected
    console.log('Checking for existing Gmail connection...')
    const existingConnection = await getGmailConnectionByEmail(user.id, profile.email)

    console.log('Existing connection check result:', {
      hasExistingConnection: !!existingConnection,
      existingConnectionId: existingConnection?.id,
      existingConnectionActive: existingConnection?.is_active,
      checkingForEmail: profile.email,
      checkingForUserId: user.id
    })

    if (existingConnection) {
      console.log('Gmail account already connected, redirecting...')
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?error=gmail_already_connected&email=${encodeURIComponent(profile.email)}`
      )
    }

    // Create new Gmail connection
    console.log('Creating new Gmail connection...')
    const connectionData = {
      user_id: user.id,
      gmail_email: profile.email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(tokens.expiry_date).toISOString(),
      is_active: true,
      sync_status: 'pending' as const,
      error_count: 0
    }

    console.log('Connection data to create:', {
      user_id: connectionData.user_id,
      gmail_email: connectionData.gmail_email,
      access_token_length: connectionData.access_token.length,
      refresh_token_length: connectionData.refresh_token.length,
      expires_at: connectionData.expires_at,
      is_active: connectionData.is_active,
      sync_status: connectionData.sync_status,
      error_count: connectionData.error_count
    })

    const connection = await createGmailConnection(connectionData)

    console.log('Connection creation result:', {
      hasConnection: !!connection,
      connectionId: connection?.id,
      connectionEmail: connection?.gmail_email,
      connectionActive: connection?.is_active,
      connectionStatus: connection?.sync_status
    })

    if (!connection) {
      console.error('Connection creation failed - createGmailConnection returned null')
      return NextResponse.redirect(
        `${process.env.APP_URL}/dashboard?error=connection_creation_failed&reason=function_returned_null`
      )
    }

    console.log('=== GMAIL OAUTH CALLBACK SUCCESS ===')
    console.log(`Gmail connected successfully for user ${user.id}: ${profile.email} (connection ID: ${connection.id})`)

    return NextResponse.redirect(
      `${process.env.APP_URL}/dashboard?success=gmail_connected&email=${encodeURIComponent(profile.email)}&connectionId=${connection.id}`
    )
  } catch (error) {
    console.error('=== GMAIL OAUTH CALLBACK ERROR ===')
    console.error('Error in Gmail callback:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      cause: error instanceof Error ? error.cause : undefined
    })
    return NextResponse.redirect(
      `${process.env.APP_URL}/dashboard?error=internal_error&details=${encodeURIComponent(error instanceof Error ? error.message : String(error))}`
    )
  }
}
