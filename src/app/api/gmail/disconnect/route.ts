import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GmailOAuth } from '@/lib/gmail/oauth'
import { getGmailConnection, deactivateGmailConnection } from '@/lib/database/gmail-connections'

export async function POST(request: NextRequest) {
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

    // Get connection ID from request body
    const body = await request.json()
    const { connectionId } = body

    if (!connectionId) {
      return NextResponse.json(
        { error: 'Connection ID is required' },
        { status: 400 }
      )
    }

    // Get the Gmail connection
    const connection = await getGmailConnection(connectionId)

    if (!connection) {
      return NextResponse.json(
        { error: 'Gmail connection not found' },
        { status: 404 }
      )
    }

    // Verify the connection belongs to the current user
    if (connection.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to disconnect this Gmail account' },
        { status: 403 }
      )
    }

    // Revoke Gmail access if tokens exist
    if (connection.access_token) {
      const gmailOAuth = new GmailOAuth()
      const revoked = await gmailOAuth.revokeAccess(connection.access_token)

      if (!revoked) {
        console.warn(`Failed to revoke Gmail access token for connection ${connectionId}`)
      }
    }

    // Deactivate the Gmail connection
    const success = await deactivateGmailConnection(connectionId)

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to disconnect Gmail account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `Gmail account ${connection.gmail_email} disconnected successfully`,
      disconnectedEmail: connection.gmail_email
    })
  } catch (error) {
    console.error('Error disconnecting Gmail:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
