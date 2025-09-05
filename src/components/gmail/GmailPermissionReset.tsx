'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { ExternalLink, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'

interface GmailPermissionResetProps {
  onRetry?: () => void
  onClose?: () => void
}

export function GmailPermissionReset({ onRetry, onClose }: GmailPermissionResetProps) {
  const [step, setStep] = useState(1)
  const [isRetrying, setIsRetrying] = useState(false)

  const handleRetry = async () => {
    setIsRetrying(true)
    try {
      if (onRetry) {
        await onRetry()
      }
    } finally {
      setIsRetrying(false)
    }
  }

  const steps = [
    {
      title: "Open Google Account Settings",
      description: "Go to your Google Account permissions page",
      action: (
        <Button
          variant="outline"
          onClick={() => {
            window.open('https://myaccount.google.com/permissions', '_blank')
            setStep(2)
          }}
          className="w-full"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Open Google Account Settings
        </Button>
      )
    },
    {
      title: "Find Budget Manager App",
      description: "Look for 'Budget Manager' in your connected apps list",
      action: (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Look for an app named "Budget Manager" or with your Google Client ID
          </p>
          <Button
            variant="outline"
            onClick={() => setStep(3)}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Found the App
          </Button>
        </div>
      )
    },
    {
      title: "Remove App Access",
      description: "Click on Budget Manager and remove its access",
      action: (
        <div className="space-y-2">
          <p className="text-sm text-gray-600">
            Click on the app and select "Remove Access" or "Revoke"
          </p>
          <Button
            variant="outline"
            onClick={() => setStep(4)}
            className="w-full"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Removed Access
          </Button>
        </div>
      )
    },
    {
      title: "Retry Gmail Connection",
      description: "Now try connecting Gmail again",
      action: (
        <div className="space-y-2">
          <Button
            onClick={handleRetry}
            disabled={isRetrying}
            className="w-full"
          >
            {isRetrying ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Connecting Gmail Again
              </>
            )}
          </Button>
          {onClose && (
            <Button
              variant="ghost"
              onClick={onClose}
              className="w-full"
            >
              Cancel
            </Button>
          )}
        </div>
      )
    }
  ]

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-6">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Gmail Permission Reset Required
        </h2>
        <p className="text-gray-600">
          To get a refresh token, we need to reset your Gmail permissions
        </p>
      </div>

      <Alert className="mb-6">
        <AlertTriangle className="h-4 w-4" />
        <div>
          <h3 className="font-medium">Why is this needed?</h3>
          <p className="text-sm mt-1">
            Google only provides refresh tokens on the first authorization. 
            Since you've connected before, we need to reset permissions to get a new refresh token.
          </p>
        </div>
      </Alert>

      <div className="space-y-6">
        {steps.map((stepData, index) => (
          <div
            key={index}
            className={`border rounded-lg p-4 ${
              step === index + 1
                ? 'border-blue-500 bg-blue-50'
                : step > index + 1
                ? 'border-green-500 bg-green-50'
                : 'border-gray-200 bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              <div
                className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === index + 1
                    ? 'bg-blue-500 text-white'
                    : step > index + 1
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-300 text-gray-600'
                }`}
              >
                {step > index + 1 ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  index + 1
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-gray-900">{stepData.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{stepData.description}</p>
                {step === index + 1 && (
                  <div className="mt-3">
                    {stepData.action}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          This process ensures secure, long-term access to your Gmail account
        </p>
      </div>
    </div>
  )
}

// Hook to detect if permission reset is needed
export function useGmailPermissionReset() {
  const [showReset, setShowReset] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

  const checkForPermissionError = (error: string) => {
    if (error.includes('No refresh token') || error.includes('refresh token')) {
      setShowReset(true)
      setResetError(error)
      return true
    }
    return false
  }

  const hideReset = () => {
    setShowReset(false)
    setResetError(null)
  }

  return {
    showReset,
    resetError,
    checkForPermissionError,
    hideReset
  }
}
