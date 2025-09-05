import { createClient } from '@/lib/supabase/server'
import { createUserProfile } from '@/lib/database/users'
import { NextResponse } from 'next/server'

export async function POST() {
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

    console.log('Fixing profile for user:', user.id, user.email)

    // Check if user profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json({
        success: true,
        message: 'Profile already exists',
        userId: user.id,
        email: user.email
      })
    }

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Error checking for existing profile:', checkError)
      // Continue with creation attempt anyway
    }

    console.log('Creating new profile for user:', user.id)

    // Create user profile
    const profile = await createUserProfile({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    if (profile) {
      console.log('Profile created successfully:', profile.id)
      return NextResponse.json({ 
        success: true, 
        message: 'Profile created successfully',
        profile: {
          id: profile.id,
          email: profile.email,
          full_name: profile.full_name
        }
      })
    } else {
      console.error('Failed to create profile')
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error fixing user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
