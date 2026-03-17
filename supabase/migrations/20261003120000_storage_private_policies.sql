-- Storage security hardening for private user documents
-- 1) Enumerate buckets and normalize privacy flags.
-- 2) Enforce object key convention: <user_id>/<category>/<filename>.
-- 3) Restrict storage.objects read/write access to owner (or admins for reads).
-- 4) Use signed URL access for private files.

BEGIN;

-- Bucket inventory + privacy posture
INSERT INTO storage.buckets (id, name, public)
VALUES
  ('avatars', 'avatars', false),
  ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  public = EXCLUDED.public;

-- Ensure both user-document buckets are private.
UPDATE storage.buckets
SET public = false
WHERE id IN ('avatars', 'kyc-documents');

-- Remove legacy policies if they exist.
DROP POLICY IF EXISTS "Private user docs read owner or admin" ON storage.objects;
DROP POLICY IF EXISTS "Private user docs insert owner path" ON storage.objects;
DROP POLICY IF EXISTS "Private user docs update owner path" ON storage.objects;
DROP POLICY IF EXISTS "Private user docs delete owner path" ON storage.objects;

-- Read: only file owner or admin can read private user docs.
CREATE POLICY "Private user docs read owner or admin"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id IN ('avatars', 'kyc-documents')
  AND split_part(name, '/', 1) = auth.uid()::text
  OR (
    bucket_id IN ('avatars', 'kyc-documents')
    AND EXISTS (
      SELECT 1
      FROM public.profiles p
      WHERE p.id = auth.uid() AND p.is_admin = true
    )
  )
);

-- Insert: enforce owner + path format <user_id>/<category>/<filename>
CREATE POLICY "Private user docs insert owner path"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id IN ('avatars', 'kyc-documents')
  AND split_part(name, '/', 1) = auth.uid()::text
  AND split_part(name, '/', 2) <> ''
  AND split_part(name, '/', 3) <> ''
  AND (
    bucket_id <> 'avatars'
    OR split_part(name, '/', 2) = 'profile'
  )
);

-- Update: owner only, with same path restrictions.
CREATE POLICY "Private user docs update owner path"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id IN ('avatars', 'kyc-documents')
  AND split_part(name, '/', 1) = auth.uid()::text
)
WITH CHECK (
  bucket_id IN ('avatars', 'kyc-documents')
  AND split_part(name, '/', 1) = auth.uid()::text
  AND split_part(name, '/', 2) <> ''
  AND split_part(name, '/', 3) <> ''
  AND (
    bucket_id <> 'avatars'
    OR split_part(name, '/', 2) = 'profile'
  )
);

-- Delete: owner only.
CREATE POLICY "Private user docs delete owner path"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id IN ('avatars', 'kyc-documents')
  AND split_part(name, '/', 1) = auth.uid()::text
);

-- Optional schema support for storing private avatar object keys.
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS avatar_storage_path text;

COMMIT;

-- Verification queries (run manually after migration)
-- 1) Bucket inventory
-- SELECT id, public FROM storage.buckets ORDER BY id;
--
-- 2) Policy inventory
-- SELECT policyname, cmd, roles
-- FROM pg_policies
-- WHERE schemaname = 'storage' AND tablename = 'objects'
--   AND policyname ILIKE 'Private user docs%'
-- ORDER BY policyname;
--
-- 3) Object key convention spot-check
-- SELECT bucket_id, name
-- FROM storage.objects
-- WHERE bucket_id IN ('avatars', 'kyc-documents')
--   AND (
--     split_part(name, '/', 1) = ''
--     OR split_part(name, '/', 2) = ''
--     OR split_part(name, '/', 3) = ''
--   )
-- LIMIT 50;
