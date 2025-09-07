import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { getGmailConnections } from '@/lib/database/gmail-connections'

export async function GET(request: NextRequest) {
  try {
    console.log('Gmail connections endpoint called')
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('Gmail connections auth check:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message
    })

    if (authError || !user) {
      console.log('Gmail connections authentication failed:', authError?.message || 'No user found')
      return NextResponse.json(
        {
          error: 'Unauthorized',
          details: authError?.message || 'No authenticated user found'
        },
        { status: 401 }
      )
    }

    // Get Gmail connections for the user
    try {
      const connections = await getGmailConnections(user.id)

      // Return connections without sensitive token data
      const safeConnections = connections.map(conn => ({
        id: conn.id,
        gmail_email: conn.gmail_email,
        is_active: conn.is_active,
        last_sync_at: conn.last_sync_at,
        sync_status: conn.sync_status,
        error_count: conn.error_count,
        created_at: conn.created_at,
        updated_at: conn.updated_at
      }))

      return NextResponse.json({
        success: true,
        connections: safeConnections,
        count: safeConnections.length
      })
    } catch (dbError) {
      console.error('Database error in Gmail connections endpoint:', dbError)

      // Check if it's a permission error
      if (dbError instanceof Error && dbError.message.includes('Database permission error')) {
        return NextResponse.json(
          {
            error: 'Database permission error',
            details: 'RLS policies not properly configured for gmail_connections table',
            suggestion: 'Run the RLS fix script in Supabase SQL Editor',
            userId: user.id
          },
          { status: 403 }
        )
      }

      // Generic database error
      return NextResponse.json(
        {
          error: 'Database error',
          details: dbError instanceof Error ? dbError.message : 'Unknown database error'
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fetching Gmail connections:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
