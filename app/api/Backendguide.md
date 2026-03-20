README.md — Database Integration Guide
(Note: I'm providing the full README.md content below as a ready-to-commit Markdown file. Save it as README.md in your backend repo. After the README, you'll find concrete example server routes in TypeScript using the Supabase JS client; place those in your backend service (e.g., Express / Deno/Edge Function).)

Database Integration Guide
Project ref: xhyivvvbrcmbjvzmvlod
Primary schemas: auth, public, storage
Purpose: Single source of truth for backend and frontend teams to integrate the app with the database reliably, securely, and consistently.

Table of contents

Overview
Important schema summary
Authentication & authorization
Profiles & user data
KYC workflow
Storage (buckets & objects)
Wallets, balances & ledger (financial integrity)
Admin actions & auditing
Market prices & analytics
Recommended API endpoints & contracts
RLS & security responsibilities
Concurrency, indexing & performance
Background jobs & triggers
Vector & analytics buckets
Error handling, logging & monitoring
Developer checklist
Example SQL snippets
Testing matrix
Runbooks & operational notes
Next steps & action items
Appendix: useful queries
Overview
This guide documents the current DB layout and provides conventions and instructions for safe integrations. All developers must use this guide when implementing features touching auth, profiles, KYC, storage, wallets, ledger, or admin tooling.

Key points:

Use Supabase Auth client in the frontend (anon key + user sessions).
Protect the Service Role key: only server-side usage.
RLS is enabled on many tables; APIs must respect the RLS rules or use server-side checks when required.
Financial operations must be server-side, transactional, and idempotent.
Important schema summary
Primary schemas and tables to know:

auth: users, sessions, refresh_tokens, identities
public: profiles, admin_users, admin_actions, balance_history, kyc_requests, kyc_documents, wallets, balances, ledger_entries, ledger_audit, ledger_idempotency, user_asset_aggregates, market_prices
storage: buckets, objects, buckets_vectors, vector_indexes, s3_multipart_uploads*
Installed DB extensions (selected): pgcrypto, pg_stat_statements, pgjwt, vector, uuid-ossp, pg_trgm, postgis, pg_cron, pg_repack, etc.

Authentication & Authorization
Frontend: use Supabase client libs and anon/public key with the user's session.
Backend (trusted): use the Service Role key for operations that require bypassing RLS (e.g., ledger writes, admin actions).
Use auth.uid() for DB-level checks and to enforce row ownership.
Token notes:
Keep service_role key secret.
Do not embed it in client code.
Role patterns:
Normal users: authenticated (RLS applies).
Admins: detected via public.profiles.is_admin or custom JWT claim; admin changes should be audited.
Profiles & user data
Canonical user profile table: public.profiles (id = uuid).
Typical fields used by apps: full_name, avatar_url, email, is_admin, is_active, kyc_status.
On signup:
Create auth.users via Supabase Auth.
Immediately create public.profiles with the same id as auth.uid().
Client-side restrictions:
Only request and allow edits to non-sensitive fields.
Let server validate fields before write (email uniqueness checks, etc.).
KYC workflow
Tables involved: public.kyc_requests, public.kyc_documents, public.profiles, storage.objects.
Flow:
User fills KYC form on frontend.
Upload documents to a private storage bucket (use Supabase Storage client).
Create a kyc_request referencing user_id = auth.uid() with metadata.
Create kyc_documents entries that reference the uploaded storage path(s).
Admin reviews KYC; updates public.kyc_requests.status and public.profiles.kyc_status; create public.admin_actions for audit.
Security:
Private bucket for KYC documents. Storage RLS or bucket access must ensure only authorized users or admins can access.
Audit:
Admin reviews must create admin_actions with old_value and new_value (JSON), admin_id and ip_address.
Storage (buckets & objects)
Buckets: storage.buckets (id, public flag, owner_id, type).
Objects: storage.objects (id, bucket_id, name, owner_id, metadata, path_tokens).
Upload patterns:
Client should use Supabase Storage client to upload directly (authenticated user) to avoid routing file data through the backend.
If backend needs to sign uploads or process files, use service role and read from /tmp for temporary writes.
Best practices:
Use private buckets for PII and KYC.
Store user_id in metadata or owner_id for simple RLS.
Use path_tokens for folder-level security when needed.
Access:
Generate signed URLs when you must provide time-limited access.
Wallets, balances & ledger (financial integrity)
Tables:
public.wallets (id, user_id, asset, network, address)
public.balances (wallet_id PK, user_id, asset, network, balance, reserved)
public.ledger_entries (immutable ledger rows)
public.ledger_audit, public.ledger_idempotency, public.user_asset_aggregates
Rules:
All ledger/balance changes must be performed server-side using the Service Role key; clients never write directly.
Use transactions to ensure atomicity.
Use row-level locking (SELECT ... FOR UPDATE) on balances to prevent race conditions.
Use ledger_idempotency for idempotent operations; require an idempotency_key from clients.
Recommended sequence for transfers:
Start transaction.
Check/lock source balances (FOR UPDATE).
Validate sufficient funds.
Create idempotency record (or fail if exists and return stored result).
Insert ledger entry for debit and credit.
Update balances table(s).
Optionally insert into ledger_audit.
Commit.
Concurrency:
Implement retries if deadlocks occur; exponential backoff recommended.
Admin actions & auditing
Tables: public.admin_actions, public.balance_history.
Admin operations must:
Log an admin_action with admin_id, action_type, target_user_id, old_value, new_value, ip_address.
For balance adjustments, also write to balance_history with action_type (add|subtract|set|reset).
Access:
Admin checks should be server-side based on public.profiles.is_admin or a verified admin claim.
Keep retention & access policies for audit tables.
Market prices & analytics
public.market_prices stores latest price per asset/currency.
Updates should be performed server-side by a scheduled task or an authorized service.
Use market_prices to compute fiat equivalents on frontend/backend.
Recommended API endpoints & contracts
Example endpoints (names and minimal payloads):

