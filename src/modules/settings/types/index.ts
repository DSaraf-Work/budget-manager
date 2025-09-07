/**
 * Settings module type definitions
 * 
 * Defines TypeScript interfaces and types for the settings module including
 * Gmail integration, OAuth tokens, and email filtering.
 */

// ============================================================================
// GMAIL INTEGRATION TYPES
// ============================================================================

/**
 * Gmail OAuth connection status
 */
export interface GmailConnectionStatus {
  isConnected: boolean
  userEmail?: string
  connectedAt?: string
  lastSyncAt?: string
}

/**
 * Gmail OAuth tokens
 */
export interface GmailOAuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
  scope: string
}

/**
 * Gmail API email message
 */
export interface GmailMessage {
  id: string
  threadId: string
  snippet: string
  payload: {
    headers: Array<{
      name: string
      value: string
    }>
  }
  internalDate: string
}

/**
 * Processed email data for display
 */
export interface EmailData {
  id: string
  threadId: string
  subject: string
  from: string
  to: string
  date: string
  snippet: string
  body: string
  attachments: any[]
}

/**
 * Email filter criteria
 */
export interface EmailFilters {
  sender?: string
  startDate?: Date
  endDate?: Date
  query?: string
  page?: number
  pageSize?: number
}

/**
 * Email fetch result
 */
export interface EmailFetchResult {
  emails: EmailData[]
  totalCount: number
  nextPageToken?: string
  hasMore: boolean
}

/**
 * Date range preset options
 */
export interface DateRangePreset {
  id: string
  label: string
  startDate: Date
  endDate: Date
}

// ============================================================================
// API RESPONSE TYPES
// ============================================================================

/**
 * Gmail API list messages response
 */
export interface GmailListResponse {
  messages?: Array<{ id: string; threadId: string }>
  nextPageToken?: string
  resultSizeEstimate: number
}

/**
 * Gmail API get message response
 */
export interface GmailMessageResponse {
  id: string
  threadId: string
  labelIds: string[]
  snippet: string
  payload: {
    partId: string
    mimeType: string
    filename: string
    headers: Array<{
      name: string
      value: string
    }>
    body: {
      size: number
      data?: string
    }
  }
  sizeEstimate: number
  historyId: string
  internalDate: string
}

// ============================================================================
// ERROR TYPES
// ============================================================================

/**
 * Gmail integration error types
 */
export type GmailErrorType = 
  | 'OAUTH_ERROR'
  | 'API_ERROR'
  | 'RATE_LIMIT'
  | 'NETWORK_ERROR'
  | 'INVALID_TOKEN'
  | 'PERMISSION_DENIED'

/**
 * Gmail integration error
 */
export interface GmailError {
  type: GmailErrorType
  message: string
  details?: any
}

// ============================================================================
// SERVICE RESPONSE TYPES
// ============================================================================

/**
 * Generic service response
 */
export interface ServiceResponse<T> {
  success: boolean
  data?: T
  error?: GmailError
}

/**
 * OAuth connection response
 */
export type OAuthConnectionResponse = ServiceResponse<{
  userEmail: string
  connectedAt: string
}>

/**
 * Email fetch response
 */
export type EmailFetchResponse = ServiceResponse<EmailFetchResult>
