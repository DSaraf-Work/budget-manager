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
        // Store session in localStorage for persistence across browser restarts
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        // Automatically refresh tokens before expiration
        autoRefreshToken: true,
        // Detect session in URL (for OAuth callbacks)
        detectSessionInUrl: true,
        // Extended session duration (30 days)
        flowType: 'pkce',
        // Custom storage key to avoid conflicts
        storageKey: 'budget-manager-auth-token',
      },
      global: {
        headers: {
          'X-Client-Info': 'budget-manager-web',
        },
      },
    }
  )

export const supabase = createClient()
