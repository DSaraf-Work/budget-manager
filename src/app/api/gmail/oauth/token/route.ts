/**
 * Gmail OAuth token exchange API route
 * 
 * Exchanges authorization code for OAuth tokens and stores them securely
 * for the authenticated user.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/server'

/**
 * POST /api/gmail/oauth/token
 *
 * Exchange authorization code for OAuth tokens
 */
export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Gmail OAuth Token Exchange Request')

    // Check for Authorization header first (client-side token)
    const authHeader = request.headers.get('Authorization')
    let user = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract token from Authorization header
      const token = authHeader.substring(7)
      console.log('🎫 Using token from Authorization header')

      // Create Supabase client and validate token
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Validate the token by getting user
      const { data: userData, error } = await supabase.auth.getUser(token)

      if (error) {
        console.warn('❌ Token validation failed:', error.message)
        return NextResponse.json(
          { error: 'Invalid token', details: error.message },
          { status: 401 }
        )
      }

      user = userData.user
      console.log('✅ User authenticated via token:', user?.email)
    } else {
      // Fallback to cookie-based authentication
      console.log('🍪 Falling back to cookie-based auth...')
      const supabase = await createApiClient()

      const { data: userData, error: userError } = await supabase.auth.getUser()

      if (userError || !userData.user) {
        console.warn('❌ No valid authentication found')
        return NextResponse.json(
          { error: 'Authentication required', details: 'Please log in to connect Gmail' },
          { status: 401 }
        )
      }

      user = userData.user
      console.log('✅ User authenticated via cookies:', user.email)
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required', details: 'Please log in to connect Gmail' },
        { status: 401 }
      )
    }

    const { code } = await request.json()
    
    if (!code) {
      return NextResponse.json(
        { error: 'Authorization code is required' },
        { status: 400 }
      )
    }

    // Exchange code for tokens with Google OAuth
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/settings/gmail/callback`

    console.log('🔧 OAuth Configuration Debug:')
    console.log('- Client ID:', clientId ? `${clientId.substring(0, 20)}...` : 'MISSING')
    console.log('- Client Secret:', clientSecret ? 'Present' : 'MISSING')
    console.log('- Redirect URI:', redirectUri)
    console.log('- Authorization Code:', code ? `${code.substring(0, 20)}...` : 'MISSING')

    if (!clientId || !clientSecret) {
      console.error('❌ Google OAuth configuration missing')
      return NextResponse.json(
        { error: 'Google OAuth not configured' },
        { status: 500 }
      )
    }

    const tokenRequestBody = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    })

    console.log('🔄 Making token exchange request to Google...')
    console.log('- Request body:', Object.fromEntries(tokenRequestBody.entries()))

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenRequestBody,
    })

    console.log('📡 Google OAuth Response:', {
      status: tokenResponse.status,
      statusText: tokenResponse.statusText,
      headers: Object.fromEntries(tokenResponse.headers.entries())
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}))
      console.error('❌ OAuth token exchange failed:', {
        status: tokenResponse.status,
        statusText: tokenResponse.statusText,
        error: errorData
      })

      // Provide more specific error messages
      let errorMessage = 'Failed to exchange authorization code'
      if (errorData.error === 'invalid_grant') {
        errorMessage = 'Authorization code expired or invalid. Please try connecting again.'
      } else if (errorData.error === 'redirect_uri_mismatch') {
        errorMessage = 'Redirect URI mismatch. Please check OAuth configuration.'
      } else if (errorData.error === 'invalid_client') {
        errorMessage = 'Invalid client credentials. Please check OAuth configuration.'
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details: errorData.error_description || errorData.error || 'Unknown error'
        },
        { status: 400 }
      )
    }

    const tokens = await tokenResponse.json()
    console.log('✅ OAuth tokens received:', {
      hasAccessToken: !!tokens.access_token,
      hasRefreshToken: !!tokens.refresh_token,
      expiresIn: tokens.expires_in,
      scope: tokens.scope
    })

    // Use the authenticated user's email instead of fetching from Google
    // Gmail OAuth scope doesn't include user profile access
    console.log('✅ Using authenticated user email:', user.email)

    // Store tokens in database
    console.log('💾 Storing Gmail OAuth tokens in database...')

    // Create Supabase client for database operations
    const { createClient } = await import('@supabase/supabase-js')
    const dbSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const expiresAt = new Date(Date.now() + (tokens.expires_in * 1000))

    // First, check if user already has a Gmail connection
    const { data: existingConnection, error: checkError } = await dbSupabase
      .from('bm_gmail_connections')
      .select('id')
      .eq('user_id', user.id)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking existing Gmail connection:', checkError)
      return NextResponse.json(
        { error: 'Failed to check existing connection' },
        { status: 500 }
      )
    }

    let dbResult
    if (existingConnection) {
      // Update existing connection
      console.log('🔄 Updating existing Gmail connection...')
      dbResult = await dbSupabase
        .from('bm_gmail_connections')
        .update({
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt.toISOString(),
          user_email: user.email,
          connected_at: new Date().toISOString(),
          last_sync_at: null
        })
        .eq('user_id', user.id)
    } else {
      // Create new connection
      console.log('➕ Creating new Gmail connection...')
      dbResult = await dbSupabase
        .from('bm_gmail_connections')
        .insert({
          user_id: user.id,
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_at: expiresAt.toISOString(),
          user_email: user.email,
          connected_at: new Date().toISOString(),
          last_sync_at: null
        })
    }

    if (dbResult.error) {
      console.error('❌ Error storing Gmail tokens:', dbResult.error)
      return NextResponse.json(
        { error: 'Failed to store Gmail connection' },
        { status: 500 }
      )
    }

    console.log('✅ Gmail tokens stored successfully')

    const result = {
      accessToken: tokens.access_token,
      refreshToken: tokens.refresh_token,
      expiresAt: expiresAt.getTime(),
      scope: tokens.scope,
      userEmail: user.email
    }

    console.log('🎉 Gmail OAuth connection successful for:', user.email)
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error in OAuth token exchange:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
