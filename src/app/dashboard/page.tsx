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
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">💰</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Balance</p>
                <p className="text-2xl font-bold text-green-600">$12,450.00</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📈</div>
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-blue-600">+$2,340.00</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">📉</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Expenses</p>
                <p className="text-2xl font-bold text-red-600">-$1,890.00</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center">
              <div className="text-2xl mr-3">🎯</div>
              <div>
                <p className="text-sm font-medium text-gray-600">Budget Used</p>
                <p className="text-2xl font-bold text-orange-600">68%</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Transactions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Transactions
                </h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {[
                    { icon: '🛒', name: 'Grocery Store', amount: '-$85.50', date: 'Today' },
                    { icon: '⛽', name: 'Gas Station', amount: '-$45.00', date: 'Yesterday' },
                    { icon: '💼', name: 'Salary Deposit', amount: '+$3,200.00', date: '2 days ago' },
                    { icon: '☕', name: 'Coffee Shop', amount: '-$12.50', date: '3 days ago' },
                  ].map((transaction, index) => (
                    <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center">
                        <div className="text-xl mr-3">{transaction.icon}</div>
                        <div>
                          <p className="font-medium text-gray-900">{transaction.name}</p>
                          <p className="text-sm text-gray-500">{transaction.date}</p>
                        </div>
                      </div>
                      <div className={`font-semibold ${
                        transaction.amount.startsWith('+') ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount}
                      </div>
                    </div>
                  ))}
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

            {/* Budget Summary */}
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="px-6 py-4 border-b">
                <h2 className="text-lg font-semibold text-gray-900">
                  Budget Summary
                </h2>
              </div>
              <div className="p-6 space-y-4">
                {[
                  { category: 'Food & Dining', used: 320, total: 500, color: 'bg-red-500' },
                  { category: 'Transportation', used: 180, total: 300, color: 'bg-blue-500' },
                  { category: 'Entertainment', used: 90, total: 200, color: 'bg-green-500' },
                ].map((budget, index) => (
                  <div key={index}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{budget.category}</span>
                      <span className="text-gray-500">${budget.used}/${budget.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`${budget.color} h-2 rounded-full`}
                        style={{ width: `${(budget.used / budget.total) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
