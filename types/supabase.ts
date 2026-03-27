// Generated Supabase database types.
// Regenerate with: supabase gen types typescript --project-id "$SUPABASE_PROJECT_ID" --schema public > types/supabase.ts
// schema-version: 20261013000000

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
      ledger_entries: {
        Row: {
          id: string
          user_id: string
          type: string
          asset: string
          amount: number
          reference: string | null
          timestamp: string
          status: string
          internal_transfer: boolean | null
        }
        Insert: {
          id?: string
          user_id: string
          type: string
          asset: string
          amount: number
          reference?: string | null
          timestamp?: string
          status?: string
          internal_transfer?: boolean | null
        }
        Update: {
          id?: string
          user_id?: string
          type?: string
          asset?: string
          amount?: number
          reference?: string | null
          timestamp?: string
          status?: string
          internal_transfer?: boolean | null
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
      orders: {
        Row: {
          id: string
          user_id: string
          side: 'buy' | 'sell'
          pair: string
          amount: number
          price: number | null
          total: number
          total_amount: number | null
          status: string
          order_type: string | null
          asset: string | null
          symbol: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          side: 'buy' | 'sell'
          pair: string
          amount: number
          price?: number | null
          total?: number
          total_amount?: number | null
          status?: string
          order_type?: string | null
          asset?: string | null
          symbol?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          side?: 'buy' | 'sell'
          pair?: string
          amount?: number
          price?: number | null
          total?: number
          total_amount?: number | null
          status?: string
          order_type?: string | null
          asset?: string | null
          symbol?: string | null
          created_at?: string
        }
        Relationships: []
      }
      positions: {
        Row: {
          id: string
          user_id: string
          asset: string
          asset_id: string | null
          quantity: number
          avg_cost: number | null
          market_value: number | null
          unrealized_pnl: number | null
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          asset: string
          asset_id?: string | null
          quantity?: number
          avg_cost?: number | null
          market_value?: number | null
          unrealized_pnl?: number | null
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          asset?: string
          asset_id?: string | null
          quantity?: number
          avg_cost?: number | null
          market_value?: number | null
          unrealized_pnl?: number | null
          updated_at?: string
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
      trades: {
        Row: {
          id: string
          pair: string
          price: number
          amount: number
          side: 'buy' | 'sell'
          created_at: string
        }
        Insert: {
          id?: string
          pair: string
          price: number
          amount: number
          side: 'buy' | 'sell'
          created_at?: string
        }
        Update: {
          id?: string
          pair?: string
          price?: number
          amount?: number
          side?: 'buy' | 'sell'
          created_at?: string
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

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
        Database["public"]["Views"])
    ? (Database["public"]["Tables"] &
        Database["public"]["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends keyof Database["public"]["Tables"] | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends { Insert: infer I }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
    ? Database["public"]["Tables"][PublicTableNameOrOptions] extends { Insert: infer I }
      ? I
      : never
    : never
