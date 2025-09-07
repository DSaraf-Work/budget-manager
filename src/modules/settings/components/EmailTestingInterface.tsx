/**
 * Email Testing Interface Component
 * 
 * Provides email filtering controls and testing functionality for Gmail integration
 * with date range selection, sender filtering, and result display.
 */

'use client'

import { useState } from 'react'
import { EmailFilters, EmailData, DateRangePreset } from '../types'
import { gmailService } from '../services/gmailService'
import { DateRangeSelector } from './DateRangeSelector'
import { EmailResultsList } from './EmailResultsList'

/**
 * Email Testing Interface component
 * 
 * Provides comprehensive email testing functionality including filters,
 * date range selection, and result display with pagination.
 */
export function EmailTestingInterface() {
  const [filters, setFilters] = useState<EmailFilters>({})
  const [emails, setEmails] = useState<EmailData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)

  // ============================================================================
  // FILTER HANDLERS
  // ============================================================================

  /**
   * Handle sender filter change
   */
  const handleSenderChange = (sender: string) => {
    setFilters(prev => ({
      ...prev,
      sender: sender.trim() || undefined
    }))
  }

  /**
   * Handle date range change
   */
  const handleDateRangeChange = (startDate?: Date, endDate?: Date) => {
    setFilters(prev => ({
      ...prev,
      startDate,
      endDate
    }))
  }

  /**
   * Clear all filters
   */
  const clearFilters = () => {
    setFilters({})
    setEmails([])
    setError(null)
    setTotalCount(0)
    setHasMore(false)
  }

  // ============================================================================
  // EMAIL TESTING
  // ============================================================================

  /**
   * Test email fetch with current filters
   */
  const testEmailFetch = async () => {
    try {
      setLoading(true)
      setError(null)
      setEmails([])

      const response = await gmailService.testEmailFetch(filters)

      if (response.success && response.data) {
        setEmails(response.data.emails)
        setTotalCount(response.data.totalCount)
        setHasMore(response.data.hasMore)
      } else {
        setError(response.error?.message || 'Failed to fetch emails')
      }
    } catch (error) {
      console.error('Error testing email fetch:', error)
      setError('An unexpected error occurred while fetching emails')
    } finally {
      setLoading(false)
    }
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  /**
   * Check if filters are applied
   */
  const hasFilters = () => {
    return !!(filters.sender || filters.startDate || filters.endDate)
  }

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          🧪 Email Testing Interface
        </h3>
        <p className="text-gray-600">
          Test email fetching with different filters to see what data is available from your Gmail account.
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">
          Filter Controls
        </h4>
        
        <div className="space-y-4">
          {/* Sender Filter */}
          <div>
            <label htmlFor="sender-filter" className="block text-sm font-medium text-gray-700 mb-2">
              Sender Email Address
            </label>
            <input
              id="sender-filter"
              type="email"
              value={filters.sender || ''}
              onChange={(e) => handleSenderChange(e.target.value)}
              placeholder="e.g., noreply@amazon.com"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Filter emails by sender email address (optional)
            </p>
          </div>

          {/* Date Range Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date Range
            </label>
            <DateRangeSelector
              startDate={filters.startDate}
              endDate={filters.endDate}
              onChange={handleDateRangeChange}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4 pt-4">
            <button
              onClick={testEmailFetch}
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Testing...
                </>
              ) : (
                <>
                  <span className="mr-2">🔍</span>
                  Test Email Fetch
                </>
              )}
            </button>

            {hasFilters() && (
              <button
                onClick={clearFilters}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-red-800">Error</h4>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      {emails.length > 0 && (
        <EmailResultsList
          emails={emails}
          totalCount={totalCount}
          hasMore={hasMore}
          loading={loading}
        />
      )}

      {/* No Results */}
      {!loading && !error && emails.length === 0 && hasFilters() && (
        <div className="text-center py-8">
          <div className="text-4xl mb-4">📭</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">
            No emails found
          </h4>
          <p className="text-gray-600">
            No emails match your current filter criteria. Try adjusting your filters or expanding the date range.
          </p>
        </div>
      )}
    </div>
  )
}
