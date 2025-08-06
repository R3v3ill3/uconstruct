-- Add fwc_document_url column to company_eba_records table
ALTER TABLE public.company_eba_records 
ADD COLUMN fwc_document_url text;