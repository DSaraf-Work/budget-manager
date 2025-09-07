import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    // Test database connection
    const supabase = await createClient()
    const { data, error } = await supabase.from('bm_users').select('count').limit(1)
    
    const dbStatus = error ? 'disconnected' : 'connected'
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: dbStatus,
        api: 'running'
      }
    })
  } catch (error) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: 'Service check failed'
    }, { status: 500 })
  }
}
