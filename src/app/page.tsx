'use client'

import { Mail, TrendingUp, Shield, Zap, User, LogIn } from "lucide-react";
import { useAuth } from '@/components/providers/AuthProvider';
import Link from 'next/link';

export default function Home() {
  const { user, loading, isAuthenticated } = useAuth();
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Budget Manager</span>
            </div>
            <nav className="hidden md:flex space-x-8">
              <a href="#features" className="text-gray-500 hover:text-gray-900 transition-colors">Features</a>
              <a href="#how-it-works" className="text-gray-500 hover:text-gray-900 transition-colors">How it Works</a>
              <a href="#security" className="text-gray-500 hover:text-gray-900 transition-colors">Security</a>
            </nav>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {loading ? (
                // Loading state to prevent UI flicker
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="h-4 w-12 sm:w-16 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-8 w-16 sm:w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : isAuthenticated ? (
                // Authenticated user UI
                <div className="flex items-center space-x-2 sm:space-x-4">
                  <div className="flex items-center space-x-1 sm:space-x-2 text-gray-700">
                    <User className="h-4 w-4" />
                    <span className="text-xs sm:text-sm font-medium truncate max-w-24 sm:max-w-none" title={user?.user_metadata?.full_name || user?.email || 'User'}>
                      {user?.user_metadata?.full_name || user?.email || 'User'}
                    </span>
                  </div>
                  <Link
                    href="/dashboard"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
                  >
                    Dashboard
                  </Link>
                </div>
              ) : (
                // Unauthenticated user UI
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-500 hover:text-gray-900 text-xs sm:text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/signup"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            {isAuthenticated ? (
              <>
                <span className="block">Welcome back,</span>
                <span className="block text-blue-600">
                  {user?.user_metadata?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'User'}!
                </span>
              </>
            ) : (
              <>
                <span className="block">Smart Personal</span>
                <span className="block text-blue-600">Finance Tracking</span>
              </>
            )}
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            {isAuthenticated ? (
              "Continue managing your finances with intelligent transaction tracking and insights from your Gmail account."
            ) : (
              "Automatically extract and categorize your expenses from Gmail. Get intelligent insights into your spending patterns with zero manual data entry."
            )}
          </p>
          <div className="mt-5 max-w-md mx-auto sm:flex sm:justify-center md:mt-8">
            {loading ? (
              // Loading state for hero buttons
              <div className="flex space-x-3">
                <div className="h-12 w-32 bg-gray-200 rounded-md animate-pulse"></div>
                <div className="h-12 w-32 bg-gray-200 rounded-md animate-pulse"></div>
              </div>
            ) : isAuthenticated ? (
              // Authenticated user hero buttons
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <div className="rounded-md shadow">
                  <Link
                    href="/dashboard"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                </div>
                <div className="rounded-md shadow">
                  <Link
                    href="/transactions"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    View Transactions
                  </Link>
                </div>
              </div>
            ) : (
              // Unauthenticated user hero buttons
              <>
                <div className="rounded-md shadow">
                  <Link
                    href="/auth/signup"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    Get Started Free
                  </Link>
                </div>
                <div className="mt-3 rounded-md shadow sm:mt-0 sm:ml-3">
                  <Link
                    href="/auth/login"
                    className="w-full flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10 transition-colors"
                  >
                    <LogIn className="h-5 w-5 mr-2" />
                    Sign In
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="py-12">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-extrabold text-gray-900 text-center mb-12">
              Why Choose Budget Manager?
            </h2>
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white mx-auto">
                  <Mail className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Gmail Integration</h3>
                <p className="mt-2 text-base text-gray-500">
                  Automatically fetch transaction emails from your Gmail account
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white mx-auto">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Smart Extraction</h3>
                <p className="mt-2 text-base text-gray-500">
                  AI-powered extraction of amount, merchant, and payment details
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white mx-auto">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Smart Insights</h3>
                <p className="mt-2 text-base text-gray-500">
                  Get detailed analytics and spending pattern insights
                </p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-500 text-white mx-auto">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="mt-6 text-lg font-medium text-gray-900">Secure & Private</h3>
                <p className="mt-2 text-base text-gray-500">
                  Bank-level security with read-only Gmail access
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Section */}
        <div className="bg-white rounded-lg shadow-lg p-8 mt-12">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Development Status</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-blue-800">
                <strong>Phase 1: Foundation Setup</strong> - Currently in development
              </p>
              <p className="text-blue-600 mt-2">
                Setting up Gmail integration, user authentication, and core transaction processing
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
