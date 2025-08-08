
-- 0) Safety: helper to create enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jv_status') THEN
    CREATE TYPE public.jv_status AS ENUM ('yes', 'no', 'unsure');
  END IF;
END$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employer_role_tag') THEN
    CREATE TYPE public.employer_role_tag AS ENUM ('builder', 'head_contractor');
  END IF;
END$$;

-- 1) JV metadata on project_builder_jv (add status; make label optional)
ALTER TABLE public.project_builder_jv
  ADD COLUMN IF NOT EXISTS status public.jv_status NOT NULL DEFAULT 'no';

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'project_builder_jv'
      AND column_name = 'label' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.project_builder_jv
      ALTER COLUMN label DROP NOT NULL;
  END IF;
END$$;

-- 2) Employer capability tags (builder/head_contractor)
CREATE TABLE IF NOT EXISTS public.employer_role_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  tag public.employer_role_tag NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employer_role_tags_unique UNIQUE (employer_id, tag)
);

-- Trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_employer_role_tags_updated_at'
  ) THEN
    CREATE TRIGGER update_employer_role_tags_updated_at
    BEFORE UPDATE ON public.employer_role_tags
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- Enable RLS and policies for employer_role_tags
ALTER TABLE public.employer_role_tags ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'employer_role_tags' AND policyname = 'Admins and organisers can manage employer role tags'
  ) THEN
    CREATE POLICY "Admins and organisers can manage employer role tags"
      ON public.employer_role_tags
      FOR ALL
      USING (get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']))
      WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'employer_role_tags' AND policyname = 'Authenticated users can view employer role tags'
  ) THEN
    CREATE POLICY "Authenticated users can view employer role tags"
      ON public.employer_role_tags
      FOR SELECT
      USING (true);
  END IF;
END$$;

-- Backfill employer_role_tags from project_employer_roles
INSERT INTO public.employer_role_tags (employer_id, tag)
SELECT DISTINCT per.employer_id, 'builder'::public.employer_role_tag
FROM public.project_employer_roles per
WHERE per.role = 'builder'::public.project_role AND per.employer_id IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.employer_role_tags (employer_id, tag)
SELECT DISTINCT per.employer_id, 'head_contractor'::public.employer_role_tag
FROM public.project_employer_roles per
WHERE per.role = 'head_contractor'::public.project_role AND per.employer_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 3) Project-level trades contractors
CREATE TABLE IF NOT EXISTS public.project_contractor_trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  employer_id uuid NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  trade_type public.trade_type NOT NULL,
  eba_signatory public.eba_status_type NOT NULL DEFAULT 'not_specified',
  start_date date NOT NULL DEFAULT CURRENT_DATE,
  end_date date NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT project_contractor_trades_uniq UNIQUE (project_id, employer_id, trade_type, start_date)
);

-- Trigger for updated_at
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_contractor_trades_updated_at'
  ) THEN
    CREATE TRIGGER update_project_contractor_trades_updated_at
    BEFORE UPDATE ON public.project_contractor_trades
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END$$;

-- RLS and policies
ALTER TABLE public.project_contractor_trades ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_contractor_trades' AND policyname = 'Admins and organisers can manage project trade contractors'
  ) THEN
    CREATE POLICY "Admins and organisers can manage project trade contractors"
      ON public.project_contractor_trades
      FOR ALL
      USING (get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']))
      WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_contractor_trades' AND policyname = 'Authenticated users can view project trade contractors'
  ) THEN
    CREATE POLICY "Authenticated users can view project trade contractors"
      ON public.project_contractor_trades
      FOR SELECT
      USING (true);
  END IF;
END$$;
