BEGIN;

CREATE OR REPLACE FUNCTION public.set_user_active_status(
  p_user_id uuid,
  p_is_active boolean,
  p_admin_id uuid,
  p_ip_address inet DEFAULT NULL,
  p_context jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  user_id uuid,
  is_active boolean,
  previous_is_active boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_profile public.profiles;
  v_now timestamptz := now();
  v_context jsonb := COALESCE(p_context, '{}'::jsonb);
BEGIN
  IF p_user_id IS NULL OR p_admin_id IS NULL THEN
    RAISE EXCEPTION 'user_id and admin_id are required';
  END IF;

  IF jsonb_typeof(v_context) <> 'object' THEN
    RAISE EXCEPTION 'context must be a JSON object';
  END IF;

  SELECT * INTO v_profile
  FROM public.profiles
  WHERE id = p_user_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile not found';
  END IF;

  IF v_profile.is_active IS NOT DISTINCT FROM p_is_active THEN
    RETURN QUERY
    SELECT v_profile.id, v_profile.is_active, v_profile.is_active;
    RETURN;
  END IF;

  UPDATE public.profiles
  SET is_active = p_is_active,
      updated_at = v_now
  WHERE id = p_user_id;

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
    'user_status_toggle',
    p_user_id,
    'profiles',
    jsonb_build_object(
      'id', v_profile.id,
      'is_active', v_profile.is_active
    ),
    jsonb_build_object(
      'id', v_profile.id,
      'is_active', p_is_active,
      'context', v_context
    ),
    p_ip_address,
    v_now
  );

  RETURN QUERY
  SELECT v_profile.id, p_is_active, v_profile.is_active;
END;
$$;

REVOKE ALL ON FUNCTION public.set_user_active_status(uuid, boolean, uuid, inet, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_user_active_status(uuid, boolean, uuid, inet, jsonb) TO authenticated, service_role;

COMMIT;
