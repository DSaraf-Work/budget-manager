import { extractAmountFromText } from '@/lib/utils'

export interface ExtractedTransaction {
  amount: number
  currency: string
  merchant: string
  paymentMethod: string
  paymentMethodLast4?: string
  transactionDate: Date
  transactionType: 'debit' | 'credit' | 'transfer'
  description: string
  confidenceScore: number
}

export class TransactionExtractor {
  
  /**
   * Extract transaction data from Gmail message content
   */
  extractTransaction(
    subject: string,
    content: string,
    senderEmail: string,
    receivedAt: Date
  ): ExtractedTransaction | null {
    try {
      // Clean and normalize content
      const cleanContent = this.cleanContent(content)
      const fullText = `${subject} ${cleanContent}`.toLowerCase()

      // Extract amount and currency
      const amountData = this.extractAmount(fullText)
      if (!amountData) {
        return null
      }

      // Extract merchant
      const merchant = this.extractMerchant(fullText, senderEmail)

      // Extract payment method
      const paymentMethodData = this.extractPaymentMethod(fullText)

      // Extract transaction date
      const transactionDate = this.extractTransactionDate(fullText, receivedAt)

      // Determine transaction type
      const transactionType = this.determineTransactionType(fullText)

      // Generate description
      const description = this.generateDescription(subject, merchant, amountData.amount)

      // Calculate confidence score
      const confidenceScore = this.calculateConfidenceScore({
        hasAmount: !!amountData,
        hasMerchant: !!merchant,
        hasPaymentMethod: !!paymentMethodData,
        hasTransactionDate: !!transactionDate,
        senderReliability: this.getSenderReliability(senderEmail),
      })

      return {
        amount: amountData.amount,
        currency: amountData.currency,
        merchant,
        paymentMethod: paymentMethodData?.method || 'Unknown',
        paymentMethodLast4: paymentMethodData?.last4,
        transactionDate,
        transactionType,
        description,
        confidenceScore,
      }

    } catch (error) {
      console.error('Error extracting transaction:', error)
      return null
    }
  }

  /**
   * Clean and normalize message content
   */
  private cleanContent(content: string): string {
    return content
      .replace(/\r\n/g, '\n')
      .replace(/\n+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  /**
   * Extract amount and currency from text
   */
  private extractAmount(text: string): { amount: number; currency: string } | null {
    // Indian Rupee patterns
    const inrPatterns = [
      /(?:rs\.?|inr|₹)\s*([0-9,]+\.?[0-9]*)/gi,
      /([0-9,]+\.?[0-9]*)\s*(?:rs\.?|inr|₹)/gi,
      /amount[:\s]*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?[0-9]*)/gi,
      /debited[:\s]*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?[0-9]*)/gi,
      /credited[:\s]*(?:rs\.?|inr|₹)?\s*([0-9,]+\.?[0-9]*)/gi,
    ]

    // USD patterns
    const usdPatterns = [
      /\$\s*([0-9,]+\.?[0-9]*)/gi,
      /([0-9,]+\.?[0-9]*)\s*usd/gi,
    ]

    // Try INR patterns first
    for (const pattern of inrPatterns) {
      const match = text.match(pattern)
      if (match) {
        const amountStr = match[0].replace(/[^\d.,]/g, '')
        const amount = parseFloat(amountStr.replace(/,/g, ''))
        if (amount > 0) {
          return { amount, currency: 'INR' }
        }
      }
    }

    // Try USD patterns
    for (const pattern of usdPatterns) {
      const match = text.match(pattern)
      if (match) {
        const amountStr = match[0].replace(/[^\d.,]/g, '')
        const amount = parseFloat(amountStr.replace(/,/g, ''))
        if (amount > 0) {
          return { amount, currency: 'USD' }
        }
      }
    }

    return null
  }

  /**
   * Extract merchant name from text
   */
  private extractMerchant(text: string, senderEmail: string): string {
    // Common merchant patterns
    const merchantPatterns = [
      /at\s+([a-z0-9\s&.-]+?)(?:\s+on|\s+for|\s+amount|\s+rs|\s+inr|\s*$)/gi,
      /merchant[:\s]+([a-z0-9\s&.-]+?)(?:\s+on|\s+for|\s+amount|\s+rs|\s+inr|\s*$)/gi,
      /transaction\s+at\s+([a-z0-9\s&.-]+?)(?:\s+on|\s+for|\s+amount|\s+rs|\s+inr|\s*$)/gi,
      /purchase\s+at\s+([a-z0-9\s&.-]+?)(?:\s+on|\s+for|\s+amount|\s+rs|\s+inr|\s*$)/gi,
      /payment\s+to\s+([a-z0-9\s&.-]+?)(?:\s+on|\s+for|\s+amount|\s+rs|\s+inr|\s*$)/gi,
    ]

    for (const pattern of merchantPatterns) {
      const match = text.match(pattern)
      if (match && match[1]) {
        const merchant = match[1].trim()
        if (merchant.length > 2 && merchant.length < 50) {
          return this.cleanMerchantName(merchant)
        }
      }
    }

    // Fallback: extract from sender domain
    const domain = senderEmail.split('@')[1]
    if (domain) {
      const domainParts = domain.split('.')
      if (domainParts.length > 1) {
        return this.cleanMerchantName(domainParts[0])
      }
    }

    return 'Unknown Merchant'
  }

