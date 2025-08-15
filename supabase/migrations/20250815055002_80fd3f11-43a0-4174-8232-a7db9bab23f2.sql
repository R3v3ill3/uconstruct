-- Site Visit Phase 1 Migration
-- Creates core site visit tables and supporting infrastructure

-- Create site_visit table
CREATE TABLE public.site_visit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id UUID NOT NULL,
  job_site_id UUID NOT NULL,
  sv_code TEXT NOT NULL UNIQUE,
  objective TEXT,
  estimated_workers_count INTEGER,
  scheduled_at TIMESTAMP WITH TIME ZONE,
  outcomes_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create whs_assessment table
CREATE TABLE public.whs_assessment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_visit_id UUID NOT NULL REFERENCES public.site_visit(id) ON DELETE CASCADE,
  rating_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create whs_breach table
CREATE TABLE public.whs_breach (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  whs_assessment_id UUID NOT NULL REFERENCES public.whs_assessment(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  notes TEXT,
  rating_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entitlements_audit table
CREATE TABLE public.entitlements_audit (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_visit_id UUID NOT NULL REFERENCES public.site_visit(id) ON DELETE CASCADE,
  super_paid BOOLEAN NOT NULL DEFAULT true,
  super_paid_to_fund BOOLEAN NOT NULL DEFAULT true,
  redundancy_contributions_up_to_date BOOLEAN NOT NULL DEFAULT true,
  wages_correct BOOLEAN NOT NULL DEFAULT true,
  eba_allowances_correct BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delegate_assessment table
CREATE TABLE public.delegate_assessment (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_visit_id UUID NOT NULL REFERENCES public.site_visit(id) ON DELETE CASCADE,
  present BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delegate_role_rating table
CREATE TABLE public.delegate_role_rating (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  delegate_assessment_id UUID NOT NULL REFERENCES public.delegate_assessment(id) ON DELETE CASCADE,
  role_type_code TEXT NOT NULL,
  rating_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create dd_conversion_attempt table
CREATE TABLE public.dd_conversion_attempt (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_visit_id UUID NOT NULL REFERENCES public.site_visit(id) ON DELETE CASCADE,
  worker_id UUID NOT NULL,
  method_code TEXT NOT NULL,
  outcome_code TEXT NOT NULL,
  client_generated_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create worker_memberships table
CREATE TABLE public.worker_memberships (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  worker_id UUID NOT NULL,
  payment_method TEXT,
  dd_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(worker_id)
);

-- Enable RLS on all tables
ALTER TABLE public.site_visit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whs_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whs_breach ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegate_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegate_role_rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_conversion_attempt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_memberships ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for site_visit
CREATE POLICY "Admins and organisers can manage site visits" 
ON public.site_visit 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view site visits" 
ON public.site_visit 
FOR SELECT 
USING (true);

-- Create RLS policies for whs_assessment
CREATE POLICY "Admins and organisers can manage whs assessments" 
ON public.whs_assessment 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view whs assessments" 
ON public.whs_assessment 
FOR SELECT 
USING (true);

-- Create RLS policies for whs_breach
CREATE POLICY "Admins and organisers can manage whs breaches" 
ON public.whs_breach 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view whs breaches" 
ON public.whs_breach 
FOR SELECT 
USING (true);

-- Create RLS policies for entitlements_audit
CREATE POLICY "Admins and organisers can manage entitlements audits" 
ON public.entitlements_audit 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view entitlements audits" 
ON public.entitlements_audit 
FOR SELECT 
USING (true);

-- Create RLS policies for delegate_assessment
CREATE POLICY "Admins and organisers can manage delegate assessments" 
ON public.delegate_assessment 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view delegate assessments" 
ON public.delegate_assessment 
FOR SELECT 
USING (true);

-- Create RLS policies for delegate_role_rating
CREATE POLICY "Admins and organisers can manage delegate role ratings" 
ON public.delegate_role_rating 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view delegate role ratings" 
ON public.delegate_role_rating 
FOR SELECT 
USING (true);

-- Create RLS policies for dd_conversion_attempt
CREATE POLICY "Admins and organisers can manage dd conversion attempts" 
ON public.dd_conversion_attempt 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view dd conversion attempts" 
ON public.dd_conversion_attempt 
FOR SELECT 
USING (true);

-- Create RLS policies for worker_memberships
CREATE POLICY "Admins and organisers can manage worker memberships" 
ON public.worker_memberships 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view worker memberships" 
ON public.worker_memberships 
FOR SELECT 
USING (true);

-- Create indexes for performance
CREATE INDEX idx_site_visit_sv_code ON public.site_visit(sv_code);
CREATE INDEX idx_site_visit_employer_id ON public.site_visit(employer_id);
CREATE INDEX idx_site_visit_job_site_id ON public.site_visit(job_site_id);
CREATE INDEX idx_whs_assessment_site_visit_id ON public.whs_assessment(site_visit_id);
CREATE INDEX idx_whs_breach_whs_assessment_id ON public.whs_breach(whs_assessment_id);
CREATE INDEX idx_entitlements_audit_site_visit_id ON public.entitlements_audit(site_visit_id);
CREATE INDEX idx_delegate_assessment_site_visit_id ON public.delegate_assessment(site_visit_id);
CREATE INDEX idx_delegate_role_rating_delegate_assessment_id ON public.delegate_role_rating(delegate_assessment_id);
CREATE INDEX idx_dd_conversion_attempt_site_visit_id ON public.dd_conversion_attempt(site_visit_id);
CREATE INDEX idx_dd_conversion_attempt_worker_id ON public.dd_conversion_attempt(worker_id);
CREATE INDEX idx_worker_memberships_worker_id ON public.worker_memberships(worker_id);