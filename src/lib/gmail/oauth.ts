import { google } from 'googleapis'
import { OAuth2Client } from 'google-auth-library'

const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly']

export class GmailOAuth {
  private oauth2Client: OAuth2Client

  constructor() {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const appUrl = process.env.APP_URL || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    if (!clientId || !clientSecret) {
      throw new Error('Missing Google OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET environment variables.')
    }

    this.oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
      `${appUrl}/api/gmail/callback`
    )
  }

  /**
   * Generate the URL for Gmail OAuth authorization
   */
  getAuthUrl(userId: string): string {
    return this.oauth2Client.generateAuthUrl({
      access_type: 'offline', // Required for refresh token
      scope: SCOPES,
      prompt: 'consent', // Force consent screen to ensure refresh token
      state: userId, // Pass user ID as state parameter
      include_granted_scopes: true, // Include previously granted scopes
      response_type: 'code', // Explicitly request authorization code
    })
  }

  /**
   * Exchange authorization code for tokens
   */
  async getTokensFromCode(code: string): Promise<{
    access_token: string
    refresh_token: string
    expiry_date: number
  } | null> {
    try {
      console.log('Exchanging authorization code for tokens...')

      const { tokens } = await this.oauth2Client.getToken(code)

      console.log('Received tokens:', {
        hasAccessToken: !!tokens.access_token,
        hasRefreshToken: !!tokens.refresh_token,
        expiryDate: tokens.expiry_date,
        scope: tokens.scope
      })

      if (!tokens.access_token) {
        throw new Error('Missing access token in response')
      }

      // If no refresh token, it might be because user already granted permission
      // In this case, we should force consent to get a new refresh token
      if (!tokens.refresh_token) {
        console.warn('No refresh token received. This usually happens when the user has already granted permission.')
        console.warn('To fix this, the user should:')
        console.warn('1. Go to https://myaccount.google.com/permissions')
        console.warn('2. Remove the Budget Manager app')
        console.warn('3. Try connecting Gmail again')
        throw new Error('No refresh token received. Please revoke app permissions in your Google Account settings and try again.')
      }

      console.log('Successfully obtained tokens with refresh token')

      return {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expiry_date: tokens.expiry_date || Date.now() + 3600000, // 1 hour default
      }
    } catch (error) {
      console.error('Error exchanging code for tokens:', error)
      if (error instanceof Error) {
        console.error('Error message:', error.message)
        console.error('Error stack:', error.stack)
      }
      return null
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{
    access_token: string
    expiry_date: number
  } | null> {
    try {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      })

      const { credentials } = await this.oauth2Client.refreshAccessToken()
      
      if (!credentials.access_token) {
        throw new Error('Failed to refresh access token')
      }

      return {
        access_token: credentials.access_token,
        expiry_date: credentials.expiry_date || Date.now() + 3600000,
      }
    } catch (error) {
      console.error('Error refreshing access token:', error)
      return null
    }
  }

  /**
   * Create authenticated Gmail client
   */
  createGmailClient(accessToken: string, refreshToken: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    })

    return google.gmail({ version: 'v1', auth: this.oauth2Client })
  }

  /**
   * Validate token and refresh if necessary
   */
  async validateAndRefreshToken(
    accessToken: string,
    refreshToken: string,
    expiryDate?: number
  ): Promise<{
    access_token: string
    refresh_token: string
    expiry_date: number
    refreshed: boolean
  } | null> {
    try {
      // Check if token is expired or will expire in the next 5 minutes
      const now = Date.now()
      const expiryBuffer = 5 * 60 * 1000 // 5 minutes
      
      if (expiryDate && expiryDate > now + expiryBuffer) {
        // Token is still valid
        return {
          access_token: accessToken,
          refresh_token: refreshToken,
          expiry_date: expiryDate,
          refreshed: false,
        }
      }

      // Token is expired or will expire soon, refresh it
      const refreshedTokens = await this.refreshAccessToken(refreshToken)
      
      if (!refreshedTokens) {
        return null
      }

      return {
        access_token: refreshedTokens.access_token,
        refresh_token: refreshToken, // Refresh token usually stays the same
        expiry_date: refreshedTokens.expiry_date,
        refreshed: true,
      }
    } catch (error) {
      console.error('Error validating/refreshing token:', error)
      return null
    }
  }

  /**
   * Revoke Gmail access
   */
  async revokeAccess(accessToken: string): Promise<boolean> {
    try {
      await this.oauth2Client.revokeToken(accessToken)
      return true
    } catch (error) {
      console.error('Error revoking access:', error)
      return false
    }
  }

  /**
   * Get user's Gmail profile information
   */
  async getUserProfile(accessToken: string, refreshToken: string): Promise<{
    email: string
    name?: string
  } | null> {
    try {
      const gmail = this.createGmailClient(accessToken, refreshToken)
      const response = await gmail.users.getProfile({ userId: 'me' })
      
      return {
        email: response.data.emailAddress || '',
        name: response.data.emailAddress?.split('@')[0],
      }
    } catch (error) {
      console.error('Error getting user profile:', error)
      return null
    }
  }
}
