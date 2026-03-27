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
      admin_actions: {
        Row: {
          id: number
          admin_id: string
          action_type: string
          target_user_id: string | null
          target_table: string | null
          old_value: string | null
          new_value: string | null
          details: string | null
          created_at: string
        }
        Insert: {
          id?: never
          admin_id: string
          action_type: string
          target_user_id?: string | null
          target_table?: string | null
          old_value?: string | null
          new_value?: string | null
          details?: string | null
          created_at?: string
        }
        Update: {
          id?: never
          admin_id?: string
          action_type?: string
          target_user_id?: string | null
          target_table?: string | null
          old_value?: string | null
          new_value?: string | null
          details?: string | null
          created_at?: string
        }
        Relationships: []
      }
      assets: {
        Row: {
          id: string
          symbol: string
          name: string
          status: string
          created_at: string
        }
        Insert: {
          id: string
          symbol: string
          name: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          symbol?: string
          name?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      asset_snapshots: {
        Row: {
          asset: string
          price_eur: number
          source: string
          source_status: string | null
          priced_at: string | null
          updated_at: string | null
        }
        Insert: {
          asset: string
          price_eur: number
          source: string
          source_status?: string | null
          priced_at?: string | null
          updated_at?: string | null
        }
        Update: {
          asset?: string
          price_eur?: number
          source?: string
          source_status?: string | null
          priced_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      balance_history: {
        Row: {
          id: number
          user_id: string
          action_type: string
          amount: number
          asset: string
          created_at: string
        }
        Insert: {
          id?: never
          user_id: string
          action_type: string
          amount: number
          asset: string
          created_at?: string
        }
        Update: {
          id?: never
          user_id?: string
          action_type?: string
          amount?: number
          asset?: string
          created_at?: string
        }
        Relationships: []
      }
      kyc_documents: {
        Row: {
          id: number
          user_id: string
          storage_path: string
          type: string
          status: string
          created_at: string
        }
        Insert: {
          id?: never
          user_id: string
          storage_path: string
          type: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: never
          user_id?: string
          storage_path?: string
          type?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      kyc_requests: {
        Row: {
          id: number
          user_id: string
          status: string
          submitted_at: string
          updated_at: string
        }
        Insert: {
          id?: never
          user_id: string
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Update: {
          id?: never
          user_id?: string
          status?: string
          submitted_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      market_prices: {
        Row: {
          id: number
          asset_id: string
          asset: string
          last_price: number
          source: string
          status: string
          priced_at: string
        }
        Insert: {
          id?: never
          asset_id: string
          asset: string
          last_price: number
          source: string
          status: string
          priced_at: string
        }
        Update: {
          id?: never
          asset_id?: string
          asset?: string
          last_price?: number
          source?: string
          status?: string
          priced_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          is_admin: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          is_admin?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          is_admin?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          id: number
          reference_id: string
          name: string | null
          email: string | null
          category: string
          subject: string | null
          message: string
          status: string
          user_id: string | null
          created_at: string
          updated_at: string
          open_at: string | null
          pending_at: string | null
          resolved_at: string | null
          closed_at: string | null
        }
        Insert: {
          id?: never
          reference_id?: string
          name?: string | null
          email?: string | null
          category: string
          subject?: string | null
          message: string
          status?: string
          user_id?: string | null
          created_at?: string
          updated_at?: string
          open_at?: string | null
          pending_at?: string | null
          resolved_at?: string | null
          closed_at?: string | null
        }
        Update: {
          id?: never
          reference_id?: string | null
          name?: string | null
          email?: string | null
          category?: string | null
          subject?: string | null
          message?: string | null
          status?: string | null
          user_id?: string | null
          created_at?: string | null
          updated_at?: string | null
          open_at?: string | null
          pending_at?: string | null
          resolved_at?: string | null
          closed_at?: string | null
        }
        Relationships: []
      }
      support_ticket_replies: {
        Row: {
          id: number
          ticket_id: number
          user_id: string | null
          message: string
          is_staff: boolean
          created_at: string
        }
        Insert: {
          id?: never
          ticket_id: number
          user_id?: string | null
          message: string
          is_staff?: boolean
          created_at?: string
        }
        Update: {
          id?: never
          ticket_id?: number | null
          user_id?: string | null
          message?: string | null
          is_staff?: boolean | null
          created_at?: string | null
        }
        Relationships: []
      }
      wallets: {
        Row: {
          id: string
          user_id: string
          address: string
          label: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          address: string
          label?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          address?: string
          label?: string | null
          created_at?: string
        }
        Relationships: []
      }
      buckets: {
        Row: {
          id: string
          name: string
          owner: string | null
          created_at: string
          updated_at: string
          public: boolean
        }
        Insert: {
          id: string
          name: string
          owner?: string | null
          created_at?: string
          updated_at?: string
          public?: boolean
        }
        Update: {
          id?: string
          name?: string
          owner?: string | null
          created_at?: string
          updated_at?: string
          public?: boolean
        }
        Relationships: []
      }
      objects: {
        Row: {
          id: string
          bucket_id: string | null
          name: string | null
          owner_id: string | null
          created_at: string
          updated_at: string
          last_accessed_at: string
          metadata: Json | null
        }
        Insert: {
          id?: string
          bucket_id?: string | null
          name?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
          last_accessed_at?: string
          metadata?: Json | null
        }
        Update: {
          id?: string
          bucket_id?: string | null
          name?: string | null
          owner_id?: string | null
          created_at?: string
          updated_at?: string
          last_accessed_at?: string
          metadata?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_kyc_review_decision: {
        Args: {
          p_request_id: number
          p_decision: string
          p_notes: string
          p_admin_id: string
        }
        Returns: void
      }
      review_withdrawal_request: {
        Args: {
          p_request_id: number
          p_decision: string
          p_admin_id: string
          p_rejection_reason?: string
        }
        Returns: void
      }
      set_user_active_status: {
        Args: {
          p_user_id: string
          p_is_active: boolean
          p_admin_id: string
        }
        Returns: void
      }
      estimate_buy_market_impact: {
        Args: {
          p_asset: string
          p_amount_eur: number
        }
        Returns: Json
      }
      refresh_asset_snapshots: {
        Args: {
          p_source: string
        }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
