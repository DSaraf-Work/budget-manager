'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TransactionList } from '@/components/transactions/TransactionList'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { 
  TrendingUp, 
  RefreshCw, 
  Settings, 
  Download,
  Filter,
  Plus
} from 'lucide-react'

export default function TransactionsPage() {
  const [activeTab, setActiveTab] = useState<'review' | 'saved' | 'ignored'>('review')
  const [stats, setStats] = useState({
    review: 0,
    saved: 0,
    ignored: 0,
    total: 0
  })
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Fetch transaction counts by status
      const { data, error } = await supabase
        .from('transactions')
        .select('status')
        .eq('user_id', user.id)

      if (error) throw error

      const newStats = {
        review: 0,
        saved: 0,
        ignored: 0,
        total: data?.length || 0
      }

      data?.forEach(transaction => {
        switch (transaction.status) {
          case 'review':
            newStats.review++
            break
          case 'saved':
            newStats.saved++
            break
          case 'ignored':
            newStats.ignored++
            break
        }
      })

      setStats(newStats)
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleProcessTransactions = async () => {
    try {
      setProcessing(true)
      setError(null)
      setSuccess(null)

      const response = await fetch('/api/transactions/process', {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to process transactions')
      }

      setSuccess(`Processed ${data.processed} messages, created ${data.created} transactions`)
      await fetchStats()

    } catch (error: any) {
      setError(error.message)
    } finally {
      setProcessing(false)
    }
  }

  const tabs = [
    { 
      id: 'review' as const, 
      label: 'To Review', 
      count: stats.review,
      color: 'bg-yellow-100 text-yellow-800'
    },
    { 
      id: 'saved' as const, 
      label: 'Approved', 
      count: stats.saved,
      color: 'bg-green-100 text-green-800'
    },
    { 
      id: 'ignored' as const, 
      label: 'Rejected', 
      count: stats.ignored,
      color: 'bg-red-100 text-red-800'
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Budget Manager</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleProcessTransactions}
                disabled={processing}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${processing ? 'animate-spin' : ''}`} />
                {processing ? 'Processing...' : 'Process New'}
              </Button>
              <Button variant="ghost" size="sm">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
          <p className="mt-2 text-gray-600">
            Review and manage your extracted transactions from Gmail
          </p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-6">
            <Alert variant="error">
              {error}
            </Alert>
          </div>
        )}

        {success && (
          <div className="mb-6">
            <Alert variant="success">
              {success}
            </Alert>
          </div>
        )}

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-md flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          {tabs.map((tab) => (
            <div key={tab.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${tab.color}`}>
                    {tab.count}
                  </div>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{tab.label}</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {((tab.count / stats.total) * 100 || 0).toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs ${tab.color}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Transaction List */}
        <TransactionList status={activeTab} />
      </main>
    </div>
  )
}
