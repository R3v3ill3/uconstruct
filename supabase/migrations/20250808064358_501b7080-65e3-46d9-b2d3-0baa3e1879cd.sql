-- Create view mapping site contractors to projects
CREATE OR REPLACE VIEW public.v_project_site_contractors AS
SELECT
  js.project_id,
  sct.job_site_id,
  sct.employer_id,
  sct.trade_type::text AS trade_type,
  sct.eba_status,
  sct.eba_signatory::text AS eba_signatory,
  sct.start_date,
  sct.end_date
FROM public.site_contractor_trades sct
JOIN public.job_sites js ON js.id = sct.job_site_id;

-- Create view mapping workers to projects via placements
CREATE OR REPLACE VIEW public.v_project_workers AS
SELECT
  js.project_id,
  wp.worker_id,
  wp.employer_id,
  wp.job_site_id,
  wp.start_date,
  wp.end_date,
  wp.employment_status::text AS employment_status
FROM public.worker_placements wp
JOIN public.job_sites js ON js.id = wp.job_site_id;
