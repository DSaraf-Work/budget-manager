import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type Transaction = Database['public']['Tables']['transactions']['Row']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

export async function createTransaction(transactionData: TransactionInsert): Promise<Transaction | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .insert(transactionData)
    .select()
    .single()

  if (error) {
    console.error('Error creating transaction:', error)
    return null
  }

  return data
}

export async function getTransaction(id: string): Promise<Transaction | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching transaction:', error)
    return null
  }

  return data
}

export async function getTransactionsByUser(
  userId: string,
  status?: 'review' | 'saved' | 'ignored',
  limit: number = 50,
  offset: number = 0
): Promise<Transaction[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)

  if (status) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
    .order('transaction_date', { ascending: false })
    .range(offset, offset + limit - 1)

  if (error) {
    console.error('Error fetching transactions:', error)
    return []
  }

  return data || []
}

export async function updateTransaction(
  id: string, 
  updates: TransactionUpdate
): Promise<Transaction | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating transaction:', error)
    return null
  }

  return data
}

export async function approveTransaction(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('transactions')
    .update({
      status: 'saved',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error approving transaction:', error)
    return false
  }

  return true
}

export async function rejectTransaction(id: string): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('transactions')
    .update({
      status: 'ignored',
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)

  if (error) {
    console.error('Error rejecting transaction:', error)
    return false
  }

  return true
}

export async function getTransactionStats(userId: string): Promise<{
  total: number
  pending: number
  saved: number
  ignored: number
  totalAmount: number
}> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('status, amount')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching transaction stats:', error)
    return { total: 0, pending: 0, saved: 0, ignored: 0, totalAmount: 0 }
  }

  const stats = {
    total: data.length,
    pending: 0,
    saved: 0,
    ignored: 0,
    totalAmount: 0,
  }

  data.forEach(transaction => {
    switch (transaction.status) {
      case 'review':
        stats.pending++
        break
      case 'saved':
        stats.saved++
        stats.totalAmount += Number(transaction.amount)
        break
      case 'ignored':
        stats.ignored++
        break
    }
  })

  return stats
}

export async function searchTransactions(
  userId: string,
  searchTerm: string,
  limit: number = 50
): Promise<Transaction[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', userId)
    .or(`merchant.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
    .order('transaction_date', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error searching transactions:', error)
    return []
  }

  return data || []
}
