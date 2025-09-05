'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { 
  Play, 
  Pause, 
  RefreshCw, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Activity
} from 'lucide-react'

interface SyncStatusProps {
  className?: string
}

export function SyncStatus({ className }: SyncStatusProps) {
  const [status, setStatus] = useState<{
    isRunning: boolean
    intervalId: NodeJS.Timeout | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    fetchStatus()
    
    // Refresh status every 30 seconds
    const interval = setInterval(fetchStatus, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchStatus = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/sync/schedule')
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch status')
      }

      setStatus(data.status)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (action: 'start' | 'stop') => {
    try {
      setActionLoading(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/sync/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          intervalMinutes: 60, // 1 hour
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || `Failed to ${action} scheduler`)
      }

      setStatus(data.status)
      setSuccess(data.message)

    } catch (error: any) {
      setError(error.message)
    } finally {
      setActionLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-4 ${className}`}>
        <RefreshCw className="h-5 w-5 animate-spin text-blue-600" />
        <span className="ml-2 text-sm text-gray-600">Loading sync status...</span>
      </div>
    )
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <Alert variant="error">
          {error}
        </Alert>
      )}

      {success && (
        <Alert variant="success">
          {success}
        </Alert>
      )}

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`flex items-center justify-center h-10 w-10 rounded-md ${
              status?.isRunning ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              {status?.isRunning ? (
                <Activity className="h-5 w-5 text-green-600" />
              ) : (
                <Clock className="h-5 w-5 text-gray-400" />
              )}
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Automatic Sync
              </h3>
              <p className="text-sm text-gray-500">
                {status?.isRunning 
                  ? 'Running - syncs every hour automatically'
                  : 'Stopped - no automatic syncing'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className={`flex items-center text-sm ${
              status?.isRunning ? 'text-green-600' : 'text-gray-500'
            }`}>
              {status?.isRunning ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-1" />
                  Active
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Inactive
                </>
              )}
            </div>

            {status?.isRunning ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('stop')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <Pause className="h-4 w-4 mr-2" />
                    Stop
                  </>
                )}
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => handleAction('start')}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </>
                )}
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={fetchStatus}
              disabled={loading}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>

        {status?.isRunning && (
          <div className="mt-4 p-4 bg-green-50 rounded-md">
            <div className="flex">
              <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
              <div className="ml-3">
                <h4 className="text-sm font-medium text-green-800">
                  Automatic sync is active
                </h4>
                <div className="mt-2 text-sm text-green-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Gmail messages are fetched every hour</li>
                    <li>New transactions are automatically extracted</li>
                    <li>You'll be notified of any sync issues</li>
                    <li>Manual sync is still available anytime</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
