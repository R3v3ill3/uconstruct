-- Add missing date columns to company_eba_records table
ALTER TABLE public.company_eba_records 
ADD COLUMN IF NOT EXISTS nominal_expiry_date date,
ADD COLUMN IF NOT EXISTS approved_date date;