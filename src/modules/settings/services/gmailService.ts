/**
 * Gmail API service
 * 
 * Handles Gmail OAuth authentication, token management, and email fetching
 * using the Gmail API v1 with proper error handling and rate limiting.
 */

import { 
  GmailConnectionStatus, 
  GmailOAuthTokens, 
  EmailFilters, 
  EmailFetchResult,
  EmailData,
  GmailMessage,
  GmailListResponse,
  GmailMessageResponse,
  OAuthConnectionResponse,
  EmailFetchResponse,
  GmailError
} from '../types'

/**
 * Gmail API service class
 * 
 * Provides methods for OAuth authentication, token management, and email fetching
 * with proper error handling and rate limiting considerations.
 */
export class GmailService {
  private readonly GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1'
  private readonly OAUTH_SCOPE = 'https://www.googleapis.com/auth/gmail.readonly'
  
  // ============================================================================
  // OAUTH AUTHENTICATION
  // ============================================================================

  /**
   * Initiate Gmail OAuth flow
   *
   * @returns OAuth authorization URL
   */
  async initiateOAuth(): Promise<string> {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

    if (!clientId) {
      throw new Error('Google Client ID not configured')
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: `${window.location.origin}/settings/gmail/callback`,
      response_type: 'code',
      scope: this.OAUTH_SCOPE,
      access_type: 'offline',
      prompt: 'consent'
    })

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`
  }

  /**
   * Get auth headers for API requests
   */
  private async getAuthHeaders(): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Try to get current session token
    try {
      if (typeof window !== 'undefined') {
        // Get Supabase client
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data: { session } } = await supabase.auth.getSession()
        if (session?.access_token) {
          headers['Authorization'] = `Bearer ${session.access_token}`
          console.log('🔑 Added auth header to API request')
        } else {
          console.warn('⚠️ No session token available for API request')
        }
      }
    } catch (error) {
      console.warn('⚠️ Failed to get auth token for API request:', error)
    }

    return headers
  }

  /**
   * Exchange authorization code for tokens
   *
   * @param code - Authorization code from OAuth callback
   * @returns OAuth tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GmailOAuthTokens> {
    const headers = await this.getAuthHeaders()

    console.log('🔄 Exchanging OAuth code for tokens...')

    const response = await fetch('/api/gmail/oauth/token', {
      method: 'POST',
      headers,
      body: JSON.stringify({ code })
    })

    console.log('📡 OAuth token exchange response:', response.status, response.statusText)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error('❌ OAuth token exchange failed:', errorData)
      throw new Error(`Failed to exchange code for tokens: ${errorData.error || response.statusText}`)
    }

    const result = await response.json()
    console.log('✅ OAuth token exchange successful')
    return result
  }

  /**
   * Get current connection status
   *
   * @returns Connection status
   */
  async getConnectionStatus(): Promise<GmailConnectionStatus> {
    try {
      const headers = await this.getAuthHeaders()
      const response = await fetch('/api/gmail/status', { headers })

      if (!response.ok) {
        console.warn('Gmail status check failed:', response.status, response.statusText)
        return { isConnected: false }
      }

      return response.json()
    } catch (error) {
      console.error('Error getting Gmail connection status:', error)
      return { isConnected: false }
    }
  }

  /**
   * Disconnect Gmail account
   * 
   * @returns Success status
   */
  async disconnect(): Promise<boolean> {
    try {
      const response = await fetch('/api/gmail/disconnect', {
        method: 'POST'
      })

      return response.ok
    } catch (error) {
      console.error('Error disconnecting Gmail:', error)
      return false
    }
  }

  // ============================================================================
  // EMAIL FETCHING
  // ============================================================================

  /**
   * Fetch emails based on filters
   * 
   * @param filters - Email filter criteria
   * @param pageToken - Pagination token
   * @returns Email fetch result
   */
  async fetchEmails(
    filters: EmailFilters = {}
  ): Promise<EmailFetchResponse> {
    try {
      const queryParams = new URLSearchParams()

      if (filters.sender) {
        queryParams.append('sender', filters.sender)
      }

      if (filters.startDate) {
        queryParams.append('startDate', filters.startDate.toISOString())
      }

      if (filters.endDate) {
        queryParams.append('endDate', filters.endDate.toISOString())
      }

      if (filters.page && typeof filters.page === 'number' && !isNaN(filters.page)) {
        queryParams.append('page', filters.page.toString())
      }

      if (filters.pageSize && typeof filters.pageSize === 'number' && !isNaN(filters.pageSize)) {
        queryParams.append('pageSize', filters.pageSize.toString())
      }

      const headers = await this.getAuthHeaders()
      const response = await fetch(`/api/gmail/emails?${queryParams.toString()}`, { headers })
      
      if (!response.ok) {
        const errorData = await response.json()
        return {
          success: false,
          error: {
            type: 'API_ERROR',
            message: errorData.message || 'Failed to fetch emails',
            details: errorData
          }
        }
      }

      const data = await response.json()
      
      return {
        success: true,
        data
      }
    } catch (error) {
      console.error('Error fetching emails:', error)
      return {
        success: false,
        error: {
          type: 'NETWORK_ERROR',
          message: 'Network error while fetching emails',
          details: error
        }
      }
    }
  }

  /**
   * Test email fetch with current filters
   * 
   * @param filters - Email filter criteria
   * @returns Test result
   */
  async testEmailFetch(filters: EmailFilters): Promise<EmailFetchResponse> {
    return this.fetchEmails(filters)
  }

  // ============================================================================
  // UTILITY METHODS
  // ============================================================================

  /**
   * Build Gmail API query string from filters
   * 
   * @param filters - Email filter criteria
   * @returns Gmail API query string
   */
  private buildGmailQuery(filters: EmailFilters): string {
    const queryParts: string[] = []

    if (filters.sender) {
      queryParts.push(`from:${filters.sender}`)
    }

    if (filters.startDate) {
      const startDateStr = filters.startDate.toISOString().split('T')[0]
      queryParts.push(`after:${startDateStr}`)
    }

    if (filters.endDate) {
      const endDateStr = filters.endDate.toISOString().split('T')[0]
      queryParts.push(`before:${endDateStr}`)
    }

    return queryParts.join(' ')
  }

  /**
   * Process Gmail message data for display
   * 
   * @param message - Raw Gmail message
   * @returns Processed email data
   */
  private processEmailData(message: GmailMessageResponse): EmailData {
    const headers = message.payload.headers
    const sender = headers.find(h => h.name === 'From')?.value || 'Unknown'
    const subject = headers.find(h => h.name === 'Subject')?.value || 'No Subject'
    const date = new Date(parseInt(message.internalDate))

    return {
      id: message.id,
      sender,
      subject,
      snippet: message.snippet,
      date,
      threadId: message.threadId
    }
  }
}

// Export singleton instance
export const gmailService = new GmailService()
