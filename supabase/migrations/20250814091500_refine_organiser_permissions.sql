-- Refine organiser/lead permissions to align with allocation-derived access
-- - Scope employers, job sites and workers to what the user can access via organiser_allocations and project links
-- - Remove outdated 'executive'/'lead' policies and open-ended employer SELECT

-- 0) Safety: ensure RLS is enabled (no-op if already enabled)
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employer_role_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contractor_trade_capabilities ENABLE ROW LEVEL SECURITY;

-- 1) Drop outdated or over-broad policies
DROP POLICY IF EXISTS "Executives can manage all job sites" ON public.job_sites;
DROP POLICY IF EXISTS "Executives can manage all projects" ON public.projects;
DROP POLICY IF EXISTS "Executives can manage all workers" ON public.workers;
DROP POLICY IF EXISTS "Leads and organisers can manage workers" ON public.workers;
DROP POLICY IF EXISTS "Authenticated users can view employers" ON public.employers;

-- 2) Employers: restrict visibility and modification to accessible set
-- View: only admins or users with access via projects/sites/direct allocations
CREATE POLICY "Users can view accessible employers"
  ON public.employers
  FOR SELECT
  TO authenticated
  USING (
    public.is_admin() OR
    id IN (
      SELECT employer_id FROM public.get_accessible_employers(auth.uid())
    )
  );

-- Update/Delete: add RESTRICTIVE scope policy to combine with role-based policies
CREATE POLICY "Users can update accessible employers"
  ON public.employers
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR
    id IN (
      SELECT employer_id FROM public.get_accessible_employers(auth.uid())
    )
  )
  WITH CHECK (
    public.is_admin() OR
    id IN (
      SELECT employer_id FROM public.get_accessible_employers(auth.uid())
    )
  );

CREATE POLICY "Users can delete accessible employers"
  ON public.employers
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin() OR
    id IN (
      SELECT employer_id FROM public.get_accessible_employers(auth.uid())
    )
  );

-- 3) Job sites: organisers/leads can manage only sites in their accessible scope
-- Insert: must be for a project the user can access
CREATE POLICY "Organisers and leads can insert job sites for accessible projects"
  ON public.job_sites
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() OR (
      (public.has_role(auth.uid(),'organiser') OR public.has_role(auth.uid(),'lead_organiser'))
      AND project_id IN (
        SELECT project_id FROM public.get_accessible_projects(auth.uid())
      )
    )
  );

-- Update: site must be accessible
CREATE POLICY "Organisers and leads can update accessible job sites"
  ON public.job_sites
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR (
      (public.has_role(auth.uid(),'organiser') OR public.has_role(auth.uid(),'lead_organiser'))
      AND id IN (
        SELECT job_site_id FROM public.get_accessible_job_sites(auth.uid())
      )
    )
  )
  WITH CHECK (
    public.is_admin() OR (
      (public.has_role(auth.uid(),'organiser') OR public.has_role(auth.uid(),'lead_organiser'))
      AND id IN (
        SELECT job_site_id FROM public.get_accessible_job_sites(auth.uid())
      )
    )
  );

-- Delete: site must be accessible
CREATE POLICY "Organisers and leads can delete accessible job sites"
  ON public.job_sites
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin() OR (
      (public.has_role(auth.uid(),'organiser') OR public.has_role(auth.uid(),'lead_organiser'))
      AND id IN (
        SELECT job_site_id FROM public.get_accessible_job_sites(auth.uid())
      )
    )
  );

-- 4) Workers: scope modifications and fix role names ('lead_organiser' instead of 'lead')
-- Admins: full control
CREATE POLICY "Admins can insert workers"
  ON public.workers
  FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update workers"
  ON public.workers
  FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete workers"
  ON public.workers
  FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- Organisers and leads: create workers; update/delete only within accessible scope
CREATE POLICY "Organisers and leads can insert workers"
  ON public.workers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(),'organiser') OR public.has_role(auth.uid(),'lead_organiser')
  );

CREATE POLICY "Organisers and leads can update accessible workers"
  ON public.workers
  FOR UPDATE
  TO authenticated
  USING (
    (public.has_role(auth.uid(),'organiser') OR public.has_role(auth.uid(),'lead_organiser'))
    AND id IN (
      SELECT worker_id FROM public.get_accessible_workers(auth.uid())
    )
  )
  WITH CHECK (
    (public.has_role(auth.uid(),'organiser') OR public.has_role(auth.uid(),'lead_organiser'))
    AND id IN (
      SELECT worker_id FROM public.get_accessible_workers(auth.uid())
    )
  );

CREATE POLICY "Organisers and leads can delete accessible workers"
  ON public.workers
  FOR DELETE
  TO authenticated
  USING (
    (public.has_role(auth.uid(),'organiser') OR public.has_role(auth.uid(),'lead_organiser'))
    AND id IN (
      SELECT worker_id FROM public.get_accessible_workers(auth.uid())
    )
  );

-- 5) Employer-linked tables: ensure updates/deletes follow employer accessibility
-- employer_role_tags
CREATE POLICY "Users can update tags for accessible employers"
  ON public.employer_role_tags
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.get_accessible_employers(auth.uid()) a
      WHERE a.employer_id = employer_id
    )
  )
  WITH CHECK (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.get_accessible_employers(auth.uid()) a
      WHERE a.employer_id = employer_id
    )
  );

CREATE POLICY "Users can delete tags for accessible employers"
  ON public.employer_role_tags
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.get_accessible_employers(auth.uid()) a
      WHERE a.employer_id = employer_id
    )
  );

-- contractor_trade_capabilities
CREATE POLICY "Users can update contractor trade caps for accessible employers"
  ON public.contractor_trade_capabilities
  AS RESTRICTIVE
  FOR UPDATE
  TO authenticated
  USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.get_accessible_employers(auth.uid()) a
      WHERE a.employer_id = employer_id
    )
  )
  WITH CHECK (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.get_accessible_employers(auth.uid()) a
      WHERE a.employer_id = employer_id
    )
  );

CREATE POLICY "Users can delete contractor trade caps for accessible employers"
  ON public.contractor_trade_capabilities
  AS RESTRICTIVE
  FOR DELETE
  TO authenticated
  USING (
    public.is_admin() OR EXISTS (
      SELECT 1 FROM public.get_accessible_employers(auth.uid()) a
      WHERE a.employer_id = employer_id
    )
  );