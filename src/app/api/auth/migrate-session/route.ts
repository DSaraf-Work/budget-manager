import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    console.log('Session migration endpoint called')
    
    // Get the custom token from request body
    const body = await request.json()
    const { customToken } = body
    
    if (!customToken) {
      return NextResponse.json(
        { error: 'No custom token provided' },
        { status: 400 }
      )
    }
    
    console.log('Custom token received, length:', customToken.length)
    
    // Try to parse the custom token (it might be a JSON string)
    let sessionData
    try {
      sessionData = JSON.parse(customToken)
    } catch (error) {
      console.error('Failed to parse custom token:', error)
      return NextResponse.json(
        { error: 'Invalid token format' },
        { status: 400 }
      )
    }
    
    console.log('Parsed session data:', {
      hasAccessToken: !!sessionData.access_token,
      hasRefreshToken: !!sessionData.refresh_token,
      hasUser: !!sessionData.user,
      userEmail: sessionData.user?.email
    })
    
    // Create server client and try to set the session
    const supabase = await createClient()
    
    const { data, error } = await supabase.auth.setSession({
      access_token: sessionData.access_token,
      refresh_token: sessionData.refresh_token
    })
    
    if (error) {
      console.error('Failed to set session:', error)
      return NextResponse.json(
        { error: 'Failed to migrate session', details: error.message },
        { status: 400 }
      )
    }
    
    console.log('Session migrated successfully:', {
      userId: data.user?.id,
      userEmail: data.user?.email
    })
    
    return NextResponse.json({
      success: true,
      message: 'Session migrated successfully',
      user: {
        id: data.user?.id,
        email: data.user?.email
      }
    })
    
  } catch (error) {
    console.error('Session migration error:', error)
    return NextResponse.json(
      { 
        error: 'Session migration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
