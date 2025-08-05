-- Add 'builder' value to the existing employer_type enum
ALTER TYPE employer_type ADD VALUE 'builder';

-- Add index on employer_type for better query performance at scale
CREATE INDEX IF NOT EXISTS idx_employers_employer_type ON public.employers(employer_type);

-- Add index on employers name for better search performance
CREATE INDEX IF NOT EXISTS idx_employers_name ON public.employers(name);