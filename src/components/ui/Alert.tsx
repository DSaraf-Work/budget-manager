import { cn } from '@/lib/utils'
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react'

interface AlertProps {
  children: React.ReactNode
  variant?: 'info' | 'success' | 'warning' | 'error'
  className?: string
}

const alertVariants = {
  info: {
    container: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: Info,
  },
  success: {
    container: 'bg-green-50 border-green-200 text-green-800',
    icon: CheckCircle,
  },
  warning: {
    container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: AlertCircle,
  },
  error: {
    container: 'bg-red-50 border-red-200 text-red-800',
    icon: XCircle,
  },
}

export function Alert({ children, variant = 'info', className }: AlertProps) {
  const { container, icon: Icon } = alertVariants[variant]

  return (
    <div className={cn('flex items-center p-4 border rounded-md', container, className)}>
      <Icon className="h-5 w-5 mr-3 flex-shrink-0" />
      <div className="text-sm">{children}</div>
    </div>
  )
}
