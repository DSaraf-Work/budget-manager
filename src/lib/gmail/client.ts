import { google, gmail_v1 } from 'googleapis'
import { GmailOAuth } from './oauth'
import { 
  createGmailMessage, 
  checkMessageExists, 
  markMessageAsProcessed,
  isSenderWhitelisted 
} from '@/lib/database'

export interface GmailMessageData {
  messageId: string
  threadId: string
  subject: string
  senderEmail: string
  senderName: string
  receivedAt: Date
  snippet: string
  labels: string[]
  rawContent: string
}

export class GmailClient {
  private gmailOAuth: GmailOAuth
  private gmail: gmail_v1.Gmail | null = null

  constructor() {
    this.gmailOAuth = new GmailOAuth()
  }

  /**
   * Initialize Gmail client with user tokens
   */
  async initialize(accessToken: string, refreshToken: string): Promise<boolean> {
    try {
      // Validate and refresh tokens if necessary
      const validTokens = await this.gmailOAuth.validateAndRefreshToken(
        accessToken,
        refreshToken
      )

      if (!validTokens) {
        console.error('Failed to validate Gmail tokens')
        return false
      }

      // Create authenticated Gmail client
      this.gmail = this.gmailOAuth.createGmailClient(
        validTokens.access_token,
        validTokens.refresh_token
      )

      return true
    } catch (error) {
      console.error('Error initializing Gmail client:', error)
      return false
    }
  }

  /**
   * Fetch messages from Gmail with optional date range
   */
  async fetchMessages(
    userId: string,
    options: {
      maxResults?: number
      after?: Date
      before?: Date
      query?: string
    } = {}
  ): Promise<GmailMessageData[]> {
    if (!this.gmail) {
      throw new Error('Gmail client not initialized')
    }

    try {
      const {
        maxResults = 100,
        after,
        before,
        query = ''
      } = options

      // Build Gmail search query
      let searchQuery = query
      
      if (after) {
        const afterDate = Math.floor(after.getTime() / 1000)
        searchQuery += ` after:${afterDate}`
      }
      
      if (before) {
        const beforeDate = Math.floor(before.getTime() / 1000)
        searchQuery += ` before:${beforeDate}`
      }

      // Add filters for transaction-related emails
      searchQuery += ' (from:bank OR from:card OR from:payment OR from:transaction OR from:alert OR from:statement)'

      console.log(`Fetching Gmail messages with query: ${searchQuery}`)

      // List messages
      const listResponse = await this.gmail.users.messages.list({
        userId: 'me',
        q: searchQuery.trim(),
        maxResults,
      })

      const messages = listResponse.data.messages || []
      console.log(`Found ${messages.length} messages`)

      // Fetch detailed message data
      const messagePromises = messages.map(message => 
        this.fetchMessageDetails(message.id!, userId)
      )

      const detailedMessages = await Promise.allSettled(messagePromises)
      
      return detailedMessages
        .filter((result): result is PromiseFulfilledResult<GmailMessageData | null> => 
          result.status === 'fulfilled' && result.value !== null
        )
        .map(result => result.value!)

    } catch (error) {
      console.error('Error fetching Gmail messages:', error)
      throw error
    }
  }

  /**
   * Fetch detailed message data
   */
  private async fetchMessageDetails(
    messageId: string, 
    userId: string
  ): Promise<GmailMessageData | null> {
    if (!this.gmail) {
      throw new Error('Gmail client not initialized')
    }

    try {
      // Check if message already exists in database
      const exists = await checkMessageExists(messageId)
      if (exists) {
        console.log(`Message ${messageId} already exists, skipping`)
        return null
      }

      // Fetch message details
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full',
      })

      const message = response.data
      if (!message) {
        return null
      }

      // Extract message data
      const headers = message.payload?.headers || []
      const subject = this.getHeader(headers, 'Subject') || ''
      const from = this.getHeader(headers, 'From') || ''
      const date = this.getHeader(headers, 'Date') || ''
      
      // Parse sender information
      const { email: senderEmail, name: senderName } = this.parseSender(from)
      
