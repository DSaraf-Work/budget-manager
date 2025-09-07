import { createClient as createSupabaseClient } from '@supabase/supabase-js'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createSupabaseClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Enable persistent sessions with 6-month expiry
      persistSession: true,
      // Automatically refresh tokens before expiration
      autoRefreshToken: true,
      // Detect session in URL (for OAuth callbacks)
      detectSessionInUrl: true,
      // Storage key for session persistence
      storageKey: 'budget-manager-auth',
    },
    global: {
      headers: {
        'X-Client-Info': 'budget-manager-web',
      },
    },
  })
}
