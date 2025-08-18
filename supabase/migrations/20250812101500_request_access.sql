-- Request access: allow authenticated users to create/refresh a pending_users entry for themselves
CREATE OR REPLACE FUNCTION public.request_access(
  _requested_role public.app_role DEFAULT 'viewer',
  _notes text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_uid uuid;
  v_email text;
  v_full_name text;
  v_existing_status text;
  v_current_role public.app_role;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Get current profile data
  SELECT email, COALESCE(full_name, email), role INTO v_email, v_full_name, v_current_role
  FROM public.profiles
  WHERE id = v_uid;

  IF v_email IS NULL THEN
    -- Ensure profile exists
    INSERT INTO public.profiles (id, email, full_name)
    SELECT au.id, au.email, COALESCE(au.raw_user_meta_data->>'full_name', au.email)
    FROM auth.users au
    WHERE au.id = v_uid
    ON CONFLICT (id) DO NOTHING;

    SELECT email, COALESCE(full_name, email), role INTO v_email, v_full_name, v_current_role
    FROM public.profiles
    WHERE id = v_uid;
  END IF;

  -- Only create request if user is not already privileged
  IF v_current_role IN ('admin','lead_organiser','organiser','delegate') THEN
    RETURN; -- nothing to do
  END IF;

  -- Check if a pending row already exists
  SELECT status INTO v_existing_status
  FROM public.pending_users
  WHERE lower(email) = lower(v_email)
  ORDER BY created_at DESC
  LIMIT 1;

  -- Upsert a new request or refresh existing to requested
  INSERT INTO public.pending_users (email, full_name, role, status, notes)
  VALUES (v_email, v_full_name, _requested_role::public.app_role, 'requested', _notes)
  ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    status = 'requested',
    notes = COALESCE(EXCLUDED.notes, public.pending_users.notes),
    updated_at = now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.request_access(public.app_role, text) TO authenticated;