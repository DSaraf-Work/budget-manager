import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type GmailMessage = Database['public']['Tables']['gmail_messages']['Row']
type GmailMessageInsert = Database['public']['Tables']['gmail_messages']['Insert']
type GmailMessageUpdate = Database['public']['Tables']['gmail_messages']['Update']

export async function createGmailMessage(messageData: GmailMessageInsert): Promise<GmailMessage | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('gmail_messages')
    .insert(messageData)
    .select()
    .single()

  if (error) {
    console.error('Error creating Gmail message:', error)
    return null
  }

  return data
}

export async function getGmailMessage(messageId: string): Promise<GmailMessage | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('gmail_messages')
    .select('*')
    .eq('message_id', messageId)
    .single()

  if (error) {
    console.error('Error fetching Gmail message:', error)
    return null
  }

  return data
}

export async function getGmailMessagesByUser(
  userId: string,
  limit: number = 50,
  offset: number = 0
): Promise<GmailMessage[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('gmail_messages')
    .select('*')
    .eq('user_id', userId)
    .order('received_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching Gmail messages:', error)
    return []
  }

  return data || []
}

export async function updateGmailMessage(
  id: string, 
  updates: GmailMessageUpdate
): Promise<GmailMessage | null> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('gmail_messages')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating Gmail message:', error)
    return null
  }

  return data
}

export async function markMessageAsProcessed(
  messageId: string,
  status: 'processed' | 'failed' | 'skipped'
): Promise<boolean> {
  const supabase = createClient()
  
  const { error } = await supabase
    .from('gmail_messages')
    .update({
      processing_status: status,
      processed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('message_id', messageId)

  if (error) {
    console.error('Error marking message as processed:', error)
    return false
  }

  return true
}

export async function getUnprocessedMessages(userId: string): Promise<GmailMessage[]> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('gmail_messages')
    .select('*')
    .eq('user_id', userId)
    .eq('processing_status', 'pending')
    .order('received_at', { ascending: true })

  if (error) {
    console.error('Error fetching unprocessed messages:', error)
    return []
  }

  return data || []
}

export async function checkMessageExists(messageId: string): Promise<boolean> {
  const supabase = createClient()
  
  const { data, error } = await supabase
    .from('gmail_messages')
    .select('id')
    .eq('message_id', messageId)
    .single()

  return !error && !!data
}