Auth
GET /me
Returns combined auth.users + public.profiles for current session.
Profiles
GET /profiles/:id
PATCH /profiles/:id
Body: { full_name?, avatar_url? }
KYC
POST /kyc/requests
Body: { metadata: {...}, documents: [ {bucket, path, file_name, mime_type} ] }
GET /kyc/requests
POST /kyc/review (admin-only)
Body: { request_id, new_status, review_reason }
Wallets & Ledger
GET /wallets
POST /wallets
POST /ledger/transfer (server-only)
Body: { from_wallet_id, to_wallet_id, asset, network, amount, idempotency_key, metadata }
Storage
POST /upload-url (optional): returns signed URL for client to upload
GET /files/:bucket/:path
Always design APIs so clients never have to hold or use the service_role key.

RLS & security responsibilities
Frontend:
Use user sessions and anon key.
Treat server endpoints as the authority for sensitive operations.
Backend:
Use service_role key for administrative tasks.
Validate all inputs server-side.
Implement idempotency for financial operations.
RLS patterns:
Row ownership: user_id = auth.uid() or owner_id = auth.uid()::text.
Admin operations: require either a JWT claim is_admin or be performed via service_role.
Tip: Test policies by impersonating users (simulate JWTs) and ensure unauthorized access is denied.
Concurrency, indexing & performance
Index columns used in RLS and WHERE clauses: user_id, wallet_id, tenant_id, topic (if using realtime).
For ledger updates: SELECT ... FOR UPDATE inside transactions.
Profile and wallet queries are frequent; ensure appropriate indexes exist.
Use pg_stat_statements and pg_stat_monitor to surface slow queries and optimize.
Background jobs & triggers
Use pg_cron for scheduled DB tasks (extensions available).
Examples:
Recompute aggregates nightly.
Purge old sessions or temporary data.
Realtime:
Use database triggers with realtime.broadcast_changes for notifying channels (follow realtime naming conventions).
For heavy file work, use a worker process and store job status in DB.
Vector & analytics buckets
Vector-enabled buckets and vector_indexes exist for semantic search.
Treat vector indexing and writes as privileged operations; perform vector inserts/updates server-side.
Secure vector indexes via RLS.
Error handling, logging & monitoring
Log critical events server-side: ledger writes, idempotency rejects, admin actions, KYC approvals/denials.
Use pg_stat_monitor and pg_stat_statements for query profiling.
Return safe, non-sensitive error messages to clients. Persist full error details in logs for investigation.
Developer checklist before deploy
Verify RLS policies with test users and admin.
Confirm service_role key usage is server-only.
Add tests for ledger concurrency and idempotency.
Ensure private buckets exist for PII and KYC docs.
Confirm indexes for RLS columns exist.
Example SQL snippets
(Backend-only snippets; replace parameters)

