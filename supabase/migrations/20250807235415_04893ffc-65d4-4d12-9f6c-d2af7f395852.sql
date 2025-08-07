-- 1) Create pending_users table for staging users before invitation
CREATE TABLE IF NOT EXISTS public.pending_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  full_name text,
  role text NOT NULL DEFAULT 'viewer',
  scoped_employers uuid[] DEFAULT '{}'::uuid[],
  scoped_sites uuid[] DEFAULT '{}'::uuid[],
  notes text,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','invited','archived')),
  invited_at timestamptz,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure unique email (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS pending_users_lower_email_unique ON public.pending_users (lower(email));

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_pending_users_status ON public.pending_users(status);
CREATE INDEX IF NOT EXISTS idx_pending_users_created_by ON public.pending_users(created_by);

-- 2) Enable RLS and policies: only admins can manage/read
ALTER TABLE public.pending_users ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pending_users' AND policyname = 'pu_modify'
  ) THEN
    CREATE POLICY "pu_modify"
      ON public.pending_users
      FOR ALL
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'pending_users' AND policyname = 'pu_select'
  ) THEN
    CREATE POLICY "pu_select"
      ON public.pending_users
      FOR SELECT
      USING (is_admin());
  END IF;
END $$;

-- 3) Trigger to keep updated_at fresh
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_pending_users_updated_at'
  ) THEN
    CREATE TRIGGER trg_pending_users_updated_at
      BEFORE UPDATE ON public.pending_users
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 4) Admin helper to update profile scoping (bypasses RLS safely)
CREATE OR REPLACE FUNCTION public.admin_update_user_scoping(
  _user_id uuid,
  _scoped_employers uuid[],
  _scoped_sites uuid[]
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET scoped_employers = COALESCE(_scoped_employers, '{}')::uuid[],
      scoped_sites = COALESCE(_scoped_sites, '{}')::uuid[],
      updated_at = now()
  WHERE id = _user_id;
END;
$$;

-- 5) Minor improvement to sync_auth_users message (idempotent) - keep as-is otherwise
-- No change needed; function already inserts missing profiles.
