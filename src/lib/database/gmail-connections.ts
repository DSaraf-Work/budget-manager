import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type GmailConnection = Database['public']['Tables']['gmail_connections']['Row']
type GmailConnectionInsert = Database['public']['Tables']['gmail_connections']['Insert']
type GmailConnectionUpdate = Database['public']['Tables']['gmail_connections']['Update']

/**
 * Create a new Gmail connection for a user
 */
export async function createGmailConnection(connectionData: GmailConnectionInsert): Promise<GmailConnection | null> {
  console.log('=== CREATE GMAIL CONNECTION START ===')
  console.log('Connection data received:', {
    user_id: connectionData.user_id,
    gmail_email: connectionData.gmail_email,
    access_token_length: connectionData.access_token?.length || 0,
    refresh_token_length: connectionData.refresh_token?.length || 0,
    expires_at: connectionData.expires_at,
    is_active: connectionData.is_active,
    sync_status: connectionData.sync_status,
    error_count: connectionData.error_count
  })

  const supabase = await createClient()

  const insertData = {
    ...connectionData,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  console.log('Data to insert:', {
    user_id: insertData.user_id,
    gmail_email: insertData.gmail_email,
    access_token_length: insertData.access_token?.length || 0,
    refresh_token_length: insertData.refresh_token?.length || 0,
    expires_at: insertData.expires_at,
    is_active: insertData.is_active,
    sync_status: insertData.sync_status,
    error_count: insertData.error_count,
    created_at: insertData.created_at,
    updated_at: insertData.updated_at
  })

  console.log('Attempting to insert Gmail connection into database...')
  const { data, error } = await supabase
    .from('gmail_connections')
    .insert(insertData)
    .select()
    .single()

  console.log('Database insert result:', {
    hasData: !!data,
    hasError: !!error,
    errorCode: error?.code,
    errorMessage: error?.message,
    errorDetails: error?.details,
    errorHint: error?.hint,
    dataId: data?.id,
    dataEmail: data?.gmail_email
  })

  if (error) {
    console.error('Database error creating Gmail connection:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      fullError: error
    })
    return null
  }

  if (!data) {
    console.error('No data returned from Gmail connection insert')
    return null
  }

  console.log('Gmail connection created successfully:', {
    id: data.id,
    gmail_email: data.gmail_email,
    user_id: data.user_id,
    is_active: data.is_active,
    sync_status: data.sync_status
  })
  console.log('=== CREATE GMAIL CONNECTION SUCCESS ===')

  return data
}

/**
 * Get all Gmail connections for a user
 */
export async function getGmailConnections(userId: string): Promise<GmailConnection[]> {
  console.log('=== GET GMAIL CONNECTIONS START ===')
  console.log('Fetching Gmail connections for user:', userId)

  const supabase = await createClient()

  // First, verify the user is authenticated
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  console.log('Auth check in getGmailConnections:', {
    hasUser: !!user,
    userId: user?.id,
    requestedUserId: userId,
    userMatch: user?.id === userId,
    authError: authError?.message
  })

  const { data, error } = await supabase
    .from('gmail_connections')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  console.log('Database query result:', {
    hasData: !!data,
    dataLength: data?.length || 0,
    hasError: !!error,
    errorCode: error?.code,
    errorMessage: error?.message,
    errorDetails: error?.details,
    errorHint: error?.hint
  })

  if (error) {
    console.error('Error fetching Gmail connections:', {
      code: error.code,
      message: error.message,
      details: error.details,
      hint: error.hint,
      userId: userId,
      authUserId: user?.id
    })

    // Don't return empty array for permission errors - let the caller handle it
    if (error.code === '42501') {
      throw new Error(`Database permission error: ${error.message}. User ID: ${userId}, Auth User ID: ${user?.id}`)
    }

    return []
  }

  console.log('Successfully fetched Gmail connections:', data?.length || 0)
  return data || []
}

/**
 * Get active Gmail connections for a user
 */
