import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency: string = 'INR'): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj)
}

export function formatDateShort(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-IN', {
    month: 'short',
    day: 'numeric',
  }).format(dateObj)
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36)
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function capitalizeFirst(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function extractDomain(email: string): string {
  return email.split('@')[1] || ''
}

export function sanitizeAmount(amount: string): number {
  // Remove currency symbols, commas, and spaces
  const cleaned = amount.replace(/[₹$,\s]/g, '')
  return parseFloat(cleaned) || 0
}

export function extractAmountFromText(text: string): number | null {
  // Common patterns for Indian currency amounts
  const patterns = [
    /₹\s*([0-9,]+\.?[0-9]*)/g,
    /INR\s*([0-9,]+\.?[0-9]*)/g,
    /Rs\.?\s*([0-9,]+\.?[0-9]*)/g,
    /\$\s*([0-9,]+\.?[0-9]*)/g,
  ]
  
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match) {
      const amount = sanitizeAmount(match[0])
      if (amount > 0) return amount
    }
  }
  
  return null
}
