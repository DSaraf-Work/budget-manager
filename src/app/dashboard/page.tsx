/**
 * Dashboard page - Main overview for authenticated users
 * 
 * Provides a comprehensive view of the user's financial status,
 * recent transactions, budget summaries, and quick actions.
 */

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">
              📊 Dashboard
            </h1>
            <p className="mt-2 text-gray-600">
              Your financial overview and insights
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats - Empty State */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">💰</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-gray-400">$0.00</p>
                <p className="text-xs text-gray-500 mt-1">Add transactions to see your balance</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📈</div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-400">$0.00</p>
                <p className="text-xs text-gray-500 mt-1">No income recorded</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📉</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expenses</p>
                <p className="text-2xl font-bold text-gray-400">$0.00</p>
                <p className="text-xs text-gray-500 mt-1">No expenses recorded</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🎯</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-2xl font-bold text-gray-400">0%</p>
                <p className="text-xs text-gray-500 mt-1">Create budgets to track spending</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions - Empty State */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Transactions
                </h2>
              </div>
              <div className="p-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📝</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No transactions yet
                  </h3>
                  <p className="text-gray-500 mb-6">
                    Start by adding your first transaction to track your finances
                  </p>
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    Add Your First Transaction
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions & Budget Summary */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h2>
              </div>
              <div className="p-6 space-y-3">
                <button className="w-full flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <span className="mr-2">➕</span>
                  Add Transaction
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                  <span className="mr-2">🎯</span>
                  Create Budget
                </button>
                <button className="w-full flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                  <span className="mr-2">📊</span>
                  View Reports
                </button>
              </div>
            </div>

            {/* Budget Summary - Empty State */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Budget Summary
                </h2>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🎯</div>
                  <h3 className="text-sm font-medium text-gray-900 mb-2">
                    No budgets created
                  </h3>
                  <p className="text-xs text-gray-500 mb-4">
                    Create budgets to track your spending goals
                  </p>
                  <button className="bg-green-600 text-white px-3 py-2 text-sm rounded-lg hover:bg-green-700 transition-colors">
                    Create Budget
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
