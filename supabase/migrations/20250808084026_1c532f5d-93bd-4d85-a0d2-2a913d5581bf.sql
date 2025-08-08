-- Link project-level trade contractors to single-site projects and vice versa

-- Function: After insert on project_contractor_trades, if the project has exactly one site,
-- create a corresponding site_contractor_trades entry for that site (if it doesn't exist)
CREATE OR REPLACE FUNCTION public.link_project_contractor_to_single_site()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_site_id uuid;
  v_site_count integer;
BEGIN
  -- Count sites for this project
  SELECT COUNT(*), MIN(id)
  INTO v_site_count, v_site_id
  FROM public.job_sites
  WHERE project_id = NEW.project_id;

  -- Only auto-link when there is exactly one site
  IF v_site_count = 1 AND v_site_id IS NOT NULL THEN
    INSERT INTO public.site_contractor_trades (job_site_id, employer_id, trade_type, eba_signatory)
    SELECT v_site_id, NEW.employer_id, NEW.trade_type, COALESCE(NEW.eba_signatory, 'not_specified'::eba_status_type)
    WHERE NOT EXISTS (
      SELECT 1 FROM public.site_contractor_trades sct
      WHERE sct.job_site_id = v_site_id
        AND sct.employer_id = NEW.employer_id
        AND sct.trade_type = NEW.trade_type
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_link_project_contractor_to_single_site ON public.project_contractor_trades;
CREATE TRIGGER trg_link_project_contractor_to_single_site
AFTER INSERT ON public.project_contractor_trades
FOR EACH ROW
EXECUTE FUNCTION public.link_project_contractor_to_single_site();

-- Function: After insert on site_contractor_trades, ensure a project_contractor_trades row exists
CREATE OR REPLACE FUNCTION public.ensure_project_contractor_from_site()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
DECLARE
  v_project_id uuid;
BEGIN
  -- Find the project for the site
  SELECT project_id INTO v_project_id
  FROM public.job_sites
  WHERE id = NEW.job_site_id;

  IF v_project_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Ensure a corresponding project-level record exists
  INSERT INTO public.project_contractor_trades (project_id, employer_id, trade_type, eba_signatory)
  SELECT v_project_id, NEW.employer_id, NEW.trade_type, COALESCE(NEW.eba_signatory, 'not_specified'::eba_status_type)
  WHERE NOT EXISTS (
    SELECT 1 FROM public.project_contractor_trades pct
    WHERE pct.project_id = v_project_id
      AND pct.employer_id = NEW.employer_id
      AND pct.trade_type = NEW.trade_type
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_ensure_project_contractor_from_site ON public.site_contractor_trades;
CREATE TRIGGER trg_ensure_project_contractor_from_site
AFTER INSERT ON public.site_contractor_trades
FOR EACH ROW
EXECUTE FUNCTION public.ensure_project_contractor_from_site();