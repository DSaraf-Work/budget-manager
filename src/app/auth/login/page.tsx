'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { AuthForm } from '@/components/auth/AuthForm'
import { TrendingUp } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()

  const handleSuccess = () => {
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <TrendingUp className="h-12 w-12 text-blue-600" />
          </div>
          <h1 className="mt-4 text-2xl font-bold text-gray-900">Budget Manager</h1>
        </div>

        <AuthForm mode="login" onSuccess={handleSuccess} />

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/auth/signup" className="font-medium text-blue-600 hover:text-blue-500">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
