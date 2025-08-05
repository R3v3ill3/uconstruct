-- Create enums for new project-related fields
CREATE TYPE public.eba_status AS ENUM ('yes', 'no', 'pending');
CREATE TYPE public.site_contact_role AS ENUM ('project_manager', 'site_manager');

-- Create organisers table
CREATE TABLE public.organisers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create projects table
CREATE TABLE public.projects (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    value DECIMAL,
    main_job_site_id UUID,
    builder_id UUID,
    proposed_start_date DATE,
    proposed_finish_date DATE,
    roe_email TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create project_organisers junction table
CREATE TABLE public.project_organisers (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL,
    organiser_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(project_id, organiser_id)
);

-- Create project_eba_details table
CREATE TABLE public.project_eba_details (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    project_id UUID NOT NULL UNIQUE,
    status eba_status NOT NULL DEFAULT 'no',
    registration_number TEXT,
    eba_title TEXT,
    bargaining_status TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create site_contacts table
CREATE TABLE public.site_contacts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    job_site_id UUID NOT NULL,
    role site_contact_role NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add project relationship and address to job_sites
ALTER TABLE public.job_sites 
ADD COLUMN project_id UUID,
ADD COLUMN is_main_site BOOLEAN DEFAULT false,
ADD COLUMN full_address TEXT;

-- Enhance union_roles table
ALTER TABLE public.union_roles
ADD COLUMN is_senior BOOLEAN DEFAULT false,
ADD COLUMN rating TEXT,
ADD COLUMN experience_level TEXT,
ADD COLUMN gets_paid_time BOOLEAN DEFAULT false,
ADD COLUMN notes TEXT;

-- Add foreign key constraints
ALTER TABLE public.projects 
ADD CONSTRAINT fk_projects_main_job_site 
FOREIGN KEY (main_job_site_id) REFERENCES public.job_sites(id),
ADD CONSTRAINT fk_projects_builder 
FOREIGN KEY (builder_id) REFERENCES public.employers(id);

ALTER TABLE public.project_organisers
ADD CONSTRAINT fk_project_organisers_project 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE,
ADD CONSTRAINT fk_project_organisers_organiser 
FOREIGN KEY (organiser_id) REFERENCES public.organisers(id) ON DELETE CASCADE;

ALTER TABLE public.project_eba_details
ADD CONSTRAINT fk_project_eba_details_project 
FOREIGN KEY (project_id) REFERENCES public.projects(id) ON DELETE CASCADE;

ALTER TABLE public.site_contacts
ADD CONSTRAINT fk_site_contacts_job_site 
FOREIGN KEY (job_site_id) REFERENCES public.job_sites(id) ON DELETE CASCADE;

ALTER TABLE public.job_sites
ADD CONSTRAINT fk_job_sites_project 
FOREIGN KEY (project_id) REFERENCES public.projects(id);

-- Enable RLS on all new tables
ALTER TABLE public.organisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_organisers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_eba_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_contacts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for organisers
CREATE POLICY "Admins and organisers can manage organisers"
ON public.organisers FOR ALL
USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view organisers"
ON public.organisers FOR SELECT
USING (true);

-- Create RLS policies for projects
CREATE POLICY "Admins and organisers can manage projects"
ON public.projects FOR ALL
USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view projects"
ON public.projects FOR SELECT
USING (true);

-- Create RLS policies for project_organisers
CREATE POLICY "Admins and organisers can manage project organisers"
ON public.project_organisers FOR ALL
USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view project organisers"
ON public.project_organisers FOR SELECT
USING (true);

-- Create RLS policies for project_eba_details
CREATE POLICY "Admins and organisers can manage project EBA details"
ON public.project_eba_details FOR ALL
USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view project EBA details"
ON public.project_eba_details FOR SELECT
USING (true);

-- Create RLS policies for site_contacts
CREATE POLICY "Admins and organisers can manage site contacts"
ON public.site_contacts FOR ALL
USING (get_user_role(auth.uid()) = ANY(ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view site contacts"
ON public.site_contacts FOR SELECT
USING (true);

-- Create indexes for performance
CREATE INDEX idx_projects_builder ON public.projects(builder_id);
CREATE INDEX idx_projects_main_job_site ON public.projects(main_job_site_id);
CREATE INDEX idx_project_organisers_project ON public.project_organisers(project_id);
CREATE INDEX idx_project_organisers_organiser ON public.project_organisers(organiser_id);
CREATE INDEX idx_project_eba_details_project ON public.project_eba_details(project_id);
CREATE INDEX idx_site_contacts_job_site ON public.site_contacts(job_site_id);
CREATE INDEX idx_job_sites_project ON public.job_sites(project_id);

-- Create triggers for updated_at columns
CREATE TRIGGER update_organisers_updated_at
    BEFORE UPDATE ON public.organisers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
    BEFORE UPDATE ON public.projects
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_organisers_updated_at
    BEFORE UPDATE ON public.project_organisers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_eba_details_updated_at
    BEFORE UPDATE ON public.project_eba_details
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_contacts_updated_at
    BEFORE UPDATE ON public.site_contacts
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();