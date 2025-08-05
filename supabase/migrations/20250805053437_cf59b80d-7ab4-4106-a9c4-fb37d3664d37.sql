-- Remove old name column and add new name fields to workers table
ALTER TABLE public.workers DROP COLUMN name;

-- Add new name columns
ALTER TABLE public.workers 
ADD COLUMN first_name TEXT NOT NULL DEFAULT '',
ADD COLUMN surname TEXT NOT NULL DEFAULT '',
ADD COLUMN other_name TEXT,
ADD COLUMN nickname TEXT;

-- Remove defaults after adding (to ensure future inserts require values)
ALTER TABLE public.workers ALTER COLUMN first_name DROP DEFAULT;
ALTER TABLE public.workers ALTER COLUMN surname DROP DEFAULT;