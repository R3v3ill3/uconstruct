-- 1) Optimise organiser_allocations lookups
CREATE INDEX IF NOT EXISTS idx_oa_organiser_entity_active_dates
ON public.organiser_allocations (organiser_id, entity_type, is_active, start_date, end_date);

-- Helper: check if an allocation row is currently active
CREATE OR REPLACE FUNCTION public.is_allocation_active(_start date, _end date)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT _start <= CURRENT_DATE AND (_end IS NULL OR _end >= CURRENT_DATE);
$$;

-- 2) Accessible projects via organiser_allocations and hierarchy
CREATE OR REPLACE FUNCTION public.get_accessible_projects(user_id uuid)
RETURNS TABLE(project_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  -- Admins see all projects
  SELECT p.id AS project_id
  FROM public.projects p
  WHERE public.is_admin()

  UNION

  -- Direct project allocations for this organiser
  SELECT oa.entity_id AS project_id
  FROM public.organiser_allocations oa
  WHERE oa.entity_type = 'project'
    AND oa.is_active
    AND public.is_allocation_active(oa.start_date, oa.end_date)
    AND oa.organiser_id = user_id

  UNION

  -- Lead organisers see their subordinate organisers' project allocations
  SELECT oa.entity_id AS project_id
  FROM public.organiser_allocations oa
  WHERE oa.entity_type = 'project'
    AND oa.is_active
    AND public.is_allocation_active(oa.start_date, oa.end_date)
    AND public.has_role(user_id, 'lead_organiser')
    AND public.is_lead_of(user_id, oa.organiser_id)

  UNION

  -- Back-compat: legacy organiser_projects table (if still populated)
  SELECT op.project_id
  FROM public.organiser_projects op
  WHERE op.organiser_id = user_id

  UNION

  SELECT op.project_id
  FROM public.organiser_projects op
  WHERE public.has_role(user_id, 'lead_organiser')
    AND public.is_lead_of(user_id, op.organiser_id);
$function$;

-- 3) Accessible job sites via allocations and project access
CREATE OR REPLACE FUNCTION public.get_accessible_job_sites(user_id uuid)
RETURNS TABLE(job_site_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  -- Admins see all sites
  SELECT js.id AS job_site_id
  FROM public.job_sites js
  WHERE public.is_admin()

  UNION

  -- Direct job site allocations for this organiser
  SELECT oa.entity_id AS job_site_id
  FROM public.organiser_allocations oa
  WHERE oa.entity_type = 'job_site'
    AND oa.is_active
    AND public.is_allocation_active(oa.start_date, oa.end_date)
    AND oa.organiser_id = user_id

  UNION

  -- Lead organisers see their subordinate organisers' job site allocations
  SELECT oa.entity_id AS job_site_id
  FROM public.organiser_allocations oa
  WHERE oa.entity_type = 'job_site'
    AND oa.is_active
    AND public.is_allocation_active(oa.start_date, oa.end_date)
    AND public.has_role(user_id, 'lead_organiser')
    AND public.is_lead_of(user_id, oa.organiser_id)

  UNION

  -- Sites from accessible projects
  SELECT js.id AS job_site_id
  FROM public.job_sites js
  WHERE js.project_id IN (
    SELECT project_id FROM public.get_accessible_projects(user_id)
  )

  UNION

  -- Back-compat: legacy organiser_job_sites table (if still populated)
  SELECT ojs.job_site_id
  FROM public.organiser_job_sites ojs
  WHERE ojs.organiser_id = user_id

  UNION

  SELECT ojs.job_site_id
  FROM public.organiser_job_sites ojs
  WHERE public.has_role(user_id, 'lead_organiser')
    AND public.is_lead_of(user_id, ojs.organiser_id);
$function$;

-- 4) Accessible employers derived from accessible projects and job sites, plus direct allocations
CREATE OR REPLACE FUNCTION public.get_accessible_employers(user_id uuid)
RETURNS TABLE(employer_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  -- Admins see all employers
  SELECT e.id AS employer_id FROM public.employers e WHERE public.is_admin()

  UNION

  -- From project-level roles
  SELECT DISTINCT per.employer_id
  FROM public.project_employer_roles per
  WHERE per.employer_id IS NOT NULL
    AND per.project_id IN (
      SELECT project_id FROM public.get_accessible_projects(user_id)
    )

  UNION

  -- From site contractor trades (if present)
  SELECT DISTINCT sct.employer_id
  FROM public.site_contractor_trades sct
  JOIN public.job_sites js ON js.id = sct.job_site_id
  WHERE sct.employer_id IS NOT NULL
    AND js.id IN (
      SELECT job_site_id FROM public.get_accessible_job_sites(user_id)
    )

  UNION

  -- Direct employer allocations
  SELECT oa.entity_id AS employer_id
  FROM public.organiser_allocations oa
  WHERE oa.entity_type = 'employer'
    AND oa.is_active
    AND public.is_allocation_active(oa.start_date, oa.end_date)
    AND (
      oa.organiser_id = user_id OR
      (public.has_role(user_id, 'lead_organiser') AND public.is_lead_of(user_id, oa.organiser_id))
    );
$function$;

-- 5) Accessible workers via placements on accessible job sites
CREATE OR REPLACE FUNCTION public.get_accessible_workers(user_id uuid)
RETURNS TABLE(worker_id uuid)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $function$
  -- Admins see all workers
  SELECT w.id AS worker_id FROM public.workers w WHERE public.is_admin()

  UNION

  -- Workers placed on accessible job sites (current and historical)
  SELECT DISTINCT wp.worker_id
  FROM public.worker_placements wp
  WHERE wp.job_site_id IN (
    SELECT job_site_id FROM public.get_accessible_job_sites(user_id)
  );
$function$;