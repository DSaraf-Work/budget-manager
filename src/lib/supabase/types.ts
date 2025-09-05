export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          gmail_access_token: string | null
          gmail_refresh_token: string | null
          last_sync_at: string | null
          sync_frequency_hours: number | null
          is_active: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          gmail_access_token?: string | null
          gmail_refresh_token?: string | null
          last_sync_at?: string | null
          sync_frequency_hours?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          gmail_access_token?: string | null
          gmail_refresh_token?: string | null
          last_sync_at?: string | null
          sync_frequency_hours?: number | null
          is_active?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      gmail_messages: {
        Row: {
          id: string
          user_id: string
          message_id: string
          thread_id: string
          subject: string | null
          sender_email: string
          sender_name: string | null
          received_at: string
          processed_at: string | null
          processing_status: string | null
          raw_content: string | null
          snippet: string | null
          labels: string[] | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          message_id: string
          thread_id: string
          subject?: string | null
          sender_email: string
          sender_name?: string | null
          received_at: string
          processed_at?: string | null
          processing_status?: string | null
          raw_content?: string | null
          snippet?: string | null
          labels?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          message_id?: string
          thread_id?: string
          subject?: string | null
          sender_email?: string
          sender_name?: string | null
          received_at?: string
          processed_at?: string | null
          processing_status?: string | null
          raw_content?: string | null
          snippet?: string | null
          labels?: string[] | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          gmail_message_id: string | null
          status: string | null
          amount: number
          currency: string
          merchant: string | null
          payment_method: string | null
          payment_method_last4: string | null
          transaction_date: string
          transaction_type: string | null
          category: string | null
          subcategory: string | null
          description: string | null
          notes: string | null
          is_recurring: boolean | null
          confidence_score: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          gmail_message_id?: string | null
          status?: string | null
          amount: number
          currency?: string
          merchant?: string | null
          payment_method?: string | null
          payment_method_last4?: string | null
          transaction_date: string
          transaction_type?: string | null
          category?: string | null
          subcategory?: string | null
          description?: string | null
          notes?: string | null
          is_recurring?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          gmail_message_id?: string | null
          status?: string | null
          amount?: number
          currency?: string
          merchant?: string | null
          payment_method?: string | null
          payment_method_last4?: string | null
          transaction_date?: string
          transaction_type?: string | null
          category?: string | null
          subcategory?: string | null
          description?: string | null
          notes?: string | null
          is_recurring?: boolean | null
          confidence_score?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      whitelisted_senders: {
        Row: {
          id: string
          user_id: string
          email_address: string | null
          domain: string | null
          sender_name: string | null
          is_active: boolean | null
          auto_approve: boolean | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          email_address?: string | null
          domain?: string | null
          sender_name?: string | null
          is_active?: boolean | null
          auto_approve?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          email_address?: string | null
          domain?: string | null
          sender_name?: string | null
          is_active?: boolean | null
          auto_approve?: boolean | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      sync_logs: {
        Row: {
          id: string
          user_id: string
          sync_type: string | null
          started_at: string | null
          completed_at: string | null
          status: string | null
          messages_fetched: number | null
          transactions_created: number | null
          transactions_updated: number | null
          error_message: string | null
          sync_range_start: string | null
          sync_range_end: string | null
        }
        Insert: {
          id?: string
          user_id: string
          sync_type?: string | null
          started_at?: string | null
          completed_at?: string | null
          status?: string | null
          messages_fetched?: number | null
          transactions_created?: number | null
          transactions_updated?: number | null
          error_message?: string | null
          sync_range_start?: string | null
          sync_range_end?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          sync_type?: string | null
          started_at?: string | null
          completed_at?: string | null
          status?: string | null
          messages_fetched?: number | null
          transactions_created?: number | null
          transactions_updated?: number | null
          error_message?: string | null
          sync_range_start?: string | null
          sync_range_end?: string | null
        }
      }
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
