import { createClient } from '@/lib/supabase/server'
import { Database } from '@/lib/supabase/types'

type SyncLog = Database['public']['Tables']['sync_logs']['Row']
type SyncLogInsert = Database['public']['Tables']['sync_logs']['Insert']
type SyncLogUpdate = Database['public']['Tables']['sync_logs']['Update']

export async function createSyncLog(syncData: SyncLogInsert): Promise<SyncLog | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sync_logs')
    .insert(syncData)
    .select()
    .single()

  if (error) {
    console.error('Error creating sync log:', error)
    return null
  }

  return data
}

export async function updateSyncLog(
  id: string, 
  updates: SyncLogUpdate
): Promise<SyncLog | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sync_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    console.error('Error updating sync log:', error)
    return null
  }

  return data
}

export async function completeSyncLog(
  id: string,
  status: 'completed' | 'failed',
  stats: {
    messages_fetched?: number
    transactions_created?: number
    transactions_updated?: number
    error_message?: string
  }
): Promise<boolean> {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('sync_logs')
    .update({
      status,
      completed_at: new Date().toISOString(),
      ...stats,
    })
    .eq('id', id)

  if (error) {
    console.error('Error completing sync log:', error)
    return false
  }

  return true
}

export async function getSyncLogs(
  userId: string,
  limit: number = 20
): Promise<SyncLog[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sync_logs')
    .select('*')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching sync logs:', error)
    return []
  }

  return data || []
}

export async function getLastSyncLog(userId: string): Promise<SyncLog | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sync_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'completed')
    .order('completed_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching last sync log:', error)
    return null
  }

  return data
}

export async function getSyncStats(userId: string): Promise<{
  totalSyncs: number
  successfulSyncs: number
  failedSyncs: number
  totalMessages: number
  totalTransactions: number
  lastSyncAt: string | null
}> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('sync_logs')
    .select('status, messages_fetched, transactions_created, completed_at')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching sync stats:', error)
    return {
      totalSyncs: 0,
      successfulSyncs: 0,
      failedSyncs: 0,
      totalMessages: 0,
      totalTransactions: 0,
      lastSyncAt: null,
    }
  }

  const stats = {
    totalSyncs: data.length,
    successfulSyncs: 0,
    failedSyncs: 0,
    totalMessages: 0,
    totalTransactions: 0,
    lastSyncAt: null as string | null,
  }

  data.forEach(log => {
    if (log.status === 'completed') {
      stats.successfulSyncs++
      stats.totalMessages += log.messages_fetched || 0
      stats.totalTransactions += log.transactions_created || 0
      
      if (!stats.lastSyncAt || (log.completed_at && log.completed_at > stats.lastSyncAt)) {
        stats.lastSyncAt = log.completed_at
      }
    } else if (log.status === 'failed') {
      stats.failedSyncs++
    }
  })

  return stats
}
