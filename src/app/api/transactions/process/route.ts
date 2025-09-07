import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { TransactionProcessor } from '@/lib/transaction/processor'
import { getUserProfile } from '@/lib/database'

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

    // Verify user profile exists
    const userProfile = await getUserProfile(user.id)
    if (!userProfile) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    // Process unprocessed messages
    const processor = new TransactionProcessor()
    const result = await processor.processUnprocessedMessages(user.id)

    return NextResponse.json({
      success: true,
      processed: result.processed,
      created: result.created,
      failed: result.failed,
      errors: result.errors,
    })

  } catch (error: any) {
    console.error('Error processing transactions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