  /**
   * Clean merchant name
   */
  private cleanMerchantName(merchant: string): string {
    return merchant
      .replace(/[^a-zA-Z0-9\s&.-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
  }

  /**
   * Extract payment method information
   */
  private extractPaymentMethod(text: string): { method: string; last4?: string } | null {
    // Credit card patterns
    const cardPatterns = [
      /credit\s+card\s+(?:ending\s+)?(?:in\s+)?(\d{4})/gi,
      /card\s+(?:ending\s+)?(?:in\s+)?(\d{4})/gi,
      /(?:xxxx|x{4})\s*(\d{4})/gi,
      /\*{4}\s*(\d{4})/gi,
    ]

    // Debit card patterns
    const debitPatterns = [
      /debit\s+card\s+(?:ending\s+)?(?:in\s+)?(\d{4})/gi,
      /atm\s+card\s+(?:ending\s+)?(?:in\s+)?(\d{4})/gi,
    ]

    // UPI patterns
    const upiPatterns = [
      /upi/gi,
      /unified\s+payments/gi,
      /bhim/gi,
      /paytm/gi,
      /phonepe/gi,
      /googlepay/gi,
      /gpay/gi,
    ]

    // Net banking patterns
    const netBankingPatterns = [
      /net\s*banking/gi,
      /internet\s+banking/gi,
      /online\s+banking/gi,
    ]

    // Check for credit card
    for (const pattern of cardPatterns) {
      const match = text.match(pattern)
      if (match) {
        return {
          method: 'Credit Card',
          last4: match[1],
        }
      }
    }

    // Check for debit card
    for (const pattern of debitPatterns) {
      const match = text.match(pattern)
      if (match) {
        return {
          method: 'Debit Card',
          last4: match[1],
        }
      }
    }

    // Check for UPI
    for (const pattern of upiPatterns) {
      if (pattern.test(text)) {
        return { method: 'UPI' }
      }
    }

    // Check for net banking
    for (const pattern of netBankingPatterns) {
      if (pattern.test(text)) {
        return { method: 'Net Banking' }
      }
    }

    return null
  }

  /**
   * Extract transaction date from text
   */
  private extractTransactionDate(text: string, fallbackDate: Date): Date {
    // Date patterns
    const datePatterns = [
      /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/g,
      /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\s+(\d{2,4})/gi,
      /on\s+(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/gi,
    ]

    for (const pattern of datePatterns) {
      const match = text.match(pattern)
      if (match) {
        try {
          // Parse the date (this is a simplified version)
          const dateStr = match[0].replace(/on\s+/gi, '')
          const parsedDate = new Date(dateStr)
          if (!isNaN(parsedDate.getTime())) {
            return parsedDate
          }
        } catch (error) {
          // Continue to next pattern
        }
      }
    }

    return fallbackDate
  }

  /**
   * Determine transaction type
   */
  private determineTransactionType(text: string): 'debit' | 'credit' | 'transfer' {
    const debitKeywords = ['debited', 'debit', 'spent', 'purchase', 'payment', 'withdrawn']
    const creditKeywords = ['credited', 'credit', 'received', 'refund', 'cashback', 'deposit']
    const transferKeywords = ['transfer', 'sent', 'moved']

    const lowerText = text.toLowerCase()

    for (const keyword of transferKeywords) {
      if (lowerText.includes(keyword)) {
        return 'transfer'
      }
    }

    for (const keyword of creditKeywords) {
      if (lowerText.includes(keyword)) {
        return 'credit'
      }
    }

    for (const keyword of debitKeywords) {
      if (lowerText.includes(keyword)) {
        return 'debit'
      }
    }

    return 'debit' // Default assumption
  }

  /**
   * Generate transaction description
   */
  private generateDescription(subject: string, merchant: string, amount: number): string {
    const cleanSubject = subject.replace(/re:\s*/gi, '').trim()
    
    if (cleanSubject.length > 10) {
      return cleanSubject
    }

    return `Transaction at ${merchant} for ${amount}`
  }

  /**
   * Calculate confidence score based on extracted data quality
   */
  private calculateConfidenceScore(factors: {
    hasAmount: boolean
    hasMerchant: boolean
    hasPaymentMethod: boolean
    hasTransactionDate: boolean
    senderReliability: number
  }): number {
    let score = 0

    if (factors.hasAmount) score += 0.4
    if (factors.hasMerchant) score += 0.2
    if (factors.hasPaymentMethod) score += 0.2
    if (factors.hasTransactionDate) score += 0.1
    
    score += factors.senderReliability * 0.1

    return Math.min(1.0, Math.max(0.0, score))
  }

  /**
   * Get sender reliability score
   */
  private getSenderReliability(senderEmail: string): number {
    const reliableDomains = [
      'hdfcbank.com',
      'icicibank.com',
      'sbi.co.in',
      'axisbank.com',
      'kotak.com',
      'americanexpress.com',
      'citibank.com',
      'paytm.com',
      'phonepe.com',
      'googlepay.com',
    ]

    const domain = senderEmail.split('@')[1]?.toLowerCase()
    
    if (reliableDomains.includes(domain)) {
      return 1.0
    }

    if (domain?.includes('bank') || domain?.includes('card')) {
      return 0.8
    }

    return 0.5
  }
}
