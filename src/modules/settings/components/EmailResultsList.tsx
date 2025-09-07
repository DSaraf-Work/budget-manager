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
  loading: boolean
  currentPage: number
  pageSize: number
  totalPages: number
  onPageChange: (page: number) => void
}

/**
 * Email Results List component
 * 
 * Renders email results in a clean list format with sender, subject,
 * date, and snippet information with proper formatting.
 */
/**
 * Pagination component for page numbers
 */
function PaginationControls({
  currentPage,
  totalPages,
  onPageChange,
  loading
}: {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  loading: boolean
}) {
  const getVisiblePages = (): (number | string)[] => {
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | string)[] = []

    // Always show first page
    pages.push(1)

    if (currentPage <= 4) {
      // Near the beginning
      pages.push(2, 3, 4, 5, '...', totalPages)
    } else if (currentPage >= totalPages - 3) {
      // Near the end
      pages.push('...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
    } else {
      // In the middle
      pages.push('...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages)
    }

    // Remove duplicates and ensure valid order
    const uniquePages: (number | string)[] = []
    const seen = new Set()

    for (const page of pages) {
      if (!seen.has(page)) {
        seen.add(page)
        uniquePages.push(page)
      }
    }

    return uniquePages
  }

  if (totalPages <= 1) return null

  const visiblePages = getVisiblePages()

  return (
    <div className="flex items-center justify-center space-x-1">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1 || loading}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Previous
      </button>

      {/* Page Numbers */}
      {visiblePages.map((page, index) => {
        try {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-sm font-medium text-gray-500">
                ...
              </span>
            )
          }

          const pageNumber = Number(page)
          if (isNaN(pageNumber) || pageNumber < 1) {
            return null
          }

          return (
            <button
              key={`page-${pageNumber}`}
              onClick={() => onPageChange(pageNumber)}
              disabled={loading}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                currentPage === pageNumber
                  ? 'bg-blue-600 text-white border border-blue-600'
                  : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {pageNumber}
            </button>
          )
        } catch (error) {
          console.error('Error rendering page button:', error)
          return null
        }
      }).filter(Boolean)}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages || loading}
        className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Next
      </button>
    </div>
  )
}

export function EmailResultsList({
  emails,
  totalCount,
  loading,
  currentPage,
  pageSize,
  totalPages,
  onPageChange
}: EmailResultsListProps) {
  // Sanitize props to ensure no event objects
  const safeEmails = Array.isArray(emails) ? emails.filter(email =>
    email && typeof email === 'object' && !email._reactName
  ) : []
  const safeTotalCount = Number(totalCount) || 0
  const safeCurrentPage = Number(currentPage) || 1
  const safeTotalPages = Number(totalPages) || 1

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Format email sender for display
   */
  const formatSender = (sender: any): string => {
    try {
      // Ensure we have a string value
      const senderStr = String(sender || '')
      if (!senderStr || senderStr === 'undefined' || senderStr === 'null') {
        return 'Unknown Sender'
      }
      // Extract email from "Name <email@domain.com>" format
      const emailMatch = senderStr.match(/<([^>]+)>/)
      if (emailMatch) {
        return emailMatch[1]
      }
      return senderStr
    } catch (error) {
      console.error('Error formatting sender:', error)
      return 'Unknown Sender'
    }
  }

  /**
   * Format date for display
   */
  const formatDate = (date: any): string => {
    try {
      // Ensure we have a valid date string
      const dateStr = String(date || '')
      if (!dateStr || dateStr === 'undefined' || dateStr === 'null') {
        return 'Unknown Date'
      }

      const dateObj = new Date(dateStr)
      if (!dateObj || isNaN(dateObj.getTime())) {
        return 'Invalid Date'
      }

      const now = new Date()
      const diffInHours = (now.getTime() - dateObj.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 24) {
        return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      } else if (diffInHours < 24 * 7) {
        return dateObj.toLocaleDateString([], { weekday: 'short', hour: '2-digit', minute: '2-digit' })
      } else {
        return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
      }
    } catch (error) {
      console.error('Error formatting date:', error)
      return 'Unknown Date'
    }
  }

  /**
   * Truncate text to specified length
   */
  const truncateText = (text: any, maxLength: number): string => {
    try {
      // Ensure we have a string value
      const textStr = String(text || '')
      if (!textStr || textStr === 'undefined' || textStr === 'null') {
        return ''
      }
      if (textStr.length <= maxLength) return textStr
      return textStr.substring(0, maxLength) + '...'
    } catch (error) {
      console.error('Error truncating text:', error)
      return ''
    }
  }

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div className="bg-white border border-gray-200 rounded-lg">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-medium text-gray-900">
            Email Results
          </h4>
          <div className="text-sm text-gray-500">
            {safeTotalCount > 0 ? (
              <>
                Showing {safeEmails.length} of {safeTotalCount} emails
                {safeTotalPages > 1 && (
                  <span className="ml-2">
                    (Page {safeCurrentPage} of {safeTotalPages})
                  </span>
                )}
              </>
            ) : (
              'No emails found'
            )}
          </div>
        </div>

        {/* Pagination Controls */}
        {safeTotalPages > 1 && (
          <div className="flex justify-center">
            <PaginationControls
              currentPage={safeCurrentPage}
              totalPages={safeTotalPages}
              onPageChange={onPageChange}
              loading={loading}
            />
          </div>
        )}
      </div>

      {/* Email List */}
      <div className="divide-y divide-gray-200">
        {safeEmails.map((email, index) => (
          <div key={`email-${email.id || index}`} className="px-6 py-4 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                {/* Sender and Date */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-medium text-sm">
                        {formatSender(email.from).charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatSender(email.from)}
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
              {currentPage < totalPages ? (
                <span>More emails available - use pagination to see more results</span>
              ) : (
                <span>All matching emails displayed</span>
              )}
            </div>
            
            {currentPage < totalPages && (
              <div className="text-sm text-blue-600">
                <span>💡 Tip: Use pagination controls to see more results</span>
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

      {/* Bottom Pagination Controls */}
      {emails.length > 0 && totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-center">
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              loading={loading}
            />
          </div>
        </div>
      )}
    </div>
  )
}