Insert profile: INSERT INTO public.profiles (id, full_name, email) VALUES (:id, :full_name, :email);
Fetch current user profile: SELECT p.* FROM public.profiles p WHERE p.id = auth.uid();
Lock balance row: SELECT balance FROM public.balances WHERE wallet_id = :wallet_id FOR UPDATE;
Insert idempotency check: INSERT INTO public.ledger_idempotency (idempotency_key, payload, created_at) VALUES (:key, :payload, now());*
Testing matrix
Sign-up & sign-in flows
Session refresh and expiry
RLS enforcement tests (user A cannot access B's data)
KYC: upload, attach, admin review, and status changes
Wallets: concurrent debit/credit, idempotency, negative balance prevention
Storage: access private files with and without authorization
Admin: action audit logs and rollbacks
Runbooks & operational notes
If balances or ledgers diverge, consult ledger_audit, ledger_entries, ledger_idempotency.
Use DB snapshots/backups for recovery.
Rotate service_role key if leaked.
Next steps & action items
Backend: implement transactional ledger endpoints with idempotency and audits.
Frontend: use Supabase client for auth and storage, avoid direct writes to ledger tables.
Security: audit RLS and rotate service_role if necessary.
Ops: create scheduled jobs for aggregates and reconciliations.
Appendix: useful queries
Get current user profile: SELECT p.* FROM public.profiles p WHERE p.id = auth.uid();
List user wallets: SELECT * FROM public.wallets WHERE user_id = auth.uid();
User's storage files under root folder: SELECT * FROM storage.objects WHERE (path_tokens)[1] = auth.uid()::text AND bucket_id = :bucket_id;*
End README.md
Below are concrete example server routes (TypeScript) you can drop into a Node/Express server or adapt for a Deno Edge Function. These examples use the official Supabase JS client (npm specifier). They assume you have environment variables set: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (server-only).

Files:

server/routes/ledger.ts
server/routes/kyc.ts
server/routes/admin.ts
Notes and assumptions:

Using "npm:@supabase/supabase-js" v3+ package naming is recommended. Replace imports as necessary for your environment.
These are minimal, ready-to-review implementations showing transactional patterns and input validation.
You must secure these routes with server-side auth (e.g., middleware verifying the provided Authorization header matches an admin or trusted system). Example uses a simple header check for demo; replace with real auth checks.
Error handling returns structured JSON; adapt as your project's error middleware requires.
Example: server/routes/ledger.ts (TypeScript, Express-style)

import
 express 
from
 "npm:express@4.18.2";
import
 { createClient } 
from
 "npm:@supabase/supabase-js@2.34.0";
import
 { randomUUID } 
from
 "node:crypto";
const router = express.Router();
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if
 (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  throw 
new
 Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
}
const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: 
false
 },
});
type
 TransferReq = {
  from_wallet_id: string;
  to_wallet_id: string;
  asset: string;
  network: string;
  amount: string; // 
numeric
 
as
 string 
to
 avoid 
float
 issues
  idempotency_key: string;
  metadata?: 
Record
<string, 
unknown
>;
};
// Helper: parse 
numeric
 safely
