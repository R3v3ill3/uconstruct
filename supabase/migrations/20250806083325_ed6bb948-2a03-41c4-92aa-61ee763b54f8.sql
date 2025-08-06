-- Create activity templates table for predefined and custom activity types
CREATE TABLE public.activity_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 'survey', 'petition', 'ballot', 'meeting', 'action', 'custom'
  is_predefined BOOLEAN NOT NULL DEFAULT true,
  default_rating_criteria JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create activity participants table to track worker assignments
CREATE TABLE public.activity_participants (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL,
  worker_id UUID NOT NULL,
  assignment_method TEXT NOT NULL, -- 'individual', 'by_employer', 'by_job_site', 'by_organiser', 'by_employer_site'
  assignment_source_id UUID, -- ID of employer, job_site, or organiser used for assignment
  participation_status TEXT DEFAULT 'invited', -- 'invited', 'confirmed', 'declined', 'attended', 'no_show'
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(activity_id, worker_id)
);

-- Create activity delegations table for delegate-worker relationships
CREATE TABLE public.activity_delegations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  activity_id UUID NOT NULL,
  delegate_worker_id UUID NOT NULL, -- The worker who is the delegate
  assigned_worker_id UUID NOT NULL, -- The worker assigned to this delegate
  source_activity_id UUID, -- Previous activity this assignment was carried forward from
  assignment_type TEXT DEFAULT 'manual', -- 'manual', 'carry_forward', 'auto_assigned'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(activity_id, assigned_worker_id)
);

-- Add new columns to union_activities table
ALTER TABLE public.union_activities 
ADD COLUMN template_id UUID,
ADD COLUMN custom_activity_type TEXT,
ADD COLUMN assignment_metadata JSONB,
ADD COLUMN total_participants INTEGER DEFAULT 0,
ADD COLUMN total_delegates INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX idx_activity_participants_activity ON public.activity_participants(activity_id);
CREATE INDEX idx_activity_participants_worker ON public.activity_participants(worker_id);
CREATE INDEX idx_activity_participants_assignment ON public.activity_participants(assignment_method, assignment_source_id);
CREATE INDEX idx_activity_delegations_activity ON public.activity_delegations(activity_id);
CREATE INDEX idx_activity_delegations_delegate ON public.activity_delegations(delegate_worker_id);
CREATE INDEX idx_activity_delegations_assigned ON public.activity_delegations(assigned_worker_id);
CREATE INDEX idx_activity_templates_category ON public.activity_templates(category);

-- Enable RLS on new tables
ALTER TABLE public.activity_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_delegations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for activity_templates
CREATE POLICY "Authenticated users can view activity templates"
ON public.activity_templates
FOR SELECT
USING (true);

CREATE POLICY "Admins and organisers can manage activity templates"
ON public.activity_templates
FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

-- Create RLS policies for activity_participants
CREATE POLICY "Authenticated users can view activity participants"
ON public.activity_participants
FOR SELECT
USING (true);

CREATE POLICY "Admins and organisers can manage activity participants"
ON public.activity_participants
FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

-- Create RLS policies for activity_delegations
CREATE POLICY "Authenticated users can view activity delegations"
ON public.activity_delegations
FOR SELECT
USING (true);

CREATE POLICY "Admins and organisers can manage activity delegations"
ON public.activity_delegations
FOR ALL
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

-- Insert predefined activity templates
INSERT INTO public.activity_templates (name, description, category, is_predefined) VALUES
('Survey', 'Worker opinion survey or questionnaire', 'survey', true),
('Petition', 'Petition for workplace changes or support', 'petition', true),
('EBA Ballot', 'Enterprise Bargaining Agreement voting', 'ballot', true),
('Protected Action Ballot', 'Ballot for protected industrial action', 'ballot', true),
('Site Meeting', 'On-site worker meeting or consultation', 'meeting', true),
('Strike Action', 'Industrial strike or work stoppage', 'action', true),
('Workplace Consultation', 'Formal workplace consultation process', 'meeting', true),
('Safety Campaign', 'Workplace health and safety campaign', 'action', true),
('Verbal Confirmation', 'Verbal confirmation of support or position', 'survey', true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_activity_templates_updated_at
BEFORE UPDATE ON public.activity_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_participants_updated_at
BEFORE UPDATE ON public.activity_participants
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_activity_delegations_updated_at
BEFORE UPDATE ON public.activity_delegations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();