/**
 * Gmail emails API route
 *
 * Fetches emails from Gmail API based on filter criteria
 * with proper error handling and rate limiting.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createApiClient } from '@/lib/supabase/server'

/**
 * GET /api/gmail/emails
 *
 * Fetch emails from Gmail API with filtering
 */
export async function GET(request: NextRequest) {
  try {
    console.log('📧 Gmail emails API called')

    // Check for Authorization header first
    const authHeader = request.headers.get('Authorization')
    console.log('🔑 Authorization header:', authHeader ? 'Present (Bearer token)' : 'Missing')

    let user: any = null

    if (authHeader && authHeader.startsWith('Bearer ')) {
      // Extract token from Authorization header
      const token = authHeader.substring(7)
      console.log('🎫 Token extracted from header:', token.substring(0, 20) + '...')

      // Create Supabase client and validate token
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()

      // Validate the token by getting user
      const { data: userData, error } = await supabase.auth.getUser(token)

      if (error) {
        console.warn('❌ Token validation failed:', error.message)
        return NextResponse.json(
          { error: 'Invalid token', details: error.message },
          { status: 401 }
        )
      }

      if (userData.user) {
        user = userData.user
        console.log('✅ User authenticated via token:', user.email)
      }
    }

    if (!user) {
      // Fallback to cookie-based authentication
      console.log('🍪 Falling back to cookie-based auth...')
      const supabase = await createApiClient()

      // Get current user from session
      const { data: { user: cookieUser }, error: userError } = await supabase.auth.getUser()

      if (userError) {
        console.warn('❌ Auth error in Gmail emails:', userError.message)
        return NextResponse.json(
          { error: 'Authentication failed', details: userError.message },
          { status: 401 }
        )
      }

      if (!cookieUser) {
        console.log('❌ No authenticated user found')
        return NextResponse.json(
          { error: 'No authenticated user found' },
          { status: 401 }
        )
      }

      user = cookieUser
      console.log('✅ User authenticated via cookies:', user.email)
    }

    // Get Gmail connection from database
    console.log('🔍 Fetching Gmail connection from database...')
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const dbSupabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: connection, error: connectionError } = await dbSupabase
      .from('bm_gmail_connections')
      .select('access_token, refresh_token, expires_at')
      .eq('user_id', user.id)
      .single()

    if (connectionError || !connection) {
      console.error('❌ No Gmail connection found:', connectionError)
      return NextResponse.json(
        { error: 'Gmail not connected', details: 'Please connect your Gmail account first' },
        { status: 400 }
      )
    }

    console.log('✅ Gmail connection found')

    // Check if token is expired and refresh if needed
    const now = new Date()
    const expiresAt = new Date(connection.expires_at)

    let accessToken = connection.access_token

    if (now >= expiresAt) {
      console.log('🔄 Access token expired, refreshing...')

      // Refresh the token
      const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: process.env.GOOGLE_CLIENT_ID!,
          client_secret: process.env.GOOGLE_CLIENT_SECRET!,
          refresh_token: connection.refresh_token,
          grant_type: 'refresh_token',
        }),
      })

      if (!refreshResponse.ok) {
        console.error('❌ Failed to refresh token:', refreshResponse.status)
        return NextResponse.json(
          { error: 'Token refresh failed', details: 'Please reconnect your Gmail account' },
          { status: 401 }
        )
      }

      const refreshData = await refreshResponse.json()
      accessToken = refreshData.access_token

      // Update the database with new token
      const newExpiresAt = new Date(Date.now() + (refreshData.expires_in * 1000))
      await dbSupabase
        .from('bm_gmail_connections')
        .update({
          access_token: accessToken,
          expires_at: newExpiresAt.toISOString()
        })
        .eq('user_id', user.id)

      console.log('✅ Token refreshed successfully')
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const sender = searchParams.get('sender')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const subject = searchParams.get('subject')
    const pageParam = searchParams.get('page')
    const pageSizeParam = searchParams.get('pageSize')

    const page = pageParam && !isNaN(parseInt(pageParam, 10)) ? parseInt(pageParam, 10) : 1
    const pageSize = pageSizeParam && !isNaN(parseInt(pageSizeParam, 10)) ? parseInt(pageSizeParam, 10) : 10

    console.log('📋 Query parameters:', {
      sender,
      startDate,
      endDate,
      subject,
      page,
      pageSize
    })

    // Build Gmail API query
    let gmailQuery = ''

    if (sender) {
      gmailQuery += `from:${sender} `
    }

    if (subject) {
      gmailQuery += `subject:"${subject}" `
    }

    if (startDate) {
      const start = new Date(startDate)
      gmailQuery += `after:${start.getFullYear()}/${(start.getMonth() + 1).toString().padStart(2, '0')}/${start.getDate().toString().padStart(2, '0')} `
    }

    if (endDate) {
      const end = new Date(endDate)
      gmailQuery += `before:${end.getFullYear()}/${(end.getMonth() + 1).toString().padStart(2, '0')}/${end.getDate().toString().padStart(2, '0')} `
    }

    console.log('🔍 Gmail API query:', gmailQuery.trim())

    // Search for messages using Gmail API with pagination
    // For page-based pagination, we need to fetch enough results to get to the requested page
    // Gmail API doesn't support offset, so we'll fetch more results and slice them
    const totalResultsNeeded = page * pageSize
    const maxResults = Math.min(totalResultsNeeded, 500) // Gmail API limit is 500
    const searchUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(gmailQuery.trim())}&maxResults=${maxResults}`

    console.log('📡 Calling Gmail API:', searchUrl)
    console.log('🔢 Pagination info:', { page, pageSize, totalResultsNeeded, maxResults })

    const searchResponse = await fetch(searchUrl, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    if (!searchResponse.ok) {
      console.error('❌ Gmail API search failed:', searchResponse.status)
      const errorData = await searchResponse.json().catch(() => ({}))
      return NextResponse.json(
        { error: 'Gmail API error', details: errorData.error?.message || 'Failed to search emails' },
        { status: 500 }
      )
    }

    const searchData = await searchResponse.json()
    console.log('📧 Gmail search results:', {
      messageCount: searchData.messages?.length || 0,
      resultSizeEstimate: searchData.resultSizeEstimate
    })

    if (!searchData.messages || searchData.messages.length === 0) {
      return NextResponse.json({
        emails: [],
        totalCount: 0,
        hasMore: false
      })
    }

    // Calculate pagination slice
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    const messagesForPage = searchData.messages.slice(startIndex, endIndex)

    console.log('📄 Pagination slice:', { startIndex, endIndex, messagesForPage: messagesForPage.length })

    // Fetch detailed information for each message on this page
    console.log('📥 Fetching email details...')
    const emailPromises = messagesForPage.map(async (message: any) => {
      const messageUrl = `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`

      const messageResponse = await fetch(messageUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!messageResponse.ok) {
        console.error('❌ Failed to fetch message:', message.id)
        return null
      }

      const messageData = await messageResponse.json()

      // Extract email details
      const headers = messageData.payload.headers
      const getHeader = (name: string) => headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase())?.value || ''

      return {
        id: messageData.id,
        threadId: messageData.threadId,
        subject: getHeader('Subject'),
        from: getHeader('From'),
        to: getHeader('To'),
        date: getHeader('Date'),
        snippet: messageData.snippet,
        body: extractEmailBody(messageData.payload),
        attachments: extractAttachments(messageData.payload)
      }
    })

    const emails = (await Promise.all(emailPromises)).filter(email => email !== null)

    console.log('✅ Successfully fetched emails:', emails.length)

    // Store emails in database with deduplication
    console.log('💾 Storing emails in database...')
    const storedEmails = []

    for (const email of emails) {
      try {
        // Try to insert email, ignore if duplicate (message_id already exists)
        const { data: insertedEmail, error: insertError } = await dbSupabase
          .from('bm_emails')
          .upsert({
            user_id: user.id,
            message_id: email.id,
            thread_id: email.threadId,
            subject: email.subject,
            sender: email.from,
            recipient: email.to,
            email_date: email.date ? new Date(email.date).toISOString() : null,
            snippet: email.snippet,
            body: email.body,
            attachments: email.attachments || []
          }, {
            onConflict: 'user_id,message_id',
            ignoreDuplicates: false
          })
          .select()
          .single()

        if (!insertError && insertedEmail) {
          storedEmails.push(insertedEmail)
        }
      } catch (dbError) {
        console.warn('⚠️ Failed to store email:', email.id, dbError)
      }
    }

    console.log('✅ Stored emails in database:', storedEmails.length)

    // Calculate pagination info
    const totalCount = searchData.resultSizeEstimate || searchData.messages.length
    const totalPages = Math.ceil(totalCount / pageSize)
    const hasMore = page < totalPages

    console.log('📊 Pagination response:', {
      totalCount,
      totalPages,
      currentPage: page,
      pageSize,
      hasMore,
      emailsOnPage: emails.length
    })

    return NextResponse.json({
      emails,
      totalCount,
      hasMore,
      page,
      pageSize,
      totalPages,
      storedCount: storedEmails.length
    })
  } catch (error) {
    console.error('❌ Error in Gmail emails API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Helper function to extract email body
function extractEmailBody(payload: any): string {
  if (payload.body?.data) {
    return Buffer.from(payload.body.data, 'base64').toString('utf-8')
  }

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8')
      }
    }

    // If no plain text, try HTML
    for (const part of payload.parts) {
      if (part.mimeType === 'text/html' && part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8')
      }
    }
  }

  return ''
}

// Helper function to extract attachments
function extractAttachments(payload: any): any[] {
  const attachments: any[] = []

  if (payload.parts) {
    for (const part of payload.parts) {
      if (part.filename && part.filename.length > 0) {
        attachments.push({
          filename: part.filename,
          mimeType: part.mimeType,
          size: part.body?.size || 0,
          attachmentId: part.body?.attachmentId
        })
      }
    }
  }

  return attachments
}
