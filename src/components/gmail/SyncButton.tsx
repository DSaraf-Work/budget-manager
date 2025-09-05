'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface SyncButtonProps {
  onSyncComplete?: (result: any) => void
  disabled?: boolean
}

export function SyncButton({ onSyncComplete, disabled }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    messagesFetched?: number
    messagesProcessed?: number
    error?: string
  } | null>(null)

  const handleSync = async () => {
    try {
      setSyncing(true)
      setResult(null)

      const response = await fetch('/api/gmail/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxResults: 100,
          hoursBack: 24, // Sync last 24 hours
          syncType: 'manual',
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Sync failed')
      }

      setResult({
        success: true,
        messagesFetched: data.messagesFetched,
        messagesProcessed: data.messagesProcessed,
      })

      onSyncComplete?.(data)

    } catch (error: any) {
      setResult({
        success: false,
        error: error.message,
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="space-y-4">
      <Button
        onClick={handleSync}
        disabled={disabled || syncing}
        className="flex items-center"
      >
        <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Syncing...' : 'Sync Gmail'}
      </Button>

      {result && (
        <Alert variant={result.success ? 'success' : 'error'}>
          {result.success ? (
            <div className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              <div>
                <p className="font-medium">Sync completed successfully!</p>
                <p className="text-sm mt-1">
                  Fetched {result.messagesFetched} messages, processed {result.messagesProcessed} new messages
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 mr-2" />
              <div>
                <p className="font-medium">Sync failed</p>
                <p className="text-sm mt-1">{result.error}</p>
              </div>
            </div>
          )}
        </Alert>
      )}
    </div>
  )
}
