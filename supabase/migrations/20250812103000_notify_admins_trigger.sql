-- Enable pg_net for HTTP callbacks
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to notify Edge Function when a request is created/updated to 'requested'
CREATE OR REPLACE FUNCTION public.notify_admins_on_request()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_url text;
  v_secret text;
  v_resp jsonb;
BEGIN
  -- Only fire for 'requested'
  IF NEW.status IS DISTINCT FROM 'requested' THEN
    RETURN NEW;
  END IF;

  -- Read config from DB GUCs (set these in Supabase SQL editor)
  v_url := current_setting('app.notify_admins_url', true);
  v_secret := current_setting('app.edge_function_secret', true);

  IF v_url IS NULL OR v_url = '' THEN
    -- No URL configured; skip without error
    RETURN NEW;
  END IF;

  -- Post payload to Edge Function
  PERFORM net.http_post(
    url := v_url,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', CASE WHEN v_secret IS NULL OR v_secret = '' THEN NULL ELSE 'Bearer ' || v_secret END
    ),
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

DROP TRIGGER IF EXISTS trg_notify_admins_on_request ON public.pending_users;
CREATE TRIGGER trg_notify_admins_on_request
AFTER INSERT OR UPDATE OF status ON public.pending_users
FOR EACH ROW
WHEN (NEW.status = 'requested')
EXECUTE FUNCTION public.notify_admins_on_request();