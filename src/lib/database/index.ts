// Database helper functions
export * from './users'
export * from './gmail-messages'
export * from './transactions'
export * from './whitelisted-senders'
export * from './sync-logs'

// Common types
export type { Database } from '@/lib/supabase/types'

// Helper function to handle database errors
export function handleDatabaseError(error: any, operation: string): void {
  console.error(`Database error during ${operation}:`, error)
  
  // In production, you might want to send this to a logging service
  if (process.env.NODE_ENV === 'production') {
    // Send to logging service (e.g., Sentry, LogRocket, etc.)
  }
}

// Pagination helper
export interface PaginationOptions {
  page?: number
  limit?: number
}

export function getPaginationParams(options: PaginationOptions = {}) {
  const page = Math.max(1, options.page || 1)
  const limit = Math.min(100, Math.max(1, options.limit || 20))
  const offset = (page - 1) * limit
  
  return { limit, offset, page }
}

// Date range helper
export interface DateRangeOptions {
  startDate?: string
  endDate?: string
}

export function getDateRangeFilter(options: DateRangeOptions = {}) {
  const filters: string[] = []
  
  if (options.startDate) {
    filters.push(`created_at.gte.${options.startDate}`)
  }
  
  if (options.endDate) {
    filters.push(`created_at.lte.${options.endDate}`)
  }
  
  return filters.length > 0 ? filters.join(',') : null
}
