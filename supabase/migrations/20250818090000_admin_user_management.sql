-- Admin user management RPCs (roles and scoping)

-- 1) List profiles (admin-only)
CREATE OR REPLACE FUNCTION public.admin_list_profiles(
  _search text DEFAULT NULL,
  _limit integer DEFAULT 100,
  _offset integer DEFAULT 0
)
RETURNS TABLE (
  id uuid,
  email text,
  full_name text,
  role public.app_role,
  is_active boolean,
  scoped_sites uuid[],
  scoped_employers uuid[],
  last_login_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.email, p.full_name, p.role::public.app_role, p.is_active, p.scoped_sites, p.scoped_employers, p.last_login_at
  FROM public.profiles p
  WHERE public.is_admin()
    AND (
      _search IS NULL
      OR p.email ILIKE ('%' || _search || '%')
      OR p.full_name ILIKE ('%' || _search || '%')
    )
  ORDER BY COALESCE(p.full_name, p.email) NULLS LAST
  LIMIT GREATEST(_limit, 0)
  OFFSET GREATEST(_offset, 0);
$$;

-- 2) Update a user's role (admin-only)
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  _user_id uuid,
  _role public.app_role,
  _is_active boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  UPDATE public.profiles
  SET role = _role::text,
      is_active = COALESCE(_is_active, is_active),
      updated_at = now()
  WHERE id = _user_id;
END;
$$;

