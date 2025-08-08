
-- Fix: cast project_role -> text -> employer_role_tag in the sync function
CREATE OR REPLACE FUNCTION public.sync_employer_role_tag_from_per()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $$
BEGIN
  IF NEW.employer_id IS NOT NULL AND (NEW.role::text = 'builder' OR NEW.role::text = 'head_contractor') THEN
    INSERT INTO public.employer_role_tags (employer_id, tag)
    VALUES (NEW.employer_id, (NEW.role::text)::public.employer_role_tag)
    ON CONFLICT (employer_id, tag) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

-- Backfill any missing tags from existing role assignments (idempotent)
INSERT INTO public.employer_role_tags (employer_id, tag)
SELECT DISTINCT per.employer_id, (per.role::text)::public.employer_role_tag
FROM public.project_employer_roles per
WHERE per.employer_id IS NOT NULL
  AND per.role::text IN ('builder', 'head_contractor')
ON CONFLICT (employer_id, tag) DO NOTHING;
