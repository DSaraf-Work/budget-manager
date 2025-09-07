// Database types will be generated here
// Run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/supabase/types.ts

export interface Database {
  public: {
    Tables: {
      // Tables will be defined here as we create them
      // All table names will be prefixed with 'bm_' (budget manager)
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
