-- Add member_number column to workers table
ALTER TABLE public.workers 
ADD COLUMN member_number text;

-- Add organiser_id to workers table for individual assignment
ALTER TABLE public.workers 
ADD COLUMN organiser_id uuid REFERENCES public.organisers(id);

-- Create employer_organisers junction table for employer-level organiser assignment
CREATE TABLE public.employer_organisers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employer_id uuid NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  organiser_id uuid NOT NULL REFERENCES public.organisers(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(employer_id, organiser_id)
);

-- Enable RLS on employer_organisers
ALTER TABLE public.employer_organisers ENABLE ROW LEVEL SECURITY;

-- Create policies for employer_organisers
CREATE POLICY "Admins and organisers can manage employer organisers" 
ON public.employer_organisers 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view employer organisers" 
ON public.employer_organisers 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_employer_organisers_updated_at
BEFORE UPDATE ON public.employer_organisers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();