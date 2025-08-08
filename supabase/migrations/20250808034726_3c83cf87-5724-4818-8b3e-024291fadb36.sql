
-- 1) Ensure 'builder' exists in project_role enum
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum
    WHERE enumlabel = 'builder'
      AND enumtypid = 'project_role'::regtype
  ) THEN
    ALTER TYPE public.project_role ADD VALUE 'builder';
  END IF;
END$$;

-- 2) Table to hold an optional JV label per project (builders may be a JV)
CREATE TABLE IF NOT EXISTS public.project_builder_jv (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  label text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT uniq_project_builder_jv UNIQUE (project_id)
);

-- Keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_builder_jv_updated_at'
  ) THEN
    CREATE TRIGGER update_project_builder_jv_updated_at
    BEFORE UPDATE ON public.project_builder_jv
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Enable RLS
ALTER TABLE public.project_builder_jv ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_builder_jv' AND policyname = 'Admins and organisers can manage project JV labels'
  ) THEN
    CREATE POLICY "Admins and organisers can manage project JV labels"
      ON public.project_builder_jv
      FOR ALL
      USING (get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']))
      WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_builder_jv' AND policyname = 'Authenticated users can view project JV labels'
  ) THEN
    CREATE POLICY "Authenticated users can view project JV labels"
      ON public.project_builder_jv
      FOR SELECT
      USING (true);
  END IF;
END$$;

-- 3) Backfill: migrate projects.builder_id to project_employer_roles(role='builder')
--    This is idempotent and will not duplicate existing rows.
INSERT INTO public.project_employer_roles (project_id, employer_id, role, start_date)
SELECT
  p.id,
  p.builder_id,
  'builder'::public.project_role,
  COALESCE(p.created_at::date, CURRENT_DATE)
FROM public.projects p
WHERE p.builder_id IS NOT NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.project_employer_roles per
    WHERE per.project_id = p.id
      AND per.employer_id = p.builder_id
      AND per.role = 'builder'::public.project_role
  );
