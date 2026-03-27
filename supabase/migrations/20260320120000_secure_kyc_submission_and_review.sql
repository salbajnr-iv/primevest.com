BEGIN;

CREATE OR REPLACE FUNCTION public.submit_kyc_request(
  p_metadata jsonb DEFAULT '{}'::jsonb,
  p_documents jsonb DEFAULT '[]'::jsonb
)
RETURNS public.kyc_requests
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, storage
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_now timestamptz := now();
  v_request public.kyc_requests;
  v_bucket_public boolean;
  v_document jsonb;
  v_storage_path text;
  v_bucket_id text;
  v_doc_type text;
  v_file_name text;
  v_mime_type text;
  v_size bigint;
  v_meta jsonb;
  v_exists boolean;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF jsonb_typeof(COALESCE(p_metadata, '{}'::jsonb)) <> 'object' THEN
    RAISE EXCEPTION 'metadata must be a JSON object';
  END IF;

  IF jsonb_typeof(COALESCE(p_documents, '[]'::jsonb)) <> 'array' OR jsonb_array_length(COALESCE(p_documents, '[]'::jsonb)) = 0 THEN
    RAISE EXCEPTION 'documents must be a non-empty array';
  END IF;

  SELECT b.public INTO v_bucket_public
  FROM storage.buckets b
  WHERE b.id = 'kyc-documents';

  IF v_bucket_public IS DISTINCT FROM false THEN
    RAISE EXCEPTION 'kyc-documents bucket must be private';
  END IF;

  INSERT INTO public.kyc_requests (user_id, status, metadata, submitted_at, created_at, updated_at)
  VALUES (v_user_id, 'submitted', COALESCE(p_metadata, '{}'::jsonb), v_now, v_now, v_now)
  RETURNING * INTO v_request;

  FOR v_document IN SELECT value FROM jsonb_array_elements(p_documents)
  LOOP
    IF jsonb_typeof(v_document) <> 'object' THEN
      RAISE EXCEPTION 'Each document must be an object';
    END IF;

    v_storage_path := nullif(trim(v_document->>'storage_path'), '');
    v_bucket_id := COALESCE(nullif(trim(v_document->>'bucket'), ''), 'kyc-documents');
    v_doc_type := nullif(trim(v_document->>'doc_type'), '');
    v_file_name := nullif(trim(v_document->>'file_name'), '');
    v_mime_type := nullif(trim(v_document->>'mime_type'), '');
    v_size := CASE WHEN nullif(v_document->>'size', '') IS NULL THEN NULL ELSE (v_document->>'size')::bigint END;
    v_meta := COALESCE(v_document->'meta', '{}'::jsonb);

    IF v_bucket_id <> 'kyc-documents' THEN
      RAISE EXCEPTION 'Only the private kyc-documents bucket is allowed';
    END IF;

    IF v_storage_path IS NULL OR v_doc_type IS NULL OR v_file_name IS NULL THEN
      RAISE EXCEPTION 'Document is missing required fields';
    END IF;

    IF split_part(v_storage_path, '/', 1) <> v_user_id::text THEN
      RAISE EXCEPTION 'Document path does not belong to the authenticated user';
    END IF;

    IF split_part(v_storage_path, '/', 2) <> v_doc_type THEN
      RAISE EXCEPTION 'Document path category must match doc_type';
    END IF;

    IF jsonb_typeof(v_meta) <> 'object' THEN
      RAISE EXCEPTION 'Document meta must be a JSON object';
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM storage.objects o
      WHERE o.bucket_id = v_bucket_id
        AND o.name = v_storage_path
        AND split_part(o.name, '/', 1) = v_user_id::text
        AND o.owner_id = v_user_id::text
    ) INTO v_exists;

    IF NOT v_exists THEN
      RAISE EXCEPTION 'Referenced document was not found in the private bucket';
    END IF;

    INSERT INTO public.kyc_documents (
      request_id,
      user_id,
      doc_type,
      storage_path,
      file_name,
      mime_type,
      size,
      meta,
      uploaded_at,
      updated_at
    ) VALUES (
      v_request.id,
      v_user_id,
      v_doc_type,
      v_storage_path,
      v_file_name,
      v_mime_type,
      v_size,
      v_meta,
      v_now,
      v_now
    );
  END LOOP;

  UPDATE public.profiles
  SET kyc_status = 'submitted',
      kyc_requested_at = v_now,
      kyc_reviewed_at = NULL,
      kyc_rejection_reason = NULL,
      updated_at = v_now
  WHERE id = v_user_id;

  RETURN v_request;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_kyc_request(jsonb, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_kyc_request(jsonb, jsonb) TO authenticated;

CREATE OR REPLACE FUNCTION public.apply_kyc_review_decision(
  p_request_id uuid,
  p_decision public.kyc_status,
  p_admin_id uuid,
  p_reason text DEFAULT NULL,
  p_action_type text DEFAULT 'kyc_decision',
  p_context jsonb DEFAULT '{}'::jsonb,
  p_ip_address inet DEFAULT NULL
)
RETURNS TABLE (
  request_id uuid,
  request_status public.kyc_status,
  profile_status public.kyc_status,
  user_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_request public.kyc_requests;
  v_profile public.profiles;
  v_now timestamptz := now();
  v_context jsonb := COALESCE(p_context, '{}'::jsonb);
BEGIN
  IF p_request_id IS NULL OR p_admin_id IS NULL THEN
    RAISE EXCEPTION 'request_id and admin_id are required';
  END IF;

  IF p_decision NOT IN ('verified', 'rejected', 'under_review') THEN
    RAISE EXCEPTION 'Unsupported KYC decision';
  END IF;

  IF jsonb_typeof(v_context) <> 'object' THEN
    RAISE EXCEPTION 'review context must be a JSON object';
  END IF;

  SELECT * INTO v_request
  FROM public.kyc_requests
  WHERE id = p_request_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'KYC request not found';
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = v_request.user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF v_request.status IN ('verified', 'rejected') THEN
    RETURN QUERY SELECT v_request.id, v_request.status, v_profile.kyc_status, v_request.user_id;
    RETURN;
  END IF;

  UPDATE public.kyc_requests
  SET status = p_decision,
      reviewed_at = v_now,
      reviewed_by = p_admin_id,
      review_reason = p_reason,
      updated_at = v_now
  WHERE id = v_request.id;

  UPDATE public.profiles
  SET kyc_status = p_decision,
      kyc_reviewed_at = v_now,
      kyc_rejection_reason = CASE WHEN p_decision = 'rejected' THEN p_reason ELSE NULL END,
      updated_at = v_now
  WHERE id = v_request.user_id;

  INSERT INTO public.admin_actions (
    admin_id,
    action_type,
    target_user_id,
    target_table,
    old_value,
    new_value,
    ip_address,
    created_at
  ) VALUES (
    p_admin_id,
    p_action_type,
    v_request.user_id,
    'kyc_requests',
    jsonb_build_object(
      'request', jsonb_build_object(
        'id', v_request.id,
        'status', v_request.status,
        'reviewed_at', v_request.reviewed_at,
        'reviewed_by', v_request.reviewed_by,
        'review_reason', v_request.review_reason
      ),
      'profile', jsonb_build_object(
        'id', v_profile.id,
        'kyc_status', v_profile.kyc_status,
        'kyc_reviewed_at', v_profile.kyc_reviewed_at,
        'kyc_rejection_reason', v_profile.kyc_rejection_reason
      )
    ),
    jsonb_build_object(
      'request', jsonb_build_object(
        'id', v_request.id,
        'status', p_decision,
        'reviewed_at', v_now,
        'reviewed_by', p_admin_id,
        'review_reason', p_reason
      ),
      'profile', jsonb_build_object(
        'id', v_profile.id,
        'kyc_status', p_decision,
        'kyc_reviewed_at', v_now,
        'kyc_rejection_reason', CASE WHEN p_decision = 'rejected' THEN p_reason ELSE NULL END
      ),
      'context', v_context
    ),
    p_ip_address,
    v_now
  );

  RETURN QUERY SELECT v_request.id, p_decision, p_decision, v_request.user_id;
END;
$$;

REVOKE ALL ON FUNCTION public.apply_kyc_review_decision(uuid, public.kyc_status, uuid, text, text, jsonb, inet) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_kyc_review_decision(uuid, public.kyc_status, uuid, text, text, jsonb, inet) TO authenticated, service_role;

COMMIT;
