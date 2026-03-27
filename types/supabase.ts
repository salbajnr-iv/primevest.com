// Auto-generated Supabase types (placeholder - run `npx supabase gen types` later)
// Add real types from your Supabase schema here

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          updated_at: string | null
          username: string | null
          full_name: string | null
          avatar_url: string | null
          website: string | null
        }
        Insert: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Update: {
          id?: string
          updated_at?: string | null
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      balances: {
        Row: {
          id: string
          user_id: string
          asset: string
          available: number
          locked: number
          updated_at: string
        }
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
          status: string
          created_at: string
        }
      }
    }
  }
}

