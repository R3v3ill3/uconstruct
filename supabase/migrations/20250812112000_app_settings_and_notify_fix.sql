-- App settings key-value store
CREATE TABLE IF NOT EXISTS public.app_settings (
  key text PRIMARY KEY,
  value text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' AND tablename = 'app_settings' AND policyname = 'as_modify'
  ) THEN
    CREATE POLICY "as_modify"
      ON public.app_settings
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END $$;

-- Helper to read a setting
CREATE OR REPLACE FUNCTION public.get_app_setting(_key text)
RETURNS text
LANGUAGE sql
STABLE
AS $$
  SELECT value FROM public.app_settings WHERE key = _key;
$$;

-- Replace notify function to use app_settings instead of GUCs
CREATE OR REPLACE FUNCTION public.notify_admins_on_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_url text;
  v_secret text;
BEGIN
  IF NEW.status IS DISTINCT FROM 'requested' THEN
    RETURN NEW;
  END IF;

  v_url := public.get_app_setting('notify_admins_url');
  v_secret := public.get_app_setting('edge_function_secret');

  IF v_url IS NULL OR v_url = '' THEN
    RETURN NEW;
  END IF;

  PERFORM net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json'
    ) || CASE WHEN v_secret IS NULL OR v_secret = '' THEN '{}'::jsonb ELSE jsonb_build_object('Authorization','Bearer '||v_secret) END,
    body := jsonb_build_object(
      'type', 'pending_user.requested',
      'id', NEW.id,
      'email', NEW.email,
      'full_name', NEW.full_name,
      'role', NEW.role,
      'notes', NEW.notes,
      'requested_at', NEW.updated_at
    )
  );

  RETURN NEW;
END;
$$;