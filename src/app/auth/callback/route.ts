import { createClient } from '@/lib/supabase/server'
import { createUserProfile } from '@/lib/database/users'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // Create user profile if it doesn't exist
        try {
          const profile = await createUserProfile({
            id: user.id,
            email: user.email!,
            full_name: user.user_metadata?.full_name || null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })

          if (profile) {
            console.log('User profile created/verified successfully for user:', user.id)
          } else {
            console.warn('Failed to create user profile for user:', user.id)
          }
        } catch (profileError) {
          // Profile might already exist or RLS might be blocking, which is fine
          console.log('User profile creation result:', profileError)
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}
