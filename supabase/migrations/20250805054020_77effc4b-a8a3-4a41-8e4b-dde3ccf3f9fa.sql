-- Remove old phone column and add new address and phone fields to workers table
ALTER TABLE public.workers DROP COLUMN phone;

-- Add new address fields
ALTER TABLE public.workers 
ADD COLUMN home_address_line_1 TEXT,
ADD COLUMN home_address_line_2 TEXT,
ADD COLUMN home_address_suburb TEXT,
ADD COLUMN home_address_postcode TEXT,
ADD COLUMN home_address_state TEXT;

-- Add new phone fields
ALTER TABLE public.workers 
ADD COLUMN home_phone TEXT,
ADD COLUMN work_phone TEXT,
ADD COLUMN mobile_phone TEXT;