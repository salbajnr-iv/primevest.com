# 🔧 TypeScript Error Fix Plan - API Routes

## 📋 Overview

Fix TypeScript errors in admin and support API routes with **proper type safety** and **real database integration**.

---

## 🎯 Issues to Fix

### **Issue Category 1: String vs Number Type Mismatches** 🔴 CRITICAL

**Problem**: Database IDs are UUIDs (strings) but code treats them as numbers

**Files Affected**:

1. `app/api/admin/kyc/document/route.ts` - Line 34
2. `app/api/support/tickets/[id]/reply/route.ts` - Lines 32, 99, 112, 121, 127

**Root Cause**:

- Supabase `kyc_documents.id` is UUID (string)
- Supabase `support_tickets.id` is BIGINT (number)
- Route params come as strings from URL

**Solution**:

- Parse string params to correct types before DB queries
- Use `Number()` for bigint columns
- Keep UUIDs as strings

---

### **Issue Category 2: Explicit `any` Types** 🟡 IMPORTANT

**Problem**: Using `any` instead of proper TypeScript types

**Files Affected**:

1. `app/api/admin/kyc/document/route.ts` - Line 43
2. `app/api/support/tickets/[id]/reply/route.ts` - Lines 76, 86, 98, 111, 127
3. `app/api/admin/kyc/review/route.ts` - Lines 36, 51, 52, 53
4. `app/api/admin/users/delete/route.ts` - Lines 60, 73
5. `app/api/admin/users/impersonate/route.ts` - Lines 60, 71
6. `app/api/admin/users/status/route.ts` - Lines 34, 49, 50, 51
7. `app/api/buy/market-impact/route.ts` - Line 56
8. `app/api/orders/route.ts` - (multiple)

**Solution**:

- Create proper TypeScript interfaces for database rows
- Use type assertions instead of `any`
- Import types from shared location

---

## 🏗️ Implementation Plan

### **Phase 1: Create Shared Type Definitions** ✅

Create `lib/types/database.ts` with proper interfaces:

```typescript
// KYC Document from database
export type KYCDocument = {
  id: string; // UUID
  request_id: string; // UUID
  user_id: string; // UUID
  doc_type: string;
  storage_path: string;
  file_name: string;
  mime_type?: string;
  size?: number;
  uploaded_at: string;
  meta?: Record<string, unknown>;
  updated_at?: string;
};

// Support Ticket Reply
export type SupportTicketReply = {
  id: number; // bigserial
  ticket_id: number; // bigint
  user_id?: string; // uuid (nullable)
  message: string;
  is_staff: boolean;
  created_at: string;
};

// Support Ticket
export type SupportTicket = {
  id: number; // bigint
  user_id?: string; // uuid (nullable)
  reference_id?: string;
  category?: string;
  subject?: string;
  message?: string;
  status: string;
  created_at: string;
  updated_at: string;
  open_at?: string;
  pending_at?: string;
  resolved_at?: string;
  closed_at?: string;
};

// KYC Review Result
export type KYCReviewResult = {
  request_id: string;
  request_status: string;
  user_id?: string;
};
```

---

### **Phase 2: Fix Each File**

#### **File 1: `app/api/admin/kyc/document/route.ts`**

**Changes**:

- ✅ Line 34: `id` is UUID, keep as string (no change needed)
- ✅ Line 43: Replace `(doc as any)` with proper type assertion

**Fix**:

```typescript
import type { KYCDocument } from "@/lib/types/database";

// Line 43: Replace (doc as any) with proper type
const storagePath = (doc as KYCDocument).storage_path;
```

---

#### **File 2: `app/api/support/tickets/[id]/reply/route.ts`**

**Changes**:

- ✅ Line 27: Extract `id` from params
- ✅ Line 32: Convert `id` to number for support_tickets.id (bigint)
- ✅ Line 71: Convert `id` to number for ticket_id (bigint)
- ✅ Line 76: Remove `as any`, use proper type
- ✅ Line 86: Remove `as any` cast
- ✅ Line 98: Remove `as any`, use proper type
- ✅ Line 111: Remove `as any`, use proper type
- ✅ Line 127: Convert `id` to number for ticket_id (bigint)

**Fix**:

```typescript
import type { SupportTicket, SupportTicketReply } from "@/lib/types/database";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  // ... auth code ...

  const { id: idStr } = await params;
  const ticketId = Number(idStr);  // Convert string to number

  // Line 32: Use converted number
  .eq("id", ticketId)

  // Line 71: Use converted number
  .insert({
    ticket_id: ticketId,  // ✅ Now number type
    user_id: user.id,
    message,
    is_staff: false,
    created_at: now,
  })  // ✅ No 'as any' needed

  // Line 98-99: Update with proper types
  .update({ status: nextStatus, ...statusTimestamps })
  .eq("id", ticketId)  // ✅ number

  // Line 127: Query replies
  .eq("ticket_id", ticketId)  // ✅ number
```

---

#### **File 3: `app/api/admin/kyc/review/route.ts`**

**Changes**:

- ✅ Line 26-36: RPC call needs proper parameter types
- ✅ Line 36: Remove `as any`
- ✅ Lines 51-53: Remove `as any` casts, use proper result type

**Fix**:

