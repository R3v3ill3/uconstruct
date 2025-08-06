-- Add primary contact name to employers table
ALTER TABLE public.employers 
ADD COLUMN primary_contact_name text;

-- Create company EBA records table for tracking EBA workflow
CREATE TABLE public.company_eba_records (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    employer_id uuid REFERENCES public.employers(id) ON DELETE CASCADE,
    eba_file_number text,
    sector text,
    contact_name text,
    contact_phone text,
    contact_email text,
    comments text,
    
    -- Workflow date fields
    docs_prepared date,
    date_barg_docs_sent date,
    followup_email_sent date,
    out_of_office_received date,
    followup_phone_call date,
    date_draft_signing_sent date,
    eba_data_form_received date,
    date_eba_signed date,
    date_vote_occurred date,
    eba_lodged_fwc date,
    fwc_lodgement_number text,
    fwc_matter_number text,
    fwc_certified_date date,
    
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on company_eba_records
ALTER TABLE public.company_eba_records ENABLE ROW LEVEL SECURITY;

-- Create policies for company_eba_records
CREATE POLICY "Admins and organisers can manage company EBA records" 
ON public.company_eba_records 
FOR ALL 
USING (get_user_role(auth.uid()) = ANY (ARRAY['admin'::text, 'organiser'::text]));

CREATE POLICY "Authenticated users can view company EBA records" 
ON public.company_eba_records 
FOR SELECT 
USING (true);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_company_eba_records_updated_at
BEFORE UPDATE ON public.company_eba_records
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for better performance
CREATE INDEX idx_company_eba_records_employer_id ON public.company_eba_records(employer_id);
CREATE INDEX idx_company_eba_records_eba_file_number ON public.company_eba_records(eba_file_number);
CREATE INDEX idx_company_eba_records_sector ON public.company_eba_records(sector);