const toNumeric = (val: string) => {
  const n = Number(val);
  
if
 (Number.isNaN(n)) throw 
new
 Error("Invalid numeric amount");
  
return
 n;
};
router.post("/transfer", async (req, res) => {
  const body = req.body 
as
 TransferReq;
  
if
 (!body) 
return
 res.status(
400
).json({ error: "Missing body" });
  const {
    from_wallet_id,
    to_wallet_id,
    asset,
    network,
    amount,
    idempotency_key,
    metadata = {},
  } = body;
  
if
 (!from_wallet_id || !to_wallet_id || !asset || !network || !amount || !idempotency_key) {
    
return
 res.status(
400
).json({ error: "Missing required fields" });
  }
  const client = sb;
  const xid = randomUUID();
  // Use direct 
SQL
 
transaction
 
with
 Supabase Postgres RPC (
execute
 
SQL
) 
OR
 use pg client inside backend.
  // Supabase JS doesn
't expose explicit BEGIN/COMMIT for Postgres; we'
ll use a single 
SQL
 block via RPC/pg_query.
  // Example uses a secure 
prepared
 
function
 approach: run a 
WITH
 block that attempts idempotency 
and
 ledger writes atomically.
  const 
sql
 = `
  
WITH
 existing 
AS
 (
    
SELECT
 id 
FROM
 
public
.ledger_idempotency 
WHERE
 idempotency_key = 
$1

  ), create_idempotency 
AS
 (
    
INSERT
 
INTO
 
public
.ledger_idempotency(id, idempotency_key, payload, created_at)
    
SELECT
 
$2
, 
$1
, 
$3
::
jsonb
, now()
    
WHERE
 
NOT
 
EXISTS
 (
SELECT
 
1
 
FROM
 existing)
    
RETURNING
 id
  ), maybe 
AS
 (
    
SELECT
 id 
FROM
 existing
    
UNION
 
ALL

    
SELECT
 id 
FROM
 create_idempotency
  )
  
-- If id already existed, return it and skip ledger write

  
SELECT
 id 
IS
 
NOT
 
NULL
 
AS
 already_executed 
FROM
 maybe 
LIMIT
 
1
;
  `;
  try {
    const payload = { from_wallet_id, to_wallet_id, asset, network, amount, metadata };
    const { data, error } = await client.rpc("sql", {
      q: 
sql
,
      params: [idempotency_key, xid, 
JSON
.stringify(payload)],
    } 
as
 
any
); // 
If
 
using
 direct 
SQL
 running mechanism; replace 
with
 your DB runner
    // NOTE: The above 
is
 placeholder: Supabase JS doesn
't allow arbitrary multi-statement SQL via rpc('
sql
') by default.
    // In practice, implement a server-side Postgres client (pg) and run the transaction there. Below is an alternative using '
pg
' driver:
    return res.status(501).json({
      error:
        "This example requires a direct Postgres client to run transactions atomically. See the code comments to switch to '
pg
' and use BEGIN/COMMIT with SELECT ... FOR UPDATE.",
    });
  } catch (err) {
    console.error("transfer error", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});
export default router;

Implementation note (important):

The Supabase JS client does not provide a way to run multi-statement SQL transactions as needed for safe ledger writes. For production ledger operations, use a direct Postgres client (node-postgres, "pg") configured with SUPABASE_DB_URL or run inside a server environment where you can connect to the DB with the service role credentials. Use explicit transactions (BEGIN; ... COMMIT) and SELECT ... FOR UPDATE.
Below is a production-ready pattern using node-postgres ("pg") for ledger transactions. Place in server/routes/ledger_pg.ts:

import
 express 
from
 "npm:express@4.18.2";
import
 { Pool } 
from
 "npm:pg@8.10.0";
import
 { randomUUID } 
from
 "node:crypto";
const router = express.Router();
const PG_CONNECTION = process.env.SUPABASE_DB_URL!;
if
 (!PG_CONNECTION) throw 
new
 Error("SUPABASE_DB_URL is required");
const pool = 
new
 Pool({
  connectionString: PG_CONNECTION,
  // optionally, ssl: { rejectUnauthorized: 
false
 } depending 
on
 environment
});
router.post("/transfer", async (req, res) => {
  const {
    from_wallet_id,
    to_wallet_id,
    asset,
    network,
    amount,
    idempotency_key,
    metadata = {},
  } = req.body;
  
if
 (!from_wallet_id || !to_wallet_id || !asset || !network || !amount || !idempotency_key) {
    
return
 res.status(
400
).json({ error: "Missing required fields" });
  }
  const client = await pool.
connect
();
  try {
    await client.query("BEGIN");
    // 
Check
 idempotency
    const idempRes = await client.query(
      "SELECT id, result FROM public.ledger_idempotency WHERE idempotency_key = $1 FOR UPDATE",
      [idempotency_key]
    );
    
if
 (idempRes.rowCount > 
0
) {
      // Already processed
      const 
row
 = idempRes.
rows
[
0
];
      await client.query("COMMIT");
      
return
 res.status(
200
).json({ already_executed: 
true
, id: 
row
.id, result: 
row
.result });
    }
    // 
Lock
 balances
    const sourceBalRes = await client.query(
      "SELECT balance FROM public.balances WHERE wallet_id = $1 FOR UPDATE",
      [from_wallet_id]
    );
    
if
 (sourceBalRes.rowCount === 
0
) throw 
new
 Error("Source wallet balance not found");
    const sourceBalance = Number(sourceBalRes.
rows
[
0
].balance);
    const amt = Number(amount);
    
if
 (isNaN(amt) || amt <= 
0
) throw 
new
 Error("Invalid amount");
    
if
 (sourceBalance < amt) {
      await client.query("ROLLBACK");
      
return
 res.status(
400
).json({ error: "Insufficient funds" });
    }
    // 
Lock
 destination balance (could be 
insert
-
if
-
not
-exist)
    const destBalRes = await client.query(
      "SELECT balance FROM public.balances WHERE wallet_id = $1 FOR UPDATE",
      [to_wallet_id]
    );
    let destBalance = 
0
;
    
if
 (destBalRes.rowCount === 
0
) {
      // 
create
 initial balance 
row

      await client.query(
        "INSERT INTO public.balances (wallet_id, user_id, asset, network, balance, reserved, updated_at) VALUES ($1, $2, $3, $4, 0, 0, now())",
        [to_wallet_id, 
null
, asset, network]
      );
      destBalance = 
0
;
    } 
else
 {
      destBalance = Number(destBalRes.
rows
[
0
].balance);
    }
    // 
Insert
 ledger entries
    const debitId = randomUUID();
    const creditId = randomUUID();
    const now = 
new
 
Date
().toISOString();
    await client.query(
      `
INSERT
 
INTO
 
public
.ledger_entries (id, wallet_id, user_id, asset, network, amount, balance_after, 
type
, reference_id, idempotency_key, metadata, status, created_at) 
      
VALUES
 (
$1
,
$2
,
$3
,
$4
,
$5
,
$6
,
$7
,
$8
,
$9
,
$10
,
$11
,
$12
,
$13
)`,
      [
        debitId,
        from_wallet_id,
        
null
,
        asset,
        network,
        -Math.abs(amt),
        sourceBalance - amt,
        "transfer_debit",
        
null
,
        idempotency_key,
        
JSON
.stringify(metadata),
        "confirmed",
        now,
      ]
    );
    await client.query(
      `
INSERT
 
INTO
 
public
.ledger_entries (id, wallet_id, user_id, asset, network, amount, balance_after, 
type
, reference_id, idempotency_key, metadata, status, created_at) 
      
VALUES
 (
$1
,
$2
,
$3
,
$4
,
$5
,
$6
,
$7
,
$8
,
$9
,
$10
,
$11
,
$12
,
$13
)`,
      [
        creditId,
        to_wallet_id,
        
null
,
        asset,
        network,
        Math.abs(amt),
        destBalance + amt,
        "transfer_credit",
        
null
,
        idempotency_key,
        
JSON
.stringify(metadata),
        "confirmed",
        now,
      ]
    );
    // 
Update
 balances
    await client.query("UPDATE public.balances SET balance = balance - $1, updated_at = now() WHERE wallet_id = $2", [
      amt,
      from_wallet_id,
    ]);
    await client.query("UPDATE public.balances SET balance = balance + $1, updated_at = now() WHERE wallet_id = $2", [
      amt,
      to_wallet_id,
    ]);
    // 
Insert
 idempotency 
record
 
with
 result
    const resultPayload = { debitId, creditId };
    await client.query(
      "INSERT INTO public.ledger_idempotency (id, idempotency_key, payload, result, created_at) VALUES ($1, $2, $3, $4, now())",
      [randomUUID(), idempotency_key, 
JSON
.stringify({ from_wallet_id, to_wallet_id, amount: amt }), 
JSON
.stringify(resultPayload)]
    );
    // Optionally 
write
 
to
 ledger_audit
    await client.query(
      "INSERT INTO public.ledger_audit (id, ledger_entry_id, wallet_id, user_id, asset, network, amount, balance_after, type, reference_id, idempotency_key, metadata, status, created_at, audited_at) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, now(), now())",
      [
        randomUUID(),
        debitId,
        from_wallet_id,
        
null
,
        asset,
        network,
        -Math.abs(amt),
        sourceBalance - amt,
        "transfer_debit",
        
null
,
        idempotency_key,
        
JSON
.stringify(metadata),
        "confirmed",
      ]
    );
    await client.query("COMMIT");
    
return
 res.status(
200
).json({ success: 
true
, debitId, creditId });
  } catch (err) {
    await client.query("ROLLBACK").catch(() => {});
    console.error("transfer failed", err);
    
return
 res.status(
500
).json({ error: String(err) });
  } finally {
    client.
release
();
  }
});
export 
default
 router;

 
Important:

Use the pg implementation above for actual ledger operations in production. It uses explicit transactions and row locks.
Example: server/routes/kyc.ts (TypeScript, Express-style. import express from 
"npm:express@4.18.2"
;
import { createClient } from 
"npm:@supabase/supabase-js@2.34.0"
;
import { randomUUID } from 
"node:crypto"
;
const router = express.Router();
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: 
false
 },
});
// Assumes front-end uploads files with signed URLs or uses the Supabase Storage client.

