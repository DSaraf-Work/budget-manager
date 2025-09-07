/**
 * Transactions page - Manage and view all transactions
 * 
 * Provides functionality to view, add, edit, and categorize transactions
 * with filtering and search capabilities.
 */

export default function TransactionsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  💳 Transactions
                </h1>
                <p className="mt-2 text-gray-600">
                  Manage your income and expenses
                </p>
              </div>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                ➕ Add Transaction
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>All Categories</option>
                <option>Food & Dining</option>
                <option>Transportation</option>
                <option>Entertainment</option>
                <option>Shopping</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>All Types</option>
                <option>Income</option>
                <option>Expense</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date Range
              </label>
              <select className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>Last 30 days</option>
                <option>Last 3 months</option>
                <option>Last 6 months</option>
                <option>This year</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>
          </div>
          <div className="divide-y divide-gray-200">
            {[
              { 
                id: 1, 
                icon: '🛒', 
                name: 'Whole Foods Market', 
                category: 'Food & Dining',
                amount: -85.50, 
                date: '2025-09-07',
                time: '2:30 PM'
              },
              { 
                id: 2, 
                icon: '⛽', 
                name: 'Shell Gas Station', 
                category: 'Transportation',
                amount: -45.00, 
                date: '2025-09-06',
                time: '8:15 AM'
              },
              { 
                id: 3, 
                icon: '💼', 
                name: 'Salary Deposit', 
                category: 'Income',
                amount: 3200.00, 
                date: '2025-09-05',
                time: '12:00 PM'
              },
              { 
                id: 4, 
                icon: '☕', 
                name: 'Starbucks Coffee', 
                category: 'Food & Dining',
                amount: -12.50, 
                date: '2025-09-04',
                time: '9:45 AM'
              },
              { 
                id: 5, 
                icon: '🎬', 
                name: 'Netflix Subscription', 
                category: 'Entertainment',
                amount: -15.99, 
                date: '2025-09-03',
                time: '11:30 PM'
              },
            ].map((transaction) => (
              <div key={transaction.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="text-2xl mr-4">{transaction.icon}</div>
                    <div>
                      <p className="font-medium text-gray-900">{transaction.name}</p>
                      <div className="flex items-center text-sm text-gray-500">
                        <span className="bg-gray-100 px-2 py-1 rounded-full text-xs mr-2">
                          {transaction.category}
                        </span>
                        <span>{transaction.date} at {transaction.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`text-lg font-semibold ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </div>
                    <button className="text-sm text-blue-600 hover:text-blue-800">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-700">
                Showing 1 to 5 of 47 transactions
              </p>
              <div className="flex space-x-2">
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100">
                  Previous
                </button>
                <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm">
                  1
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100">
                  2
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100">
                  3
                </button>
                <button className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100">
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
