-- 1) Enum for project-scoped employer roles
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'project_role') THEN
    CREATE TYPE public.project_role AS ENUM ('head_contractor', 'contractor', 'trade_subcontractor');
  END IF;
END$$;

-- 2) Table to assign contextual roles to employers per project (time-bounded)
CREATE TABLE IF NOT EXISTS public.project_employer_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employer_id uuid NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  role public.project_role NOT NULL,
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) Helpful indexes
CREATE INDEX IF NOT EXISTS idx_per_project ON public.project_employer_roles (project_id);
CREATE INDEX IF NOT EXISTS idx_per_employer ON public.project_employer_roles (employer_id);
CREATE INDEX IF NOT EXISTS idx_per_active ON public.project_employer_roles (project_id, employer_id, role)
  WHERE start_date <= CURRENT_DATE AND (end_date IS NULL OR end_date >= CURRENT_DATE);

-- Optional: ensure only one current head contractor per project
CREATE UNIQUE INDEX IF NOT EXISTS uniq_current_head_contractor_per_project
  ON public.project_employer_roles (project_id)
  WHERE role = 'head_contractor'::public.project_role
    AND start_date <= CURRENT_DATE
    AND (end_date IS NULL OR end_date >= CURRENT_DATE);

-- 4) RLS
ALTER TABLE public.project_employer_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_employer_roles' AND policyname = 'Admins and organisers can manage project employer roles'
  ) THEN
    CREATE POLICY "Admins and organisers can manage project employer roles"
    ON public.project_employer_roles
    FOR ALL
    USING (get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']))
    WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_employer_roles' AND policyname = 'Authenticated users can view project employer roles'
  ) THEN
    CREATE POLICY "Authenticated users can view project employer roles"
    ON public.project_employer_roles
    FOR SELECT
    USING (true);
  END IF;
END$$;

-- 5) Trigger to keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_employer_roles_updated_at'
  ) THEN
    CREATE TRIGGER update_project_employer_roles_updated_at
    BEFORE UPDATE ON public.project_employer_roles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- 6) View to expose current roles (used by UI)
CREATE OR REPLACE VIEW public.v_project_current_roles AS
SELECT project_id, employer_id, role
FROM public.project_employer_roles
WHERE start_date <= CURRENT_DATE
  AND (end_date IS NULL OR end_date >= CURRENT_DATE);
