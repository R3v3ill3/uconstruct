-- Ensure triggers exist for automatic linking between project and site contractors
-- 1) On project_contractor_trades insert: if exactly one site, auto-link to that site
DROP TRIGGER IF EXISTS trg_project_contractor_trades_after_insert ON public.project_contractor_trades;
CREATE TRIGGER trg_project_contractor_trades_after_insert
AFTER INSERT ON public.project_contractor_trades
FOR EACH ROW
EXECUTE FUNCTION public.link_project_contractor_to_single_site();

-- 2) On site_contractor_trades insert: ensure corresponding project-level record exists
DROP TRIGGER IF EXISTS trg_site_contractor_trades_after_insert ON public.site_contractor_trades;
CREATE TRIGGER trg_site_contractor_trades_after_insert
AFTER INSERT ON public.site_contractor_trades
FOR EACH ROW
EXECUTE FUNCTION public.ensure_project_contractor_from_site();

-- 3) Create function and trigger to backfill when the first site is created for a project
CREATE OR REPLACE FUNCTION public.backfill_site_contractors_for_single_site()
RETURNS trigger AS $$
DECLARE
  v_site_count integer;
BEGIN
  -- Count sites for this project after the insert
  SELECT COUNT(*) INTO v_site_count
  FROM public.job_sites
  WHERE project_id = NEW.project_id;

  -- If this is the only site for the project, copy all project-level contractor trades to this site
  IF v_site_count = 1 THEN
    INSERT INTO public.site_contractor_trades (job_site_id, employer_id, trade_type, eba_signatory, start_date, end_date)
    SELECT NEW.id, pct.employer_id, pct.trade_type, COALESCE(pct.eba_signatory, 'not_specified'::public.eba_status_type), pct.start_date, pct.end_date
    FROM public.project_contractor_trades pct
    WHERE pct.project_id = NEW.project_id
    AND NOT EXISTS (
      SELECT 1 FROM public.site_contractor_trades sct
      WHERE sct.job_site_id = NEW.id
        AND sct.employer_id = pct.employer_id
        AND sct.trade_type = pct.trade_type
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

DROP TRIGGER IF EXISTS trg_job_sites_after_insert_single_site ON public.job_sites;
CREATE TRIGGER trg_job_sites_after_insert_single_site
AFTER INSERT ON public.job_sites
FOR EACH ROW
EXECUTE FUNCTION public.backfill_site_contractors_for_single_site();

-- 4) One-time backfill for existing data: link project-level contractors to site when the project has exactly one site
WITH single_site_projects AS (
  SELECT p.id AS project_id, MIN(js.id) AS site_id
  FROM public.projects p
  JOIN public.job_sites js ON js.project_id = p.id
  GROUP BY p.id
  HAVING COUNT(js.id) = 1
)
INSERT INTO public.site_contractor_trades (job_site_id, employer_id, trade_type, eba_signatory, start_date, end_date)
SELECT ssp.site_id, pct.employer_id, pct.trade_type, COALESCE(pct.eba_signatory, 'not_specified'::public.eba_status_type), pct.start_date, pct.end_date
FROM public.project_contractor_trades pct
JOIN single_site_projects ssp ON pct.project_id = ssp.project_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.site_contractor_trades sct
  WHERE sct.job_site_id = ssp.site_id
    AND sct.employer_id = pct.employer_id
    AND sct.trade_type = pct.trade_type
);

-- 5) One-time backfill in the other direction: ensure project-level record exists for existing site-level contractors
INSERT INTO public.project_contractor_trades (project_id, employer_id, trade_type, eba_signatory, start_date, end_date)
SELECT js.project_id, sct.employer_id, sct.trade_type, COALESCE(sct.eba_signatory, 'not_specified'::public.eba_status_type), sct.start_date, sct.end_date
FROM public.site_contractor_trades sct
JOIN public.job_sites js ON js.id = sct.job_site_id
LEFT JOIN public.project_contractor_trades pct
  ON pct.project_id = js.project_id
 AND pct.employer_id = sct.employer_id
 AND pct.trade_type = sct.trade_type
WHERE pct.id IS NULL;