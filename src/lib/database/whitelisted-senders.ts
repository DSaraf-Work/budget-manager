import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type WhitelistedSender = Database['public']['Tables']['whitelisted_senders']['Row']
type WhitelistedSenderInsert = Database['public']['Tables']['whitelisted_senders']['Insert']
type WhitelistedSenderUpdate = Database['public']['Tables']['whitelisted_senders']['Update']

export async function createWhitelistedSender(
  senderData: WhitelistedSenderInsert
): Promise<WhitelistedSender | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('whitelisted_senders')
    .insert(senderData)
    .select()
    .single()

  if (error) {
    console.error('Error creating whitelisted sender:', error)
    return null
  }

  return data
}

export async function getWhitelistedSenders(userId: string): Promise<WhitelistedSender[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('whitelisted_senders')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching whitelisted senders:', error)
    return []
  }

  return data || []
}

export async function updateWhitelistedSender(
  id: string, 
  updates: WhitelistedSenderUpdate
): Promise<WhitelistedSender | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('whitelisted_senders')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating whitelisted sender:', error)
    return null
  }

  return data
}

export async function deleteWhitelistedSender(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('whitelisted_senders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting whitelisted sender:', error)
    return false
  }

  return true
}

export async function toggleSenderStatus(id: string, isActive: boolean): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('whitelisted_senders')
    .update({
      is_active: isActive,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error toggling sender status:', error)
    return false
  }

  return true
}

export async function isSenderWhitelisted(
  userId: string, 
  senderEmail: string
): Promise<boolean> {
  const supabase = await createClient()
  
  // Extract domain from email
  const domain = senderEmail.split('@')[1]
  
  const { data, error } = await supabase
    .from('whitelisted_senders')
    .select('id')
    .eq('user_id', userId)
    .eq('is_active', true)
    .or(`email_address.eq.${senderEmail},domain.eq.${domain}`)
    .limit(1)

  if (error) {
    console.error('Error checking whitelisted sender:', error)
    return false
  }

  return data && data.length > 0
}

export async function addDefaultWhitelistedSenders(userId: string): Promise<void> {
  const defaultSenders = [
    // Indian Banks
    { domain: 'hdfcbank.com', sender_name: 'HDFC Bank' },
    { domain: 'icicibank.com', sender_name: 'ICICI Bank' },
    { domain: 'sbi.co.in', sender_name: 'State Bank of India' },
    { domain: 'axisbank.com', sender_name: 'Axis Bank' },
    { domain: 'kotak.com', sender_name: 'Kotak Mahindra Bank' },
    
    // Credit Cards
    { domain: 'americanexpress.com', sender_name: 'American Express' },
    { domain: 'citibank.com', sender_name: 'Citibank' },
    
    // Payment Platforms
    { domain: 'paytm.com', sender_name: 'Paytm' },
    { domain: 'phonepe.com', sender_name: 'PhonePe' },
    { domain: 'googlepay.com', sender_name: 'Google Pay' },
    { domain: 'razorpay.com', sender_name: 'Razorpay' },
    
    // E-commerce
    { domain: 'amazon.in', sender_name: 'Amazon India' },
    { domain: 'flipkart.com', sender_name: 'Flipkart' },
    { domain: 'myntra.com', sender_name: 'Myntra' },
    
    // Utilities
    { domain: 'relianceenergy.com', sender_name: 'Reliance Energy' },
    { domain: 'adanielectricity.com', sender_name: 'Adani Electricity' },
  ]

  const supabase = await createClient()
  
  const insertData = defaultSenders.map(sender => ({
    user_id: userId,
    domain: sender.domain,
    sender_name: sender.sender_name,
    is_active: true,
    auto_approve: false,
  }))

  const { error } = await supabase
    .from('whitelisted_senders')
    .insert(insertData)

  if (error) {
    console.error('Error adding default whitelisted senders:', error)
  }
}
