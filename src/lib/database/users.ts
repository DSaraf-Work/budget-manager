import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

export async function createUserProfile(userData: UserInsert): Promise<User | null> {
  const supabase = await createClient()

  try {
    console.log('Attempting to create user profile for:', userData.id, userData.email)

    // First try using the RLS bypass function for server-side creation
    const { data, error } = await supabase
      .rpc('create_user_profile_bypass_rls', {
        user_id: userData.id,
        user_email: userData.email,
        user_full_name: userData.full_name || null
      })

    if (!error && data) {
      console.log('User profile created successfully using bypass function')
      return data
    }

    // If the function doesn't exist or fails, fall back to direct insert
    console.log('Bypass function failed, trying direct insert:', error?.message || error)

    const { data: insertData, error: insertError } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single()

    if (insertError) {
      console.error('Error creating user profile:', insertError)

      // If it's a unique violation, the user might already exist
      if (insertError.code === '23505') {
        console.log('User profile already exists, fetching existing profile')
        const { data: existingUser, error: fetchError } = await supabase
          .from('users')
          .select('*')
          .eq('id', userData.id)
          .single()

        if (fetchError) {
          console.error('Error fetching existing user:', fetchError)
          return null
        }

        return existingUser || null
      }

      return null
    }

    console.log('User profile created successfully via direct insert')
    return insertData
  } catch (error) {
    console.error('Error in createUserProfile:', error)
    return null
  }
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Error fetching user profile:', error)
    return null
  }

  return data
}

export async function updateUserProfile(userId: string, updates: UserUpdate): Promise<User | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating user profile:', error)
    return null
  }

  return data
}



export async function updateLastSync(userId: string): Promise<boolean> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('users')
    .update({
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating last sync:', error)
    return false
  }

  return true
}
