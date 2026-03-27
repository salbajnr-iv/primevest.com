/**
 * Database Type Definitions
 * 
 * These types match the actual database schema from SQL migrations.
 * Use these instead of 'any' for type-safe database operations.
 */

// =====================================================
// KYC Types (from supabase-migration-kyc.sql)
// =====================================================

export type KYCDocument = {
  id: string;              // UUID PRIMARY KEY
  request_id: string;      // UUID REFERENCES kyc_requests
  user_id: string;         // UUID REFERENCES profiles
  doc_type: string;        // TEXT NOT NULL
  storage_path: string;    // TEXT NOT NULL - path in storage bucket
  file_name: string;       // TEXT NOT NULL
  mime_type?: string;      // TEXT
  size?: number;           // BIGINT
  uploaded_at: string;     // TIMESTAMPTZ
  meta?: Record<string, unknown>;  // JSONB
  updated_at?: string;     // TIMESTAMPTZ
};

export type KYCRequest = {
  id: string;              // UUID PRIMARY KEY
  user_id: string;         // UUID REFERENCES profiles
  status: KYCStatus;       // kyc_status ENUM
  submitted_at: string;    // TIMESTAMPTZ
  reviewed_at?: string;    // TIMESTAMPTZ
  reviewed_by?: string;    // UUID REFERENCES profiles
  review_reason?: string;  // TEXT
  metadata?: Record<string, unknown>;  // JSONB
  created_at?: string;     // TIMESTAMPTZ
  updated_at?: string;     // TIMESTAMPTZ
};

export type KYCStatus = 
  | 'none'
  | 'pending'
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'rejected';

export type KYCReviewResult = {
  request_id: string;
  request_status: string;
  user_id?: string;
  success?: boolean;
  message?: string;
};

// =====================================================
// Support Ticket Types (from supabase-support-tickets-v2.sql)
// =====================================================

export type SupportTicket = {
  id: number;              // BIGSERIAL PRIMARY KEY
  user_id?: string;        // UUID REFERENCES profiles (nullable)
  reference_id?: string;   // TEXT
  category?: string;       // TEXT
  subject?: string;        // TEXT
  message?: string;        // TEXT
  status: string;          // TEXT NOT NULL
  created_at: string;      // TIMESTAMPTZ
  updated_at: string;      // TIMESTAMPTZ
  open_at?: string;        // TIMESTAMPTZ
  pending_at?: string;     // TIMESTAMPTZ
  resolved_at?: string;    // TIMESTAMPTZ
  closed_at?: string;      // TIMESTAMPTZ
};

export type SupportTicketReply = {
  id: number;              // BIGSERIAL PRIMARY KEY
  ticket_id: number;       // BIGINT REFERENCES support_tickets
  user_id?: string;        // UUID REFERENCES profiles (nullable)
  message: string;         // TEXT NOT NULL
  is_staff: boolean;       // BOOLEAN NOT NULL DEFAULT false
  created_at: string;      // TIMESTAMPTZ NOT NULL
};

export type SupportTicketState = 
  | 'open'
  | 'pending'
  | 'resolved'
  | 'closed';

// =====================================================
// Profile & Admin Types
// =====================================================

export type Profile = {
  id: string;              // UUID PRIMARY KEY
  email: string;
  full_name?: string;
  avatar_url?: string;
  account_balance: number; // NUMERIC(20, 8)
  is_admin: boolean;       // BOOLEAN DEFAULT false
  is_active: boolean;      // BOOLEAN DEFAULT true
  kyc_status: KYCStatus;   // kyc_status ENUM
  kyc_requested_at?: string;
  kyc_reviewed_at?: string;
  kyc_rejection_reason?: string;
  created_at?: string;
  updated_at?: string;
};

export type AdminActionAudit = {
  id: string;              // UUID PRIMARY KEY
  admin_id: string;        // UUID REFERENCES profiles
  action_type: string;     // TEXT
  target_table?: string;   // TEXT
  target_id?: string;      // TEXT
  changes?: Record<string, unknown>;  // JSONB
  context?: Record<string, unknown>;  // JSONB
  ip_address?: string;     // TEXT
  created_at?: string;     // TIMESTAMPTZ
};

// =====================================================
// Order & Trading Types
// =====================================================

export type Order = {
  id: string;              // UUID PRIMARY KEY
  user_id: string;         // UUID REFERENCES profiles
  asset: string;           // TEXT NOT NULL
  side: 'buy' | 'sell';    // TEXT NOT NULL
  type?: string;           // TEXT (market, limit, etc.)
  amount: number;          // NUMERIC
  price?: number;          // NUMERIC
  total_amount: number;    // NUMERIC (renamed from 'total')
  status: string;          // TEXT
  created_at: string;      // TIMESTAMPTZ
  updated_at: string;      // TIMESTAMPTZ
};

export type Trade = {
  id: string;              // UUID PRIMARY KEY
  order_id: string;        // UUID REFERENCES orders
  user_id: string;         // UUID REFERENCES profiles
  asset: string;           // TEXT NOT NULL
  side: 'buy' | 'sell';    // TEXT NOT NULL
  amount: number;          // NUMERIC
  price: number;           // NUMERIC
  total_amount: number;    // NUMERIC (renamed from 'total')
  fee?: number;            // NUMERIC
  executed_at: string;     // TIMESTAMPTZ
};

export type Transaction = {
  id: string;              // UUID PRIMARY KEY
  user_id: string;         // UUID REFERENCES profiles
  type: string;            // TEXT NOT NULL
  amount: number;          // NUMERIC NOT NULL
  total_amount: number;    // NUMERIC (renamed from 'total')
  status: string;          // TEXT
  description?: string;    // TEXT
  metadata?: Record<string, unknown>;  // JSONB
  created_at: string;      // TIMESTAMPTZ
};

// =====================================================
// Market Data Types
// =====================================================

export type MarketPrice = {
  id?: number;             // BIGSERIAL (optional for inserts)
  asset_id?: string;       // UUID REFERENCES assets
  asset: string;           // TEXT NOT NULL
  last_price: number;      // NUMERIC
  price: number;           // NUMERIC
  source: string;          // TEXT
  status?: string;         // TEXT (live/delayed/stale)
  captured_at: string;     // TIMESTAMPTZ
  priced_at: string;       // TIMESTAMPTZ
  created_at?: string;     // TIMESTAMPTZ
};

export type AssetSnapshot = {
  asset: string;           // TEXT PRIMARY KEY
  price_eur: number;       // NUMERIC
  source: string;          // TEXT
  source_status?: string;  // TEXT
  priced_at: string;       // TIMESTAMPTZ
  updated_at?: string;     // TIMESTAMPTZ
};

// =====================================================
// Utility Types
// =====================================================

/**
 * Supabase query response wrapper
 * Use this when you need to handle both single and array responses
 */
export type SupabaseResponse<T> = {
  data: T | null;
  error: {
    message: string;
    code?: string;
    details?: string;
    hint?: string;
  } | null;
};

/**
 * RPC function result wrapper
 */
export type RPCResult<T = Record<string, unknown>> = {
  data: T[] | T | null;
  error: {
    message: string;
    code?: string;
    details?: string;
  } | null;
};
