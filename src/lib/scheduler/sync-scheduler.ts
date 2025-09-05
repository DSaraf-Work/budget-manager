import { GmailClient } from '@/lib/gmail/client'
import { TransactionProcessor } from '@/lib/transaction/processor'
import { 
  getUserProfile, 
  createSyncLog, 
  completeSyncLog, 
  updateLastSync 
} from '@/lib/database'

export interface SyncJob {
  userId: string
  syncType: 'scheduled' | 'manual'
  maxResults?: number
  hoursBack?: number
}

export class SyncScheduler {
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null

  /**
   * Start the sync scheduler
   */
  start(intervalMinutes: number = 60): void {
    if (this.isRunning) {
      console.log('Sync scheduler is already running')
      return
    }

    console.log(`Starting sync scheduler with ${intervalMinutes} minute intervals`)
    this.isRunning = true

    // Run immediately
    this.runScheduledSync()

    // Set up recurring sync
    this.intervalId = setInterval(() => {
      this.runScheduledSync()
    }, intervalMinutes * 60 * 1000)
  }

  /**
   * Stop the sync scheduler
   */
  stop(): void {
    if (!this.isRunning) {
      return
    }

    console.log('Stopping sync scheduler')
    this.isRunning = false

    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
  }

  /**
   * Run scheduled sync for all active users
   */
  private async runScheduledSync(): Promise<void> {
    try {
      console.log('Running scheduled sync for all users')

      // Get all active users with Gmail tokens
      const users = await this.getActiveUsers()
      console.log(`Found ${users.length} active users for sync`)

      // Process each user
      const syncPromises = users.map(user => 
        this.syncUserData({
          userId: user.id,
          syncType: 'scheduled',
          maxResults: 50,
          hoursBack: 1,
        })
      )

      const results = await Promise.allSettled(syncPromises)
      
      // Log results
      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length
      
      console.log(`Scheduled sync completed: ${successful} successful, ${failed} failed`)

    } catch (error) {
      console.error('Error in scheduled sync:', error)
    }
  }

  /**
   * Sync data for a specific user
   */
  async syncUserData(job: SyncJob): Promise<{
    success: boolean
    messagesFetched: number
    transactionsCreated: number
    error?: string
  }> {
    const { userId, syncType, maxResults = 50, hoursBack = 1 } = job

    try {
      console.log(`Starting sync for user ${userId}`)

      // Get user profile with Gmail tokens
      const userProfile = await getUserProfile(userId)
      
      if (!userProfile || !userProfile.gmail_access_token || !userProfile.gmail_refresh_token) {
        throw new Error('User does not have Gmail tokens')
      }

      // Create sync log
      const syncLog = await createSyncLog({
        user_id: userId,
        sync_type: syncType,
        sync_range_start: new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString(),
        sync_range_end: new Date().toISOString(),
      })

      if (!syncLog) {
        throw new Error('Failed to create sync log')
      }

      try {
        // Step 1: Sync Gmail messages
        const gmailClient = new GmailClient()
        const gmailResult = await gmailClient.syncMessages(
          userId,
          userProfile.gmail_access_token,
          userProfile.gmail_refresh_token,
          { maxResults, hoursBack }
        )

        if (!gmailResult.success) {
          throw new Error(gmailResult.error || 'Gmail sync failed')
        }

        console.log(`Gmail sync completed for user ${userId}: ${gmailResult.messagesFetched} messages`)

        // Step 2: Process transactions
        const processor = new TransactionProcessor()
        const processingResult = await processor.processUnprocessedMessages(userId)

        console.log(`Transaction processing completed for user ${userId}: ${processingResult.created} transactions`)

        // Complete sync log
        await completeSyncLog(syncLog.id, 'completed', {
          messages_fetched: gmailResult.messagesFetched,
          transactions_created: processingResult.created,
          transactions_updated: 0,
        })

        // Update user's last sync time
        await updateLastSync(userId)

        return {
          success: true,
          messagesFetched: gmailResult.messagesFetched,
          transactionsCreated: processingResult.created,
        }

      } catch (error: any) {
        // Complete sync log with error
        await completeSyncLog(syncLog.id, 'failed', {
          error_message: error.message,
        })

        throw error
      }

    } catch (error: any) {
      console.error(`Error syncing user ${userId}:`, error)
      return {
        success: false,
        messagesFetched: 0,
        transactionsCreated: 0,
        error: error.message,
      }
    }
  }

  /**
   * Get all active users with Gmail tokens
   */
  private async getActiveUsers(): Promise<Array<{ id: string; email: string }>> {
    try {
      // This would typically query the database for active users
      // For now, we'll return an empty array since we don't have a direct database connection here
      // In a real implementation, this would use a service or repository pattern
      
      console.log('Getting active users - implementation needed')
      return []

    } catch (error) {
      console.error('Error getting active users:', error)
      return []
    }
  }

  /**
   * Trigger manual sync for a user
   */
  async triggerManualSync(
    userId: string, 
    options: {
      maxResults?: number
      hoursBack?: number
    } = {}
  ): Promise<{
    success: boolean
    messagesFetched: number
    transactionsCreated: number
    error?: string
  }> {
    return this.syncUserData({
      userId,
      syncType: 'manual',
      maxResults: options.maxResults || 100,
      hoursBack: options.hoursBack || 24,
    })
  }

  /**
   * Get sync status
   */
  getStatus(): {
    isRunning: boolean
    intervalId: NodeJS.Timeout | null
  } {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId,
    }
  }
}

// Global scheduler instance
export const syncScheduler = new SyncScheduler()