```typescript
import type { KYCReviewResult } from "@/lib/types/database";

// Lines 26-36: Proper RPC typing
const { data, error } = await supabase.rpc("apply_kyc_review_decision", {
  p_request_id: request_id, // string (UUID)
  p_decision: status, // 'verified' | 'rejected'
  p_admin_id: auth.adminId, // string (UUID)
  p_reason: reason || null,
  p_action_type: "kyc_review",
  p_context: {
    source: "admin_api",
  },
  p_ip_address: requestIpFromHeaders(req),
});

// Lines 46-53: Proper result typing
const result = Array.isArray(data) ? data[0] : data;
const typedResult = result as KYCReviewResult | null;

return NextResponse.json({
  ok: true,
  success: true,
  requestId: typedResult?.request_id ?? request_id,
  status: typedResult?.request_status ?? status,
  userId: typedResult?.user_id ?? null,
});
```

---

### **Phase 3: Fix Remaining Admin User Routes**

Similar pattern for:

- `app/api/admin/users/delete/route.ts`
- `app/api/admin/users/impersonate/route.ts`
- `app/api/admin/users/status/route.ts`
- `app/api/buy/market-impact/route.ts`
- `app/api/orders/route.ts`

**Strategy**:

1. Create proper interface for each operation's result
2. Replace `as any` with type assertions
3. Ensure ID conversions (string → number for bigints)

---

## ✅ Type Safety Rules

### **ID Type Conversion Table**:

| Table                    | Column      | Type               | Conversion      |
| ------------------------ | ----------- | ------------------ | --------------- |
| `kyc_documents`          | `id`        | UUID (string)      | Keep as string  |
| `kyc_requests`           | `id`        | UUID (string)      | Keep as string  |
| `support_tickets`        | `id`        | BIGINT (number)    | `Number(idStr)` |
| `support_ticket_replies` | `id`        | BIGSERIAL (number) | Already number  |
| `support_ticket_replies` | `ticket_id` | BIGINT (number)    | `Number(idStr)` |
| `profiles`               | `id`        | UUID (string)      | Keep as string  |

### **When to Use Type Assertions**:

```typescript
// ❌ BAD - uses any
const result = data as any;

// ✅ GOOD - specific type
const result = data as KYCReviewResult | null;

// ✅ BETTER - type guard
if (!result) throw new Error("No result");
const typedResult = result as KYCReviewResult;
```

---

## 🎯 Real Database Integration

### **Database Schema Reference**:

```sql
-- kyc_documents (from supabase-migration-kyc.sql)
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY,              -- ← string
  request_id UUID,                   -- ← string
  user_id UUID NOT NULL,             -- ← string
  doc_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,        -- ← for signed URLs
  file_name TEXT NOT NULL,
  mime_type TEXT,
  size BIGINT,
  uploaded_at TIMESTAMPTZ,
  meta JSONB
);

-- support_tickets (from supabase-support-tickets-v2.sql)
CREATE TABLE support_tickets (
  id BIGSERIAL PRIMARY KEY,          -- ← number
  user_id UUID,                      -- ← string
  reference_id TEXT,
  category TEXT,
  subject TEXT,
  message TEXT,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,            -- ← auto-updated
  open_at TIMESTAMPTZ,
  pending_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ
);

-- support_ticket_replies
CREATE TABLE support_ticket_replies (
  id BIGSERIAL PRIMARY KEY,          -- ← number
  ticket_id BIGINT NOT NULL,         -- ← number (FK to support_tickets.id)
  user_id UUID,                      -- ← string
  message TEXT NOT NULL,
  is_staff BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL
);
```

---

## 📊 Testing Strategy

After fixes, verify with real database operations:

### **Test 1: KYC Document Retrieval**

```bash
curl "http://localhost:3000/api/admin/kyc/document?id={UUID}&status=verified" \
  -H "Authorization: Bearer {ADMIN_TOKEN}"
```

**Expected**: Returns signed URL for document

### **Test 2: Support Ticket Reply**

```bash
curl -X POST "http://localhost:3000/api/support/tickets/123/reply" \
  -H "Authorization: Bearer {USER_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"message":"Test reply","status":"pending"}'
```

**Expected**: Creates reply, updates ticket status

### **Test 3: KYC Review**

```bash
curl -X POST "http://localhost:3000/api/admin/kyc/review" \
  -H "Authorization: Bearer {ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"request_id":"{UUID}","status":"verified"}'
```

**Expected**: Updates KYC status, returns result

---

## 🎉 Success Criteria

After implementation:

- ✅ **Zero TypeScript errors** in all fixed files
- ✅ **Zero ESLint warnings** (no `any` types)
- ✅ **Type-safe database operations** with proper interfaces
- ✅ **Correct ID type handling** (string for UUIDs, number for bigints)
- ✅ **Real database integration** working with actual schema
- ✅ **All API routes compile** without errors
- ✅ **Runtime type safety** - no unexpected type coercion

---

## 📝 Files to Create/Modify

### **Create**:

1. ✅ `lib/types/database.ts` - Shared database type definitions

### **Modify**:

1. ✅ `app/api/admin/kyc/document/route.ts`
2. ✅ `app/api/support/tickets/[id]/reply/route.ts`
3. ✅ `app/api/admin/kyc/review/route.ts`
4. ✅ `app/api/admin/users/delete/route.ts`
5. ✅ `app/api/admin/users/impersonate/route.ts`
6. ✅ `app/api/admin/users/status/route.ts`
7. ✅ `app/api/buy/market-impact/route.ts`
8. ✅ `app/api/orders/route.ts`

---

**Ready to implement!** This plan ensures type safety while maintaining real database functionality. 🚀
