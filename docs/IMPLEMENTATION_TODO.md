Database Integration Guide
This guide summarizes the current database schema, important recent changes, and concrete instructions for backend and frontend developers to reliably connect the app to the database, perform common operations, and respect security (RLS, auth) and data integrity. Use this as the single source of truth when implementing features that touch authentication, storage, KYC, wallets/ledger, and admin tooling.

Notes

Project ref: xhyivvvbrcmbjvzmvlod
Primary schemas of interest: auth, public, storage
Relevant extensions installed: pgcrypto, pg_stat_statements, pgjwt, vector, uuid-ossp, pg_trgm, postgis, and others (see db for full list). These enable crypto, UUID generation, JWT helpers, vector types, and full-text capabilities.
High-level domain model (what matters to apps)
Authentication: auth.users, auth.sessions, auth.refresh_tokens, auth.identities
User profile and admin: public.profiles, public.admin_users, public.admin_actions
KYC: public.kyc_requests, public.kyc_documents
Wallets & ledger: public.wallets, public.balances, public.ledger_entries, public.ledger_audit, public.ledger_idempotency, public.user_asset_aggregates
Storage: storage.buckets, storage.objects (and vector/analytics variants)
Misc: public.market_prices for asset pricing aggregates
Authentication & Authorization
Use Supabase Auth for sign-in and session management. The authoritative user id is auth.uid() (UUID) and matches auth.users.id and public.profiles.id.
JWT claims:
Backend services using the service_role key bypass RLS — protect it carefully.
Client apps should use the anon key and user session; ensure operations run under the user's JWT so RLS policies apply.
RLS is enabled on most public tables (e.g., public.profiles, storage.objects). Do not expect global access — implement operations per-policy.
Backend tasks that require full access must use the Service Role key and run server-side only.
Profiles & User data
Canonical profile table: public.profiles (PK = id, uuid). Always join by exact UUID.
Fields to rely on: full_name, avatar_url, email (unique), is_admin, is_active, kyc_status.
When creating/updating: ensure your payload sets id equal to the authenticated user's auth.uid() on insert.
Client: create profile immediately after sign-up to keep auth & profile consistent.
Backend: use auth.uid() or the JWT claim to perform server-side checks. When using service role, double-check inputs.
KYC flow (frontend + backend)
Create request:
Frontend: POST to backend or directly insert (if authorized) into public.kyc_requests with user_id = auth.uid() and metadata containing form fields.
Upload documents to storage (see Storage below); save storage_path in public.kyc_documents.
Admin review:
Admins use public.admin_users & public.admin_actions to change KYC. Update public.profiles.kyc_status with the new enum values: none, pending, submitted, under_review, verified, rejected.
Always add an admin_actions record for audit with old_value and new_value (JSON).
RLS & permissions:
Normal users can only INSERT their own kyc_requests/documents (use auth.uid()).
Admins (is_admin or via custom claim) can update statuses and write audit logs.
Storage (buckets & objects)
Buckets: storage.buckets (id, public flag, owner_id).
Objects: storage.objects with bucket_id, name (full path), owner_id, metadata, and path_tokens (generated array for folder segments).
Upload patterns:
Frontend: Prefer signed uploads via Supabase Storage client (the client will use user JWT and storage policies).
For server-side processing (virus scanning, thumbnails), fetch the file using storage.objects metadata and the service role key if you need to bypass RLS.
Access control:
Use bucket-level public flag only when intended; private buckets require authenticated access and correct storage RLS policies.
When storing KYC docs, use a private bucket with user_id in metadata or owner_id to tie to the profile.
Ensure path_tokens is used to implement folder-level RLS when required.
Wallets, Balances, and Ledger (financial integrity)
Canonical wallet: public.wallets (id = uuid). Balances are in public.balances keyed by wallet_id. Ledger entries recorded in public.ledger_entries.
Idempotency:
Use public.ledger_idempotency for idempotent write operations (idempotency_key unique).
Backend should check/create idempotency records to prevent duplicate ledger writes.
Recommended write sequence (atomic, server-side only):
Begin transaction
Lock/SELECT the relevant balances row FOR UPDATE
Compute new balance, insert ledger_entries with idempotency_key and metadata
Update balances with new balance and timestamp
Optionally insert into ledger_audit
Commit
Never allow clients direct write access to ledger tables; always perform via backend using service role to ensure atomicity and business rules.
Use user_asset_aggregates to quickly present user-wide totals; refresh this after ledger operations.
Admin actions, audits & balance history
Admins should always write to public.admin_actions and public.balance_history when performing manual adjustments.
For auditability:
Save old_value and new_value as JSON in admin_actions.
Include ip_address and admin_id.
Respect constraints: balance_history.action_type accepts only add|subtract|set|reset. currency limited to USD/EUR.
Market prices
public.market_prices contains asset price snapshots per currency; used by frontends to compute fiat equivalents.
If your backend updates prices, write via a scheduled job (cron/pg_cron) or external service; restrict write access to server processes.
Common API endpoints & recommended contracts
Auth:
GET /me -> returns minimal profile merged from auth.users and public.profiles
POST /signup -> create auth user via Supabase Auth; then create public.profiles with same id
Profiles:
GET /profiles/:id -> returns profile (RLS ensures user only sees allowed data)
PATCH /profiles/:id -> update allowed fields (frontend should only send allowed fields)
KYC:
POST /kyc/requests -> create request + document uploads
GET /kyc/requests -> returns only the authenticated user's requests (admins may request all)
POST /kyc/review -> admin-only endpoint to change status (writes admin_actions)
Wallets & ledger:
GET /wallets -> returns wallets for user_id = auth.uid()
POST /wallets -> create wallet for authenticated user
POST /ledger/transfer -> server-side only, accepts {walletIdFrom, walletIdTo, asset, amount, idempotencyKey, metadata}; returns ledger entry id
GET /balances -> returns aggregated balances from public.user_asset_aggregates
Storage:
POST /upload-url -> return signed upload URL (server may return a storage client policy or use Supabase signed URLs)
GET /files/:bucket/:path -> redirect or proxy depending on permissions
RLS & security rules (developer responsibilities)
Frontend: use only anon key and user session. Do not embed service role key.
Backend: keep service role key secret. All sensitive operations (ledger, admin actions) should be performed server-side.
Typical RLS patterns in this DB:
Table rows are scoped to user_id = auth.uid() or owner_id = (SELECT auth.uid()::text) for storage.objects.
Admin-only updates require either a custom is_admin claim in the JWT or server-side checks using the service key.
Validate all client input server-side to avoid privilege escalation.
Concurrency & performance
For money operations: use row-level locking (SELECT ... FOR UPDATE) inside transactions to avoid race conditions.
Indexing: ensure columns used in RLS policies are indexed (e.g., user_id, wallet_id, tenant_id if multi-tenant).
Use ledger_idempotency table to avoid duplicate processing. Index idempotency_key.
Background jobs, scheduled tasks, and triggers
Use pg_cron for DB-side scheduled tasks (extensions are present). Examples:
Recompute user aggregates nightly (or use incremental updates after writes).
Purge old ephemeral data.
Use trigger-based broadcasting for realtime events using realtime.broadcast_changes if realtime clients need updates (follow Realtime guide for topics and events).
For long-running tasks (file processing, heavy calculations), spawn server-side jobs and store status in DB.
Vector & analytics buckets
The storage.buckets_vectors and storage.vector_indexes tables indicate vector indexing support. Use vectors for semantic search or embeddings.
Vector operations typically require additional security considerations (who can add/query indexes).
If using Supabase.ai or custom embedding pipelines, store embeddings in a dedicated vector-indexed table and protect with RLS.
Error handling, logging & monitoring
Log all critical events: ledger changes, idempotency rejections, admin actions, KYC reviews.
Use pg_stat_statements and pg_stat_monitor to profile slow queries; optimize the those queries and add indexes where needed.
On SQL errors, return safe generic messages to clients and log full details server-side.
Developer checklist before deployment
Confirm all RLS policies enforce intended access (test as regular user and as admin).
Confirm service role key is only used server-side.
Ensure all wallet/ledger functionality is behind transactions and idempotency checks.
Validate storage buckets: private for PII; public only when needed.
Review indexes for columns used heavily in WHERE or RLS expressions (user_id, wallet_id, topic name).
Add tests for edge cases: concurrent ledger writes, expired sessions, invalid idempotency keys, KYC uploads without metadata.
Example SQL snippets (for backend maintainers)
Create a profile for a new user (server-side):
INSERT INTO public.profiles (id, full_name, email) VALUES (:id, :full_name, :email);
Ledger atomic transfer pattern (pseudocode):
BEGIN;
SELECT balance FROM public.balances WHERE wallet_id = :w FOR UPDATE;
INSERT INTO public.ledger_idempotency (...) -- fail if idempotency exists
INSERT INTO public.ledger_entries (...) RETURNING id;
UPDATE public.balances SET balance = :new_balance WHERE wallet_id = :w;
INSERT INTO public.ledger_audit(...);
COMMIT;
Storage object link (read-only query for a user):
SELECT * FROM storage.objects WHERE bucket_id = :bucket AND name = :name AND owner_id = auth.uid()::text;*
Testing matrix (must be covered)
Auth flows: sign-up, sign-in, refresh token, session expiry.
RLS: try accessing another user's profile/data from client to ensure denial.
KYC: upload + attach document + admin review + profile status change.
Wallets: concurrent transfers from same wallet (race detection), idempotency.
Storage: access private bucket files with and without session.
Admin: create admin action and ensure audit trail is present.
Operational notes & runbooks
If data corruption or accidental admin change occurs, use ledger_audit and admin_actions for restoring state and forensic analysis.
Use backups and table-level snapshots for critical tables (wallets, ledger_entries).
For performance incidents, check pg_stat_statements and pg_stat_monitor for heavy queries, and consider adding or tuning indexes.
Next steps / action items for teams
Backend:
Implement server endpoints for ledger operations with transactions and idempotency.
Review and implement RLS bypass only through service role on trusted server routes.
Create scheduled jobs for aggregates and reconciliations.
Frontend:
Use Supabase client libraries to authenticate and interact with storage and data tables.
Implement optimistic UI updates only where safe (e.g., profile edits). For ledger-related UX, rely on server-confirmed responses.
Ensure KYC upload UX guides users to private uploads and provides progress & error handling.
Security:
Rotate service role key if it has been exposed.
Ensure admin access is limited and audited.
Appendix: Useful queries and endpoints
Get current user profile (server or client with JWT):
SELECT p.* FROM public.profiles p WHERE p.id = auth.uid();
List user wallets:
SELECT * FROM public.wallets WHERE user_id = auth.uid();
Fetch objects in a user's folder (storage):
SELECT * FROM storage.objects WHERE bucket_id = :bucket AND (path_tokens)[1] = auth.uid()::text;*
