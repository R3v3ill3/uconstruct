
-- Restrict to admin/organiser and summarize what will be deleted
CREATE OR REPLACE FUNCTION public.get_project_delete_impact(p_project_id uuid)
RETURNS TABLE (
  site_count integer,
  site_contractor_trades_count integer,
  site_contacts_count integer,
  site_employers_count integer,
  union_activities_count integer,
  worker_placements_count integer,
  project_contractor_trades_count integer,
  project_employer_roles_count integer,
  project_organisers_count integer,
  project_builder_jv_count integer,
  project_eba_details_count integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF NOT (get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser'])) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  RETURN QUERY
  WITH sites AS (
    SELECT id FROM public.job_sites WHERE project_id = p_project_id
  )
  SELECT
    (SELECT COUNT(*) FROM sites) AS site_count,
    (SELECT COUNT(*) FROM public.site_contractor_trades WHERE job_site_id IN (SELECT id FROM sites)) AS site_contractor_trades_count,
    (SELECT COUNT(*) FROM public.site_contacts WHERE job_site_id IN (SELECT id FROM sites)) AS site_contacts_count,
    (SELECT COUNT(*) FROM public.site_employers WHERE job_site_id IN (SELECT id FROM sites)) AS site_employers_count,
    (SELECT COUNT(*) FROM public.union_activities WHERE job_site_id IN (SELECT id FROM sites)) AS union_activities_count,
    (SELECT COUNT(*) FROM public.worker_placements WHERE job_site_id IN (SELECT id FROM sites)) AS worker_placements_count,
    (SELECT COUNT(*) FROM public.project_contractor_trades WHERE project_id = p_project_id) AS project_contractor_trades_count,
    (SELECT COUNT(*) FROM public.project_employer_roles WHERE project_id = p_project_id) AS project_employer_roles_count,
    (SELECT COUNT(*) FROM public.project_organisers WHERE project_id = p_project_id) AS project_organisers_count,
    (SELECT COUNT(*) FROM public.project_builder_jv WHERE project_id = p_project_id) AS project_builder_jv_count,
    (SELECT COUNT(*) FROM public.project_eba_details WHERE project_id = p_project_id) AS project_eba_details_count;
END;
$$;

-- Cascading delete of a project and its direct dependents
CREATE OR REPLACE FUNCTION public.delete_project_cascade(p_project_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF NOT (get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser'])) THEN
    RAISE EXCEPTION 'Not allowed';
  END IF;

  -- Delete site-level records first
  DELETE FROM public.site_contractor_trades
  WHERE job_site_id IN (SELECT id FROM public.job_sites WHERE project_id = p_project_id);

  DELETE FROM public.site_contacts
  WHERE job_site_id IN (SELECT id FROM public.job_sites WHERE project_id = p_project_id);

  DELETE FROM public.site_employers
  WHERE job_site_id IN (SELECT id FROM public.job_sites WHERE project_id = p_project_id);

  DELETE FROM public.union_activities
  WHERE job_site_id IN (SELECT id FROM public.job_sites WHERE project_id = p_project_id);

  DELETE FROM public.worker_placements
  WHERE job_site_id IN (SELECT id FROM public.job_sites WHERE project_id = p_project_id);

  -- Delete project-level related records
  DELETE FROM public.project_contractor_trades
  WHERE project_id = p_project_id;

  DELETE FROM public.project_employer_roles
  WHERE project_id = p_project_id;

  DELETE FROM public.project_organisers
  WHERE project_id = p_project_id;

  DELETE FROM public.project_builder_jv
  WHERE project_id = p_project_id;

  DELETE FROM public.project_eba_details
  WHERE project_id = p_project_id;

  -- Delete the project's job sites
  DELETE FROM public.job_sites
  WHERE project_id = p_project_id;

  -- Finally delete the project record
  DELETE FROM public.projects
  WHERE id = p_project_id;
END;
$$;