// This route registers a KYC request and attaches provided document metadata.

router.post(
"/requests"
, async (req, res) => {
  
// Expect body: { user_id, metadata: {...}, documents: [ { bucket_id, path, file_name, mime_type } ] }

  const { user_id, metadata = {}, documents = [] } = req.body;
  if (!user_id) return res.status(
400
).json({ error: 
"Missing user_id"
 });
  try {
    
// Create kyc request

    const requestId = randomUUID();
    const now = new Date().toISOString();
    const { error: insertErr } = await supabase
      .from(
"kyc_requests"
)
      .insert([
        {
          id: requestId,
          user_id,
          status: 
"submitted"
,
          metadata,
          created_at: now,
          updated_at: now,
        },
      ])
      .select();
    if (insertErr) throw insertErr;
    
// Insert documents metadata (server-side records only; files already uploaded to storage)

    for (const doc of documents) {
      const docId = randomUUID();
      const { error: docErr } = await supabase.from(
"kyc_documents"
).insert([
        {
          id: docId,
          request_id: requestId,
          user_id,
          doc_type: doc.doc_type || 
null
,
          storage_path: doc.path,
          file_name: doc.file_name,
          mime_type: doc.mime_type || 
null
,
          size: doc.size || 
null
,
          uploaded_at: now,
          meta: doc.meta || {},
        },
      ]);
      if (docErr) throw docErr;
    }
    return res.status(
201
).json({ requestId });
  } catch (err) {
    console.error(
"kyc request error"
, err);
    return res.status(500).json({ error: String(err) });
  }
});
export default router;  Notes:

