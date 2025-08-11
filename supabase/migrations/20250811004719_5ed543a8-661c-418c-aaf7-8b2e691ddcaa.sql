-- 1) Prevent privilege escalation on profiles via BEFORE UPDATE trigger
CREATE OR REPLACE FUNCTION public.prevent_profile_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Apply checks only when the user updates their own profile and is not admin
  IF auth.uid() = NEW.id AND NOT public.is_admin() THEN
    IF NEW.role IS DISTINCT FROM OLD.role THEN
      RAISE EXCEPTION 'Not allowed to change role';
    END IF;
    IF NEW.is_active IS DISTINCT FROM OLD.is_active THEN
      RAISE EXCEPTION 'Not allowed to change is_active';
    END IF;
    IF NEW.scoped_sites IS DISTINCT FROM OLD.scoped_sites THEN
      RAISE EXCEPTION 'Not allowed to change scoped_sites';
    END IF;
    IF NEW.scoped_employers IS DISTINCT FROM OLD.scoped_employers THEN
      RAISE EXCEPTION 'Not allowed to change scoped_employers';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_profile_privilege_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_profile_privilege_escalation
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.prevent_profile_privilege_escalation();

-- 2) Harden SECURITY DEFINER functions with admin guard and proper search_path
CREATE OR REPLACE FUNCTION public.admin_update_user_scoping(
  _user_id uuid,
  _scoped_employers uuid[],
  _scoped_sites uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  UPDATE public.profiles
  SET scoped_employers = COALESCE(_scoped_employers, '{}')::uuid[],
      scoped_sites = COALESCE(_scoped_sites, '{}')::uuid[],
      updated_at = now()
  WHERE id = _user_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.sync_auth_users()
RETURNS TABLE(synced_count integer, message text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  sync_count integer := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  -- Insert profiles for auth users that don't have them
  WITH missing_profiles AS (
    INSERT INTO public.profiles (id, email, full_name)
    SELECT 
      au.id,
      au.email,
      COALESCE(au.raw_user_meta_data->>'full_name', au.email)
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO sync_count FROM missing_profiles;
  
  RETURN QUERY SELECT sync_count, 
    CASE 
      WHEN sync_count > 0 THEN format('Synced %s users successfully', sync_count)
      ELSE 'All users already synced'
    END;
END;
$function$;

-- 3) Tighten SELECT policies on sensitive tables
-- workers
DROP POLICY IF EXISTS "Authenticated users can view workers" ON public.workers;
CREATE POLICY "Admins and organisers can view workers"
ON public.workers
FOR SELECT
USING (public.get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']));

-- worker_placements
DROP POLICY IF EXISTS "Authenticated users can view worker placements" ON public.worker_placements;
CREATE POLICY "Admins and organisers can view worker placements"
ON public.worker_placements
FOR SELECT
USING (public.get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']));

-- union_roles
DROP POLICY IF EXISTS "Authenticated users can view union roles" ON public.union_roles;
CREATE POLICY "Admins and organisers can view union roles"
ON public.union_roles
FOR SELECT
USING (public.get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']));

-- site_contacts
DROP POLICY IF EXISTS "Authenticated users can view site contacts" ON public.site_contacts;
CREATE POLICY "Admins and organisers can view site contacts"
ON public.site_contacts
FOR SELECT
USING (public.get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']));

-- training_participation
DROP POLICY IF EXISTS "Authenticated users can view training participation" ON public.training_participation;
CREATE POLICY "Admins and organisers can view training participation"
ON public.training_participation
FOR SELECT
USING (public.get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']));

-- 4) Default-deny site access for non-privileged roles
CREATE OR REPLACE FUNCTION public.has_site_access(user_id uuid, site_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT 
        CASE 
            WHEN public.get_user_role(user_id) = 'admin' THEN true
            WHEN public.get_user_role(user_id) = 'organiser' THEN 
                site_id = ANY(SELECT unnest(scoped_sites) FROM public.profiles WHERE id = user_id)
                OR array_length((SELECT scoped_sites FROM public.profiles WHERE id = user_id), 1) IS NULL
            ELSE false
        END;
$function$;