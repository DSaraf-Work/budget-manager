import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envCheck = {
      supabase: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        anonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        urlValue: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'Missing',
        anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0
      },
      google: {
        clientId: !!process.env.GOOGLE_CLIENT_ID,
        clientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
        clientIdLength: process.env.GOOGLE_CLIENT_ID?.length || 0,
        clientSecretLength: process.env.GOOGLE_CLIENT_SECRET?.length || 0
      },
      app: {
        appUrl: process.env.APP_URL || 'Not set',
        publicAppUrl: process.env.NEXT_PUBLIC_APP_URL || 'Not set',
        nodeEnv: process.env.NODE_ENV || 'Not set'
      },
      runtime: {
        port: process.env.PORT || 'Not set',
        hostname: process.env.HOSTNAME || 'Not set'
      }
    }

    return NextResponse.json({
      success: true,
      environment: envCheck,
      recommendations: generateRecommendations(envCheck)
    })
  } catch (error) {
    return NextResponse.json(
      { 
        error: 'Environment check failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

function generateRecommendations(envCheck: any): string[] {
  const recommendations = []

  if (!envCheck.supabase.url) {
    recommendations.push('❌ NEXT_PUBLIC_SUPABASE_URL is missing - add to .env.local')
  }

  if (!envCheck.supabase.anonKey) {
    recommendations.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is missing - add to .env.local')
  }

  if (!envCheck.google.clientId) {
    recommendations.push('❌ GOOGLE_CLIENT_ID is missing - add to .env.local')
  }

  if (!envCheck.google.clientSecret) {
    recommendations.push('❌ GOOGLE_CLIENT_SECRET is missing - add to .env.local')
  }

  if (envCheck.app.appUrl === 'Not set' && envCheck.app.publicAppUrl === 'Not set') {
    recommendations.push('⚠️  APP_URL and NEXT_PUBLIC_APP_URL not set - using fallback http://localhost:3001')
  }

  if (envCheck.supabase.anonKeyLength > 0 && envCheck.supabase.anonKeyLength < 100) {
    recommendations.push('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY seems too short - verify it\'s correct')
  }

  if (envCheck.google.clientIdLength > 0 && envCheck.google.clientIdLength < 50) {
    recommendations.push('⚠️  GOOGLE_CLIENT_ID seems too short - verify it\'s correct')
  }

  if (recommendations.length === 0) {
    recommendations.push('✅ All environment variables appear to be set correctly!')
  }

  return recommendations
}
