import { NextRequest, NextResponse } from 'next/server'
import { syncScheduler } from '@/lib/scheduler/sync-scheduler'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, intervalMinutes } = body

    switch (action) {
      case 'start':
        syncScheduler.start(intervalMinutes || 60)
        return NextResponse.json({ 
          success: true, 
          message: 'Sync scheduler started',
          status: syncScheduler.getStatus()
        })

      case 'stop':
        syncScheduler.stop()
        return NextResponse.json({ 
          success: true, 
          message: 'Sync scheduler stopped',
          status: syncScheduler.getStatus()
        })

      case 'status':
        return NextResponse.json({ 
          success: true, 
          status: syncScheduler.getStatus()
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use start, stop, or status' },
          { status: 400 }
        )
    }

  } catch (error: any) {
    console.error('Error in sync scheduler API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const status = syncScheduler.getStatus()
    return NextResponse.json({ 
      success: true, 
      status 
    })
  } catch (error: any) {
    console.error('Error getting sync scheduler status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
