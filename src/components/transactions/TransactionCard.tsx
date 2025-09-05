'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { formatCurrency, formatDate } from '@/lib/utils'
import { 
  Check, 
  X, 
  Edit, 
  Calendar, 
  CreditCard, 
  Building, 
  DollarSign,
  Star
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

interface TransactionCardProps {
  transaction: Transaction
  onApprove: (id: string) => void
  onReject: (id: string) => void
  onEdit: (transaction: Transaction) => void
  loading?: boolean
}

export function TransactionCard({ 
  transaction, 
  onApprove, 
  onReject, 
  onEdit, 
  loading = false 
}: TransactionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getTransactionTypeColor = (type: string | null) => {
    switch (type) {
      case 'credit':
        return 'text-green-600 bg-green-50'
      case 'debit':
        return 'text-red-600 bg-red-50'
      case 'transfer':
        return 'text-blue-600 bg-blue-50'
      default:
        return 'text-gray-600 bg-gray-50'
    }
  }

  const getConfidenceColor = (score: number | null) => {
    if (!score) return 'text-gray-400'
    if (score >= 0.8) return 'text-green-500'
    if (score >= 0.6) return 'text-yellow-500'
    return 'text-red-500'
  }

  const getConfidenceStars = (score: number | null) => {
    if (!score) return 0
    return Math.round(score * 5)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3">
              <div className={`px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(transaction.transaction_type)}`}>
                {transaction.transaction_type?.toUpperCase() || 'UNKNOWN'}
              </div>
              {transaction.confidence_score && (
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${
                        i < getConfidenceStars(transaction.confidence_score)
                          ? getConfidenceColor(transaction.confidence_score)
                          : 'text-gray-300'
                      }`}
                      fill="currentColor"
                    />
                  ))}
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mt-2">
              {transaction.merchant || 'Unknown Merchant'}
            </h3>
            
            <p className="text-sm text-gray-600 mt-1">
              {transaction.description || 'No description available'}
            </p>
          </div>

          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">
              {formatCurrency(transaction.amount, transaction.currency)}
            </div>
            <div className="text-sm text-gray-500">
              {formatDate(transaction.transaction_date)}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="flex items-center text-gray-600">
            <CreditCard className="h-4 w-4 mr-2" />
            <span>
              {transaction.payment_method || 'Unknown'}
              {transaction.payment_method_last4 && ` ****${transaction.payment_method_last4}`}
            </span>
          </div>
          
          <div className="flex items-center text-gray-600">
            <Calendar className="h-4 w-4 mr-2" />
            <span>{formatDate(transaction.transaction_date)}</span>
          </div>
        </div>

        {/* Expandable Details */}
        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">Transaction ID:</span>
                <p className="text-gray-600 font-mono text-xs">{transaction.id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Confidence Score:</span>
                <p className="text-gray-600">
                  {transaction.confidence_score 
                    ? `${Math.round(transaction.confidence_score * 100)}%`
                    : 'N/A'
                  }
                </p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Created:</span>
                <p className="text-gray-600">{formatDate(transaction.created_at)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Status:</span>
                <p className="text-gray-600 capitalize">{transaction.status}</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex items-center justify-between">
          <div className="flex space-x-2">
            <Button
              size="sm"
              onClick={() => onApprove(transaction.id)}
              disabled={loading}
              className="flex items-center"
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onEdit(transaction)}
              disabled={loading}
              className="flex items-center"
            >
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            
            <Button
              size="sm"
              variant="outline"
              onClick={() => onReject(transaction.id)}
              disabled={loading}
              className="flex items-center text-red-600 hover:text-red-700"
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>

          <Button
            size="sm"
            variant="ghost"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500"
          >
            {isExpanded ? 'Less Details' : 'More Details'}
          </Button>
        </div>
      </div>
    </div>
  )
}
