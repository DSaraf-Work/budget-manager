import { TransactionExtractor, ExtractedTransaction } from './extractor'
import { 
  getUnprocessedMessages, 
  markMessageAsProcessed,
  createTransaction,
  updateSyncLog 
} from '@/lib/database'

export class TransactionProcessor {
  private extractor: TransactionExtractor

  constructor() {
    this.extractor = new TransactionExtractor()
  }

  /**
   * Process all unprocessed Gmail messages for a user
   */
  async processUnprocessedMessages(userId: string): Promise<{
    processed: number
    created: number
    failed: number
    errors: string[]
  }> {
    const result = {
      processed: 0,
      created: 0,
      failed: 0,
      errors: [] as string[]
    }

    try {
      // Get all unprocessed messages
      const messages = await getUnprocessedMessages(userId)
      console.log(`Processing ${messages.length} unprocessed messages for user ${userId}`)

      for (const message of messages) {
        try {
          result.processed++

          // Extract transaction data
          const extractedTransaction = this.extractor.extractTransaction(
            message.subject || '',
            message.raw_content || '',
            message.sender_email,
            new Date(message.received_at)
          )

          if (extractedTransaction) {
            // Create transaction record
            const transaction = await createTransaction({
              user_id: userId,
              gmail_message_id: message.id,
              status: 'review',
              amount: extractedTransaction.amount,
              currency: extractedTransaction.currency,
              merchant: extractedTransaction.merchant,
              payment_method: extractedTransaction.paymentMethod,
              payment_method_last4: extractedTransaction.paymentMethodLast4,
              transaction_date: extractedTransaction.transactionDate.toISOString(),
              transaction_type: extractedTransaction.transactionType,
              description: extractedTransaction.description,
              confidence_score: extractedTransaction.confidenceScore,
            })

            if (transaction) {
              result.created++
              await markMessageAsProcessed(message.message_id, 'processed')
              console.log(`Created transaction for message ${message.message_id}`)
            } else {
              result.failed++
              await markMessageAsProcessed(message.message_id, 'failed')
              result.errors.push(`Failed to create transaction for message ${message.message_id}`)
            }
          } else {
            // No transaction data could be extracted
            await markMessageAsProcessed(message.message_id, 'skipped')
            console.log(`Skipped message ${message.message_id} - no transaction data found`)
          }

        } catch (error: any) {
          result.failed++
          result.errors.push(`Error processing message ${message.id}: ${error.message}`)
          console.error(`Error processing message ${message.id}:`, error)
          
          try {
            await markMessageAsProcessed(message.message_id, 'failed')
          } catch (markError) {
            console.error('Error marking message as failed:', markError)
          }
        }
      }

      console.log(`Transaction processing complete for user ${userId}:`, result)
      return result

    } catch (error: any) {
      console.error('Error in processUnprocessedMessages:', error)
      result.errors.push(`Processing error: ${error.message}`)
      return result
    }
  }

  /**
   * Process a single Gmail message
   */
  async processSingleMessage(
    userId: string,
    messageId: string,
    subject: string,
    content: string,
    senderEmail: string,
    receivedAt: Date
  ): Promise<ExtractedTransaction | null> {
    try {
      const extractedTransaction = this.extractor.extractTransaction(
        subject,
        content,
        senderEmail,
        receivedAt
      )

      if (extractedTransaction) {
        // Create transaction record
        const transaction = await createTransaction({
          user_id: userId,
          gmail_message_id: messageId,
          status: 'review',
          amount: extractedTransaction.amount,
          currency: extractedTransaction.currency,
          merchant: extractedTransaction.merchant,
          payment_method: extractedTransaction.paymentMethod,
          payment_method_last4: extractedTransaction.paymentMethodLast4,
          transaction_date: extractedTransaction.transactionDate.toISOString(),
          transaction_type: extractedTransaction.transactionType,
          description: extractedTransaction.description,
          confidence_score: extractedTransaction.confidenceScore,
        })

        if (transaction) {
          console.log(`Created transaction for message ${messageId}`)
          return extractedTransaction
        }
      }

      return null

    } catch (error) {
      console.error(`Error processing single message ${messageId}:`, error)
      return null
    }
  }

  /**
   * Reprocess failed messages
   */
  async reprocessFailedMessages(userId: string): Promise<{
    reprocessed: number
    created: number
    stillFailed: number
  }> {
    // This would get messages marked as 'failed' and try to process them again
    // Implementation would be similar to processUnprocessedMessages
    // but filtering for failed status
    
    return {
      reprocessed: 0,
      created: 0,
      stillFailed: 0
    }
  }

  /**
   * Get processing statistics for a user
   */
  async getProcessingStats(userId: string): Promise<{
    totalMessages: number
    processedMessages: number
    pendingMessages: number
    failedMessages: number
    skippedMessages: number
    totalTransactions: number
  }> {
    // This would query the database to get processing statistics
    // Implementation would involve counting messages by processing_status
    // and counting total transactions
    
    return {
      totalMessages: 0,
      processedMessages: 0,
      pendingMessages: 0,
      failedMessages: 0,
      skippedMessages: 0,
      totalTransactions: 0
    }
  }
}