      // Check if sender is whitelisted
      const isWhitelisted = await isSenderWhitelisted(userId, senderEmail)
      if (!isWhitelisted) {
        console.log(`Sender ${senderEmail} not whitelisted, skipping message`)
        return null
      }

      // Extract message content
      const rawContent = this.extractTextContent(message.payload)
      
      return {
        messageId: message.id!,
        threadId: message.threadId!,
        subject,
        senderEmail,
        senderName,
        receivedAt: new Date(date),
        snippet: message.snippet || '',
        labels: message.labelIds || [],
        rawContent,
      }

    } catch (error) {
      console.error(`Error fetching message details for ${messageId}:`, error)
      return null
    }
  }

  /**
   * Save Gmail message to database
   */
  async saveMessage(userId: string, messageData: GmailMessageData): Promise<boolean> {
    try {
      const gmailMessage = await createGmailMessage({
        user_id: userId,
        message_id: messageData.messageId,
        thread_id: messageData.threadId,
        subject: messageData.subject,
        sender_email: messageData.senderEmail,
        sender_name: messageData.senderName,
        received_at: messageData.receivedAt.toISOString(),
        raw_content: messageData.rawContent,
        snippet: messageData.snippet,
        labels: messageData.labels,
        processing_status: 'pending',
      })

      return !!gmailMessage
    } catch (error) {
      console.error('Error saving Gmail message:', error)
      return false
    }
  }

  /**
   * Extract header value by name
   */
  private getHeader(headers: gmail_v1.Schema$MessagePartHeader[], name: string): string | null {
    const header = headers.find(h => h.name?.toLowerCase() === name.toLowerCase())
    return header?.value || null
  }

  /**
   * Parse sender information from From header
   */
  private parseSender(from: string): { email: string; name: string } {
    // Handle formats like "Name <email@domain.com>" or just "email@domain.com"
    const emailMatch = from.match(/<([^>]+)>/)
    const email = emailMatch ? emailMatch[1] : from.trim()
    
    let name = ''
    if (emailMatch) {
      name = from.replace(/<[^>]+>/, '').trim().replace(/"/g, '')
    } else {
      name = email.split('@')[0]
    }

    return { email, name }
  }

  /**
   * Extract text content from message payload
   */
  private extractTextContent(payload: gmail_v1.Schema$MessagePart | undefined): string {
    if (!payload) return ''

    let content = ''

    // If this part has text content
    if (payload.body?.data) {
      const decodedContent = Buffer.from(payload.body.data, 'base64').toString('utf-8')
      content += decodedContent + '\n'
    }

    // Recursively extract from parts
    if (payload.parts) {
      for (const part of payload.parts) {
        if (part.mimeType?.startsWith('text/')) {
          content += this.extractTextContent(part)
        }
      }
    }

    return content.trim()
  }

  /**
   * Sync messages for a user
   */
  async syncMessages(
    userId: string,
    accessToken: string,
    refreshToken: string,
    options: {
      maxResults?: number
      hoursBack?: number
    } = {}
  ): Promise<{
    success: boolean
    messagesFetched: number
    messagesProcessed: number
    error?: string
  }> {
    try {
      const { maxResults = 100, hoursBack = 1 } = options

      // Initialize Gmail client
      const initialized = await this.initialize(accessToken, refreshToken)
      if (!initialized) {
        return {
          success: false,
          messagesFetched: 0,
          messagesProcessed: 0,
          error: 'Failed to initialize Gmail client'
        }
      }

      // Calculate date range
      const after = new Date(Date.now() - hoursBack * 60 * 60 * 1000)

      // Fetch messages
      const messages = await this.fetchMessages(userId, {
        maxResults,
        after,
      })

      console.log(`Fetched ${messages.length} new messages for user ${userId}`)

      // Save messages to database
      let processedCount = 0
      for (const message of messages) {
        const saved = await this.saveMessage(userId, message)
        if (saved) {
          processedCount++
        }
      }

      return {
        success: true,
        messagesFetched: messages.length,
        messagesProcessed: processedCount,
      }

    } catch (error: any) {
      console.error('Error syncing Gmail messages:', error)
      return {
        success: false,
        messagesFetched: 0,
        messagesProcessed: 0,
        error: error.message
      }
    }
  }
}