export async function getActiveGmailConnections(userId: string): Promise<GmailConnection[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('gmail_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching active Gmail connections:', error)
    return []
  }

  return data || []
}

/**
 * Get a specific Gmail connection by ID
 */
export async function getGmailConnection(connectionId: string): Promise<GmailConnection | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('gmail_connections')
    .select('*')
    .eq('id', connectionId)
    .single()

  if (error) {
    console.error('Error fetching Gmail connection:', error)
    return null
  }

  return data
}

/**
 * Get Gmail connection by user ID and Gmail email
 */
export async function getGmailConnectionByEmail(userId: string, gmailEmail: string): Promise<GmailConnection | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('gmail_connections')
    .select('*')
    .eq('user_id', userId)
    .eq('gmail_email', gmailEmail)
    .eq('is_active', true)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      // No rows returned - connection doesn't exist
      return null
    }
    console.error('Error fetching Gmail connection by email:', error)
    return null
  }

  return data
}

/**
 * Update Gmail connection tokens
 */
export async function updateGmailConnectionTokens(
  connectionId: string,
  accessToken: string,
  refreshToken: string,
  expiresAt?: Date
): Promise<boolean> {
  const supabase = await createClient()
  
  const updateData: GmailConnectionUpdate = {
    access_token: accessToken,
    refresh_token: refreshToken,
    updated_at: new Date().toISOString()
  }

  if (expiresAt) {
    updateData.expires_at = expiresAt.toISOString()
  }

  const { error } = await supabase
    .from('gmail_connections')
    .update(updateData)
    .eq('id', connectionId)

  if (error) {
    console.error('Error updating Gmail connection tokens:', error)
    return false
  }

  return true
}

/**
 * Update Gmail connection sync status
 */
export async function updateGmailConnectionSync(
  connectionId: string,
  syncStatus: 'pending' | 'syncing' | 'completed' | 'error',
  errorCount?: number
): Promise<boolean> {
  const supabase = await createClient()
  
  const updateData: GmailConnectionUpdate = {
    sync_status: syncStatus,
    last_sync_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }

  if (errorCount !== undefined) {
    updateData.error_count = errorCount
  }

  const { error } = await supabase
    .from('gmail_connections')
    .update(updateData)
    .eq('id', connectionId)

  if (error) {
    console.error('Error updating Gmail connection sync status:', error)
    return false
  }

  return true
}

/**
 * Deactivate a Gmail connection (soft delete)
 */
export async function deactivateGmailConnection(connectionId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('gmail_connections')
    .update({
      is_active: false,
      updated_at: new Date().toISOString()
    })
    .eq('id', connectionId)

  if (error) {
    console.error('Error deactivating Gmail connection:', error)
    return false
  }

  return true
}

/**
 * Permanently delete a Gmail connection
 */
export async function deleteGmailConnection(connectionId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('gmail_connections')
    .delete()
    .eq('id', connectionId)

  if (error) {
    console.error('Error deleting Gmail connection:', error)
    return false
  }

  return true
}

/**
 * Check if user has any active Gmail connections
 */
export async function hasActiveGmailConnections(userId: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('gmail_connections')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .limit(1)

  if (error) {
    console.error('Error checking for active Gmail connections:', error)
    return false
  }

  return (data?.length || 0) > 0
}

/**
 * Get Gmail connections that need token refresh
 */
export async function getGmailConnectionsNeedingRefresh(): Promise<GmailConnection[]> {
  const supabase = await createClient()
  
  // Get connections that expire in the next 10 minutes
  const refreshThreshold = new Date(Date.now() + 10 * 60 * 1000).toISOString()
  
  const { data, error } = await supabase
    .from('gmail_connections')
    .select('*')
    .eq('is_active', true)
    .lt('expires_at', refreshThreshold)

  if (error) {
    console.error('Error fetching Gmail connections needing refresh:', error)
    return []
  }

  return data || []
}
