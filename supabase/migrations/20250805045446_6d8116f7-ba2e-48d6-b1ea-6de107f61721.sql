-- Create enums
CREATE TYPE public.employer_type AS ENUM ('individual', 'small_contractor', 'large_contractor', 'principal_contractor');
CREATE TYPE public.employment_status AS ENUM ('permanent', 'casual', 'subcontractor', 'apprentice', 'trainee');
CREATE TYPE public.union_role_type AS ENUM ('member', 'hsr', 'site_delegate', 'shift_delegate', 'company_delegate');
CREATE TYPE public.shift_type AS ENUM ('day', 'night', 'split', 'weekend');
CREATE TYPE public.activity_type AS ENUM ('strike', 'training', 'conversation', 'action', 'meeting');
CREATE TYPE public.rating_type AS ENUM ('support_level', 'leadership', 'risk');
CREATE TYPE public.training_status AS ENUM ('completed', 'in_progress', 'cancelled', 'no_show');
CREATE TYPE public.union_membership_status AS ENUM ('member', 'non_member', 'potential', 'declined');

-- Workers table
CREATE TABLE public.workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    gender TEXT,
    date_of_birth DATE,
    union_membership_status union_membership_status DEFAULT 'non_member',
    informal_network_tags TEXT[],
    superannuation_fund TEXT,
    redundancy_fund TEXT,
    other_industry_bodies TEXT[],
    qualifications TEXT[],
    inductions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Employers table
CREATE TABLE public.employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    abn TEXT,
    enterprise_agreement_status BOOLEAN DEFAULT false,
    parent_employer_id UUID REFERENCES public.employers(id),
    employer_type employer_type NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Job sites table
CREATE TABLE public.job_sites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    project_type TEXT,
    main_builder_id UUID REFERENCES public.employers(id),
    shifts shift_type[] DEFAULT ARRAY['day'::shift_type],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Site employers junction table
CREATE TABLE public.site_employers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_site_id UUID REFERENCES public.job_sites(id) ON DELETE CASCADE,
    employer_id UUID REFERENCES public.employers(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(job_site_id, employer_id)
);

-- Worker placements table
CREATE TABLE public.worker_placements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
    employer_id UUID REFERENCES public.employers(id),
    job_site_id UUID REFERENCES public.job_sites(id),
    employment_status employment_status NOT NULL,
    job_title TEXT,
    shift shift_type,
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Union roles table
CREATE TABLE public.union_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name union_role_type NOT NULL,
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
    job_site_id UUID REFERENCES public.job_sites(id),
    start_date DATE NOT NULL,
    end_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Union activities table
CREATE TABLE public.union_activities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    activity_type activity_type NOT NULL,
    topic TEXT,
    date DATE NOT NULL,
    job_site_id UUID REFERENCES public.job_sites(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Worker activity ratings table
CREATE TABLE public.worker_activity_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
    activity_id UUID REFERENCES public.union_activities(id) ON DELETE CASCADE,
    rating_type rating_type NOT NULL,
    rating_value INTEGER CHECK (rating_value >= 1 AND rating_value <= 5),
    rated_by UUID REFERENCES auth.users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Training participation table
CREATE TABLE public.training_participation (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    worker_id UUID REFERENCES public.workers(id) ON DELETE CASCADE,
    training_type TEXT NOT NULL,
    date DATE NOT NULL,
    status training_status DEFAULT 'completed',
    location TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User profiles table for access control
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    role TEXT DEFAULT 'viewer' CHECK (role IN ('admin', 'organiser', 'viewer')),
    scoped_sites UUID[] DEFAULT '{}',
    scoped_employers UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_sites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_employers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_placements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.union_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.union_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_activity_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.training_participation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create profile automatically when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies
-- Profiles policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Helper function to check user role
CREATE OR REPLACE FUNCTION public.get_user_role(user_id UUID)
RETURNS TEXT
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT role FROM public.profiles WHERE id = user_id;
$$;

-- Helper function to check if user has access to site
CREATE OR REPLACE FUNCTION public.has_site_access(user_id UUID, site_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
    SELECT 
        CASE 
            WHEN get_user_role(user_id) = 'admin' THEN true
            WHEN get_user_role(user_id) = 'organiser' THEN 
                site_id = ANY(SELECT unnest(scoped_sites) FROM public.profiles WHERE id = user_id)
                OR array_length((SELECT scoped_sites FROM public.profiles WHERE id = user_id), 1) IS NULL
            ELSE true
        END;
$$;

-- Workers policies
CREATE POLICY "Authenticated users can view workers" ON public.workers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and organisers can manage workers" ON public.workers
    FOR ALL TO authenticated 
    USING (get_user_role(auth.uid()) IN ('admin', 'organiser'));

-- Similar policies for other tables
CREATE POLICY "Authenticated users can view employers" ON public.employers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and organisers can manage employers" ON public.employers
    FOR ALL TO authenticated 
    USING (get_user_role(auth.uid()) IN ('admin', 'organiser'));

CREATE POLICY "Authenticated users can view job sites" ON public.job_sites
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and organisers can manage job sites" ON public.job_sites
    FOR ALL TO authenticated 
    USING (get_user_role(auth.uid()) IN ('admin', 'organiser'));

CREATE POLICY "Authenticated users can view site employers" ON public.site_employers
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and organisers can manage site employers" ON public.site_employers
    FOR ALL TO authenticated 
    USING (get_user_role(auth.uid()) IN ('admin', 'organiser'));

CREATE POLICY "Authenticated users can view worker placements" ON public.worker_placements
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and organisers can manage worker placements" ON public.worker_placements
    FOR ALL TO authenticated 
    USING (get_user_role(auth.uid()) IN ('admin', 'organiser'));

CREATE POLICY "Authenticated users can view union roles" ON public.union_roles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and organisers can manage union roles" ON public.union_roles
    FOR ALL TO authenticated 
    USING (get_user_role(auth.uid()) IN ('admin', 'organiser'));

CREATE POLICY "Authenticated users can view union activities" ON public.union_activities
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and organisers can manage union activities" ON public.union_activities
    FOR ALL TO authenticated 
    USING (get_user_role(auth.uid()) IN ('admin', 'organiser'));

CREATE POLICY "Authenticated users can view worker activity ratings" ON public.worker_activity_ratings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and organisers can manage worker activity ratings" ON public.worker_activity_ratings
    FOR ALL TO authenticated 
    USING (get_user_role(auth.uid()) IN ('admin', 'organiser'));

CREATE POLICY "Authenticated users can view training participation" ON public.training_participation
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins and organisers can manage training participation" ON public.training_participation
    FOR ALL TO authenticated 
    USING (get_user_role(auth.uid()) IN ('admin', 'organiser'));

-- Update timestamps trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create update triggers for tables with updated_at columns
CREATE TRIGGER update_workers_updated_at BEFORE UPDATE ON public.workers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employers_updated_at BEFORE UPDATE ON public.employers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_job_sites_updated_at BEFORE UPDATE ON public.job_sites
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_worker_placements_updated_at BEFORE UPDATE ON public.worker_placements
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_union_roles_updated_at BEFORE UPDATE ON public.union_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_union_activities_updated_at BEFORE UPDATE ON public.union_activities
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_training_participation_updated_at BEFORE UPDATE ON public.training_participation
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();