import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GmailClient } from '@/lib/gmail/client'
import { getUserProfile, createSyncLog, completeSyncLog, updateLastSync } from '@/lib/database'

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

    // Get request parameters
    const body = await request.json()
    const { 
      maxResults = 100, 
      hoursBack = 1, 
      syncType = 'manual' 
    } = body

    // Get user profile with Gmail tokens
    const userProfile = await getUserProfile(user.id)
    
    if (!userProfile || !userProfile.gmail_access_token || !userProfile.gmail_refresh_token) {
      return NextResponse.json(
        { error: 'Gmail not connected' },
        { status: 400 }
      )
    }

    // Create sync log
    const syncLog = await createSyncLog({
      user_id: user.id,
      sync_type: syncType,
      sync_range_start: new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString(),
      sync_range_end: new Date().toISOString(),
    })

    if (!syncLog) {
      return NextResponse.json(
        { error: 'Failed to create sync log' },
        { status: 500 }
      )
    }

    try {
      // Initialize Gmail client and sync messages
      const gmailClient = new GmailClient()
      const result = await gmailClient.syncMessages(
        user.id,
        userProfile.gmail_access_token,
        userProfile.gmail_refresh_token,
        { maxResults, hoursBack }
      )

      if (!result.success) {
        await completeSyncLog(syncLog.id, 'failed', {
          error_message: result.error,
        })

        return NextResponse.json(
          { error: result.error },
          { status: 500 }
        )
      }

      // Complete sync log
      await completeSyncLog(syncLog.id, 'completed', {
        messages_fetched: result.messagesFetched,
        transactions_created: 0, // Will be updated when transactions are processed
      })

      // Update user's last sync time
      await updateLastSync(user.id)

      return NextResponse.json({
        success: true,
        messagesFetched: result.messagesFetched,
        messagesProcessed: result.messagesProcessed,
        syncLogId: syncLog.id,
      })

    } catch (error: any) {
      // Complete sync log with error
      await completeSyncLog(syncLog.id, 'failed', {
        error_message: error.message,
      })

      throw error
    }

  } catch (error: any) {
    console.error('Error in Gmail sync:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
