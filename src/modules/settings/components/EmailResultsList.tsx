/**
 * Email Results List Component
 * 
 * Displays email fetch results in a clean, paginated list with proper
 * formatting and user-friendly display of email data.
 */

'use client'

import { EmailData } from '../types'

/**
 * Email Results List props
 */
interface EmailResultsListProps {
  emails: EmailData[]
  totalCount: number
  hasMore: boolean
  loading: boolean
}

/**
 * Email Results List component
 * 
 * Renders email results in a clean list format with sender, subject,
 * date, and snippet information with proper formatting.
 */
export function EmailResultsList({
  emails,
  totalCount,
  hasMore,
  loading
}: EmailResultsListProps) {

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Format email sender for display
   */
  const formatSender = (sender: string): string => {
    // Extract email from "Name <email@domain.com>" format
    const emailMatch = sender.match(/<([^>]+)>/)
    if (emailMatch) {
      return emailMatch[1]
    }
    return sender
  }

  /**
   * Format date for display
   */
  const formatDate = (date: Date): string => {
    const now = new Date()
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } else if (diffInHours < 24 * 7) {
      return date.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  /**
   * Truncate text to specified length
   */
  const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-medium text-gray-900">
            Email Results
          </h4>
          <div className="text-sm text-gray-500">
            {totalCount > 0 ? (
              <>
                Showing {emails.length} of {totalCount} emails
                {hasMore && ' (more available)'}
              </>
            ) : (
              'No emails found'
            )}
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="divide-y divide-gray-200">
        {emails.map((email, index) => (
          <div key={email.id} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Sender and Date */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium text-sm">
                        {formatSender(email.sender).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatSender(email.sender)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDate(email.date)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Subject */}
                <h5 className="text-sm font-medium text-gray-900 mb-1">
                  {truncateText(email.subject, 80)}
                </h5>

                {/* Snippet */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {truncateText(email.snippet, 150)}
                </p>
              </div>

              {/* Actions */}
              <div className="ml-4 flex-shrink-0">
                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      {emails.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {hasMore ? (
                <span>More emails available - refine filters to see specific results</span>
              ) : (
                <span>All matching emails displayed</span>
              )}
            </div>
            
            {hasMore && (
              <div className="text-sm text-blue-600">
                <span>💡 Tip: Use more specific filters to narrow down results</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="px-6 py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Fetching emails...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && emails.length === 0 && (
        <div className="px-6 py-12 text-center">
          <div className="text-4xl mb-4">📭</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No emails found
          </h4>
          <p className="text-gray-600">
            Try adjusting your filters or expanding the date range to find emails.
          </p>
        </div>
      )}
    </div>
  )
}
