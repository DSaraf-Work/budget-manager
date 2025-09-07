/**
 * Date Range Selector Component
 * 
 * Provides date range selection with preset options and custom date pickers
 * for filtering emails by date range.
 */

'use client'

import { useState } from 'react'
import { DateRangePreset } from '../types'

/**
 * Date Range Selector props
 */
interface DateRangeSelectorProps {
  startDate?: Date
  endDate?: Date
  onChange: (startDate?: Date, endDate?: Date) => void
}

/**
 * Date Range Selector component
 * 
 * Provides preset date ranges and custom date selection for email filtering
 * with proper validation and user-friendly interface.
 */
export function DateRangeSelector({
  startDate,
  endDate,
  onChange
}: DateRangeSelectorProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>('')

  // ============================================================================
  // DATE RANGE PRESETS
  // ============================================================================

  const presets: DateRangePreset[] = [
    {
      id: 'last7days',
      label: 'Last 7 days',
      startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    {
      id: 'last30days',
      label: 'Last 30 days',
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    {
      id: 'thisMonth',
      label: 'This month',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
      endDate: new Date()
    },
    {
      id: 'lastMonth',
      label: 'Last month',
      startDate: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
      endDate: new Date(new Date().getFullYear(), new Date().getMonth(), 0)
    },
    {
      id: 'last3months',
      label: 'Last 3 months',
      startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
      endDate: new Date()
    },
    {
      id: 'thisYear',
      label: 'This year',
      startDate: new Date(new Date().getFullYear(), 0, 1),
      endDate: new Date()
    }
  ]

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  /**
   * Handle preset selection
   */
  const handlePresetSelect = (preset: DateRangePreset) => {
    setSelectedPreset(preset.id)
    onChange(preset.startDate, preset.endDate)
  }

  /**
   * Handle custom start date change
   */
  const handleStartDateChange = (date: string) => {
    const newStartDate = date ? new Date(date) : undefined
    setSelectedPreset('')
    onChange(newStartDate, endDate)
  }

  /**
   * Handle custom end date change
   */
  const handleEndDateChange = (date: string) => {
    const newEndDate = date ? new Date(date) : undefined
    setSelectedPreset('')
    onChange(startDate, newEndDate)
  }

  /**
   * Clear date range
   */
  const clearDateRange = () => {
    setSelectedPreset('')
    onChange(undefined, undefined)
  }

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  /**
   * Format date for input field
   */
  const formatDateForInput = (date?: Date): string => {
    if (!date) return ''
    return date.toISOString().split('T')[0]
  }

  /**
   * Check if date range is set
   */
  const hasDateRange = (): boolean => {
    return !!(startDate || endDate)
  }

  // ============================================================================
  // RENDER COMPONENT
  // ============================================================================

  return (
    <div className="space-y-4">
      {/* Preset Options */}
      <div>
        <p className="text-sm text-gray-600 mb-3">Quick presets:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
          {presets.map((preset) => (
            <button
              key={preset.id}
              onClick={() => handlePresetSelect(preset)}
              className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                selectedPreset === preset.id
                  ? 'bg-blue-100 border-blue-300 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Range */}
      <div>
        <p className="text-sm text-gray-600 mb-3">Or select custom range:</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              id="start-date"
              type="date"
              value={formatDateForInput(startDate)}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              id="end-date"
              type="date"
              value={formatDateForInput(endDate)}
              onChange={(e) => handleEndDateChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Current Selection Display */}
      {hasDateRange() && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <div className="text-sm text-blue-800">
              <span className="font-medium">Selected range:</span>
              {' '}
              {startDate ? startDate.toLocaleDateString() : 'No start date'}
              {' → '}
              {endDate ? endDate.toLocaleDateString() : 'No end date'}
            </div>
            <button
              onClick={clearDateRange}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Validation Warning */}
      {startDate && endDate && startDate > endDate && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex">
            <svg className="h-5 w-5 text-yellow-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-yellow-800">
              Start date should be before end date
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
