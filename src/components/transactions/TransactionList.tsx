'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TransactionCard } from './TransactionCard'
import { Button } from '@/components/ui/Button'
import { Alert } from '@/components/ui/Alert'
import { 
  Loader2, 
  RefreshCw, 
  Filter, 
  Search,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface Transaction {
  id: string
  amount: number
  currency: string
  merchant: string | null
  payment_method: string | null
  payment_method_last4: string | null
  transaction_date: string
  transaction_type: string | null
  description: string | null
  confidence_score: number | null
  status: string
  created_at: string
}

interface TransactionListProps {
  status?: 'review' | 'saved' | 'ignored'
  title?: string
}

export function TransactionList({ status = 'review', title }: TransactionListProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchTransactions()
  }, [status])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('transaction_date', { ascending: false })

      if (status) {
        query = query.eq('status', status)
      }

      const { data, error } = await query

      if (error) throw error

      setTransactions(data || [])
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (transactionId: string) => {
    try {
      setActionLoading(transactionId)
      setError(null)
      setSuccess(null)

      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'saved',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)

      if (error) throw error

      setSuccess('Transaction approved successfully')
      await fetchTransactions()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (transactionId: string) => {
    try {
      setActionLoading(transactionId)
      setError(null)
      setSuccess(null)

      const { error } = await supabase
        .from('transactions')
        .update({ 
          status: 'ignored',
          updated_at: new Date().toISOString()
        })
        .eq('id', transactionId)

      if (error) throw error

      setSuccess('Transaction rejected successfully')
      await fetchTransactions()
    } catch (error: any) {
      setError(error.message)
    } finally {
      setActionLoading(null)
    }
  }

  const handleEdit = (transaction: Transaction) => {
    // TODO: Implement edit modal
    console.log('Edit transaction:', transaction)
  }

  const getStatusInfo = () => {
    switch (status) {
      case 'review':
        return {
          title: title || 'Transactions to Review',
          description: 'Review and approve or reject these extracted transactions',
          icon: AlertCircle,
          color: 'text-yellow-600'
        }
      case 'saved':
        return {
          title: title || 'Approved Transactions',
          description: 'Your approved and saved transactions',
          icon: CheckCircle,
          color: 'text-green-600'
        }
      case 'ignored':
        return {
          title: title || 'Rejected Transactions',
          description: 'Transactions you have rejected or ignored',
          icon: AlertCircle,
          color: 'text-red-600'
        }
      default:
        return {
          title: title || 'All Transactions',
          description: 'All your transactions',
          icon: AlertCircle,
          color: 'text-gray-600'
        }
    }
  }

  const statusInfo = getStatusInfo()
  const StatusIcon = statusInfo.icon

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading transactions...</span>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <StatusIcon className={`h-6 w-6 ${statusInfo.color}`} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{statusInfo.title}</h2>
            <p className="text-gray-600">{statusInfo.description}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchTransactions}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Alerts */}
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

      {/* Stats */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {transactions.length} transaction{transactions.length !== 1 ? 's' : ''}
          </div>
          {status === 'review' && transactions.length > 0 && (
            <div className="text-sm text-yellow-600">
              {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} pending review
            </div>
          )}
        </div>
      </div>

      {/* Transaction List */}
      {transactions.length === 0 ? (
        <div className="text-center py-12">
          <StatusIcon className={`h-12 w-12 mx-auto ${statusInfo.color} mb-4`} />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No transactions found
          </h3>
          <p className="text-gray-600">
            {status === 'review' 
              ? 'No transactions are currently pending review.'
              : `No ${status} transactions found.`
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {transactions.map((transaction) => (
            <TransactionCard
              key={transaction.id}
              transaction={transaction}
              onApprove={handleApprove}
              onReject={handleReject}
              onEdit={handleEdit}
              loading={actionLoading === transaction.id}
            />
          ))}
        </div>
      )}
    </div>
  )
}
