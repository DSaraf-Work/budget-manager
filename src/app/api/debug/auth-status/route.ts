import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Get cookies to see what's available
    const cookieStore = await cookies()
    const allCookies = cookieStore.getAll()
    
    // Create Supabase client
    const supabase = await createClient()
    
    // Try to get user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Try to get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession()
    
    return NextResponse.json({
      success: true,
      debug: {
        hasUser: !!user,
        hasSession: !!session,
        userId: user?.id || null,
        userEmail: user?.email || null,
        sessionExpiry: session?.expires_at || null,
        authError: authError?.message || null,
        sessionError: sessionError?.message || null,
        cookieCount: allCookies.length,
        supabaseCookies: allCookies.filter(cookie => 
          cookie.name.includes('supabase') || 
          cookie.name.includes('sb-') ||
          cookie.name.includes('auth')
        ).map(cookie => ({
          name: cookie.name,
          hasValue: !!cookie.value,
          valueLength: cookie.value?.length || 0
        })),
        requestHeaders: {
          authorization: request.headers.get('authorization'),
          cookie: request.headers.get('cookie') ? 'present' : 'missing'
        }
      }
    })
  } catch (error) {
    console.error('Debug auth status error:', error)
    return NextResponse.json(
      { 
        error: 'Debug failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