This route uses the Service Role key to write to kyc_requests and kyc_documents; you can instead allow clients to insert directly if RLS policy allows and if you prefer to avoid server write, but server-side insertion permits extra validations (virus scanning, metadata normalization).
Example: server/routes/admin.ts (TypeScript, Express-style).       import express from 
"npm:express@4.18.2"
;
import { createClient } from 
"npm:@supabase/supabase-js@2.34.0"
;
import { randomUUID } from 
"node:crypto"
;
const router = express.Router();
const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: 
false
 } });
// Admin route to review KYC

router.post(
"/kyc/review"
, async (req, res) => {
  
// Expect body: { admin_id, request_id, new_status, review_reason }

  const { admin_id, request_id, new_status, review_reason } = req.body;
  if (!admin_id || !request_id || !new_status) return res.status(
400
).json({ error: 
"Missing fields"
 });
  try {
    
// Fetch existing request and profile

    const { data: reqData, error: reqErr } = await supabase.from(
"kyc_requests"
).select(
"*"
).eq(
"id"
, request_id).single();
    if (reqErr) throw reqErr;
    const userId = reqData.user_id;
    
// Update kyc_requests status

    const { error: updErr } = await supabase.from(
"kyc_requests"
).update({ status: new_status, reviewed_at: new Date().toISOString(), review_reason }).eq(
"id"
, request_id);
    if (updErr) throw updErr;
    
// Update profile kyc_status

    const { error: profileErr } = await supabase.from(
"profiles"
).update({ kyc_status: new_status }).eq(
"id"
, userId);
    if (profileErr) throw profileErr;
    
// Create admin action audit

    const actionId = randomUUID();
    const { error: actionErr } = await supabase.from(
"admin_actions"
).insert([
      {
        id: actionId,
        admin_id,
        action_type: 
"kyc_review"
,
        target_user_id: userId,
        old_value: reqData,
        new_value: { status: new_status, review_reason },
        ip_address: req.ip || 
null
,
        created_at: new Date().toISOString(),
      },
    ]);
    if (actionErr) throw actionErr;
    return res.status(
200
).json({ success: 
true
, actionId });
  } catch (err) {
    console.error(
"admin kyc review error"
, err);
    return res.status(500).json({ error: String(err) });
  }
});
export default router;               Security:

Protect admin routes with strict authentication and authorization (verify admin role). The examples above accept admin_id in the body for simplicity; replace this with actual session verification and server-side admin checks.
Final notes & recommendations

For ledger-critical flows, use a direct Postgres client and explicit transactions (pg pool example above). Avoid attempting multi-statement transactions via the Supabase REST or RPC endpoints.
Add extensive automated tests for concurrency, RLS policy enforcement, and idempotency.
Ensure the frontend never exposes the service_role key.                   
