-- Update role enum to include lead and executive
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'lead';
ALTER TYPE app_role ADD VALUE IF NOT EXISTS 'executive';

-- Update profiles table to use the new role enum
ALTER TABLE public.profiles ALTER COLUMN role TYPE app_role USING role::app_role;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'organiser'::app_role;

-- Create lead-organiser relationships table
CREATE TABLE public.lead_organisers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    organiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(lead_id, organiser_id)
);

-- Create organiser projects allocation table (replacing project_organisers functionality)
CREATE TABLE public.organiser_projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organiser_id, project_id)
);

-- Create organiser job sites allocation table
CREATE TABLE public.organiser_job_sites (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    organiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_site_id UUID NOT NULL REFERENCES public.job_sites(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organiser_id, job_site_id)
);

-- Enable RLS on new tables
ALTER TABLE public.lead_organisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organiser_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organiser_job_sites ENABLE ROW LEVEL SECURITY;

-- Update get_user_role function to use app_role enum
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT role FROM public.profiles WHERE id = user_id;
$function$;

-- Create function to get accessible projects for a user based on hierarchy
CREATE OR REPLACE FUNCTION public.get_accessible_projects(user_id uuid)
RETURNS TABLE(project_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT CASE 
        WHEN get_user_role(user_id) = 'executive' THEN 
            (SELECT p.id FROM public.projects p)
        WHEN get_user_role(user_id) = 'lead' THEN (
            -- Lead can access their own allocated projects
            SELECT op.project_id FROM public.organiser_projects op WHERE op.organiser_id = user_id
            UNION
            -- Plus projects allocated to their subordinate organisers
            SELECT op.project_id 
            FROM public.organiser_projects op
            JOIN public.lead_organisers lo ON lo.organiser_id = op.organiser_id
            WHERE lo.lead_id = user_id
        )
        WHEN get_user_role(user_id) = 'organiser' THEN 
            (SELECT op.project_id FROM public.organiser_projects op WHERE op.organiser_id = user_id)
        ELSE 
            (SELECT NULL::uuid WHERE FALSE) -- No access for other roles
    END;
$function$;

-- Create function to get accessible job sites for a user based on hierarchy
CREATE OR REPLACE FUNCTION public.get_accessible_job_sites(user_id uuid)
RETURNS TABLE(job_site_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT CASE 
        WHEN get_user_role(user_id) = 'executive' THEN 
            (SELECT js.id FROM public.job_sites js)
        WHEN get_user_role(user_id) = 'lead' THEN (
            -- Lead can access their own allocated job sites
            SELECT ojs.job_site_id FROM public.organiser_job_sites ojs WHERE ojs.organiser_id = user_id
            UNION
            -- Plus job sites allocated to their subordinate organisers
            SELECT ojs.job_site_id 
            FROM public.organiser_job_sites ojs
            JOIN public.lead_organisers lo ON lo.organiser_id = ojs.organiser_id
            WHERE lo.lead_id = user_id
            UNION
            -- Plus job sites from accessible projects
            SELECT js.id 
            FROM public.job_sites js
            WHERE js.project_id IN (SELECT project_id FROM get_accessible_projects(user_id))
        )
        WHEN get_user_role(user_id) = 'organiser' THEN (
            -- Organiser can access their allocated job sites
            SELECT ojs.job_site_id FROM public.organiser_job_sites ojs WHERE ojs.organiser_id = user_id
            UNION
            -- Plus job sites from their allocated projects
            SELECT js.id 
            FROM public.job_sites js
            WHERE js.project_id IN (SELECT project_id FROM get_accessible_projects(user_id))
        )
        ELSE 
            (SELECT NULL::uuid WHERE FALSE) -- No access for other roles
    END;
$function$;

-- Create function to check if user can manage allocations
CREATE OR REPLACE FUNCTION public.can_manage_allocations(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT get_user_role(user_id) = 'executive';
$function$;

-- Create function to get subordinate organisers for a lead
CREATE OR REPLACE FUNCTION public.get_subordinate_organisers(lead_id uuid)
RETURNS TABLE(organiser_id uuid)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT lo.organiser_id 
    FROM public.lead_organisers lo 
    WHERE lo.lead_id = lead_id;
$function$;

-- Create triggers for updated_at columns
CREATE TRIGGER update_lead_organisers_updated_at
    BEFORE UPDATE ON public.lead_organisers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organiser_projects_updated_at
    BEFORE UPDATE ON public.organiser_projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organiser_job_sites_updated_at
    BEFORE UPDATE ON public.organiser_job_sites
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies for new tables

-- Lead-organisers policies
CREATE POLICY "Executives can manage all lead-organiser relationships"
    ON public.lead_organisers FOR ALL
    USING (get_user_role(auth.uid()) = 'executive');

CREATE POLICY "Leads can view their own subordinates"
    ON public.lead_organisers FOR SELECT
    USING (lead_id = auth.uid());

CREATE POLICY "Organisers can view their lead relationship"
    ON public.lead_organisers FOR SELECT
    USING (organiser_id = auth.uid());

-- Organiser-projects policies
CREATE POLICY "Executives can manage all project allocations"
    ON public.organiser_projects FOR ALL
    USING (get_user_role(auth.uid()) = 'executive');

CREATE POLICY "Leads can view project allocations for their organisers"
    ON public.organiser_projects FOR SELECT
    USING (
        organiser_id = auth.uid() OR 
        organiser_id IN (SELECT organiser_id FROM get_subordinate_organisers(auth.uid()))
    );

CREATE POLICY "Organisers can view their own project allocations"
    ON public.organiser_projects FOR SELECT
    USING (organiser_id = auth.uid());

-- Organiser-job-sites policies
CREATE POLICY "Executives can manage all job site allocations"
    ON public.organiser_job_sites FOR ALL
    USING (get_user_role(auth.uid()) = 'executive');

CREATE POLICY "Leads can view job site allocations for their organisers"
    ON public.organiser_job_sites FOR SELECT
    USING (
        organiser_id = auth.uid() OR 
        organiser_id IN (SELECT organiser_id FROM get_subordinate_organisers(auth.uid()))
    );

CREATE POLICY "Organisers can view their own job site allocations"
    ON public.organiser_job_sites FOR SELECT
    USING (organiser_id = auth.uid());

-- Update existing RLS policies to use hierarchical permissions

-- Projects table - replace existing policies
DROP POLICY IF EXISTS "Admins and organisers can manage projects" ON public.projects;
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;

CREATE POLICY "Executives can manage all projects"
    ON public.projects FOR ALL
    USING (get_user_role(auth.uid()) = 'executive');

CREATE POLICY "Users can view accessible projects"
    ON public.projects FOR SELECT
    USING (id IN (SELECT project_id FROM get_accessible_projects(auth.uid())));

-- Job sites table - replace existing policies
DROP POLICY IF EXISTS "Admins and organisers can manage job sites" ON public.job_sites;
DROP POLICY IF EXISTS "Authenticated users can view job sites" ON public.job_sites;

CREATE POLICY "Executives can manage all job sites"
    ON public.job_sites FOR ALL
    USING (get_user_role(auth.uid()) = 'executive');

CREATE POLICY "Users can view accessible job sites"
    ON public.job_sites FOR SELECT
    USING (id IN (SELECT job_site_id FROM get_accessible_job_sites(auth.uid())));

-- Workers table - replace existing policies
DROP POLICY IF EXISTS "Admins and organisers can manage workers" ON public.workers;
DROP POLICY IF EXISTS "Authenticated users can view workers" ON public.workers;

CREATE POLICY "Executives can manage all workers"
    ON public.workers FOR ALL
    USING (get_user_role(auth.uid()) = 'executive');

CREATE POLICY "Leads and organisers can manage workers"
    ON public.workers FOR ALL
    USING (get_user_role(auth.uid()) IN ('lead', 'organiser'));

CREATE POLICY "Users can view workers from accessible job sites"
    ON public.workers FOR SELECT
    USING (
        id IN (
            SELECT DISTINCT wp.worker_id 
            FROM public.worker_placements wp 
            WHERE wp.job_site_id IN (SELECT job_site_id FROM get_accessible_job_sites(auth.uid()))
        )
    );

-- Update profiles policies to allow role management
CREATE POLICY "Executives can manage all profiles"
    ON public.profiles FOR ALL
    USING (get_user_role(auth.uid()) = 'executive');

-- Migrate existing project_organisers data to new organiser_projects table
INSERT INTO public.organiser_projects (organiser_id, project_id, created_at, updated_at)
SELECT organiser_id, project_id, created_at, updated_at
FROM public.project_organisers
ON CONFLICT (organiser_id, project_id) DO NOTHING;