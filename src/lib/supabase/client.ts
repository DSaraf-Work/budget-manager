import { createBrowserClient } from '@supabase/ssr'
import { Database } from './types'

export const createClient = () =>
  createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        // Enable persistent sessions
        persistSession: true,
        // Automatically refresh tokens before expiration
        autoRefreshToken: true,
        // Detect session in URL (for OAuth callbacks)
        detectSessionInUrl: true,
        // Use PKCE flow for better security
        flowType: 'pkce',
      },
      global: {
        headers: {
          'X-Client-Info': 'budget-manager-web',
        },
      },
    }
  )

export const supabase = createClient()
