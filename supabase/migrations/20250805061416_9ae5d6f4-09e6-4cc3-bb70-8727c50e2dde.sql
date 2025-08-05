-- Create trade type enum based on the mapping sheet
CREATE TYPE public.trade_type AS ENUM (
  'scaffolding',
  'form_work', 
  'reinforcing_steel',
  'concrete',
  'crane_and_rigging',
  'plant_and_equipment',
  'electrical',
  'plumbing',
  'carpentry',
  'painting',
  'flooring',
  'roofing',
  'glazing',
  'landscaping',
  'demolition',
  'earthworks',
  'structural_steel',
  'mechanical_services',
  'fire_protection',
  'security_systems',
  'cleaning',
  'traffic_management',
  'waste_management',
  'general_construction',
  'other'
);

-- Create site contractor trades table to link job sites, employers, and trades
CREATE TABLE public.site_contractor_trades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  job_site_id UUID REFERENCES public.job_sites(id) ON DELETE CASCADE,
  employer_id UUID REFERENCES public.employers(id) ON DELETE CASCADE,
  trade_type public.trade_type NOT NULL,
  eba_status BOOLEAN DEFAULT false,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Ensure unique combination of job site, employer, and trade
  UNIQUE(job_site_id, employer_id, trade_type)
);

-- Enable Row Level Security
ALTER TABLE public.site_contractor_trades ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Admins and organisers can manage site contractor trades" 
ON public.site_contractor_trades 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view site contractor trades" 
ON public.site_contractor_trades 
FOR SELECT 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_contractor_trades_updated_at
BEFORE UPDATE ON public.site_contractor_trades
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_site_contractor_trades_job_site ON public.site_contractor_trades(job_site_id);
CREATE INDEX idx_site_contractor_trades_employer ON public.site_contractor_trades(employer_id);
CREATE INDEX idx_site_contractor_trades_trade_type ON public.site_contractor_trades(trade_type);