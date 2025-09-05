import { createClient } from '@/lib/supabase/server'
import { createUserProfile } from '@/lib/database/users'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    console.log('Create profile endpoint called')
    const supabase = await createClient()

    // Get the current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log('Auth check result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      authError: authError?.message
    })

    if (authError || !user) {
      console.log('Authentication failed:', authError?.message || 'No user found')
      return NextResponse.json(
        {
          error: 'Unauthorized',
          details: authError?.message || 'No authenticated user found'
        },
        { status: 401 }
      )
    }

    // Check if user profile already exists
    const { data: existingProfile } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json({ 
        success: true, 
        message: 'Profile already exists' 
      })
    }

    // Create user profile
    const profile = await createUserProfile({
      id: user.id,
      email: user.email!,
      full_name: user.user_metadata?.full_name || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    if (profile) {
      return NextResponse.json({ 
        success: true, 
        message: 'Profile created successfully',
        profile 
      })
    } else {
      return NextResponse.json(
        { error: 'Failed to create profile' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error creating user profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
