import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type User = Database['public']['Tables']['users']['Row']
type UserInsert = Database['public']['Tables']['users']['Insert']
type UserUpdate = Database['public']['Tables']['users']['Update']

export async function createUserProfile(userData: UserInsert): Promise<User | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('users')
    .insert(userData)
    .select()
    .single()

  if (error) {
    console.error('Error creating user profile:', error)
    return null
  }

  return data
}

export async function getUserProfile(userId: string): Promise<User | null> {
  const supabase = createClient()
  
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
  const supabase = createClient()
  
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

export async function updateGmailTokens(
  userId: string, 
  accessToken: string, 
  refreshToken: string
): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('users')
    .update({
      gmail_access_token: accessToken,
      gmail_refresh_token: refreshToken,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)

  if (error) {
    console.error('Error updating Gmail tokens:', error)
    return false
  }

  return true
}

export async function updateLastSync(userId: string): Promise<boolean> {
  const supabase = createClient()
  
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
