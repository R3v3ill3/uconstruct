
-- 0) Ensure required enums exist or are extended

-- Add 'builder' to project_role enum if missing
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

-- JV status (yes/no/unsure)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'jv_status') THEN
    CREATE TYPE public.jv_status AS ENUM ('yes', 'no', 'unsure');
  END IF;
END$$;

-- Employer role tag enum (for prioritising lists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'employer_role_tag') THEN
    CREATE TYPE public.employer_role_tag AS ENUM ('builder', 'head_contractor');
  END IF;
END$$;

-- 1) Project JV metadata table (used by the UI upsert)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'project_builder_jv'
  ) THEN
    CREATE TABLE public.project_builder_jv (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      label text NULL,
      status public.jv_status NOT NULL DEFAULT 'no',
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT uniq_project_builder_jv UNIQUE (project_id)
    );
  END IF;
END$$;

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

-- RLS and policies for project_builder_jv
ALTER TABLE public.project_builder_jv ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_builder_jv' AND policyname = 'Admins and organisers can manage project JV metadata'
  ) THEN
    CREATE POLICY "Admins and organisers can manage project JV metadata"
      ON public.project_builder_jv
      FOR ALL
      USING (get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']))
      WITH CHECK (get_user_role(auth.uid()) = ANY (ARRAY['admin','organiser']));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public' AND tablename = 'project_builder_jv' AND policyname = 'Authenticated users can view project JV metadata'
  ) THEN
    CREATE POLICY "Authenticated users can view project JV metadata"
      ON public.project_builder_jv
      FOR SELECT
      USING (true);
  END IF;
END$$;

-- 2) Employer role tags (used for prioritising in pickers)
CREATE TABLE IF NOT EXISTS public.employer_role_tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
  tag public.employer_role_tag NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT employer_role_tags_unique UNIQUE (employer_id, tag)
);

-- Keep updated_at fresh
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

-- RLS and policies
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

-- Backfill tags from existing project_employer_roles
INSERT INTO public.employer_role_tags (employer_id, tag)
SELECT DISTINCT per.employer_id, 'builder'::public.employer_role_tag
FROM public.project_employer_roles per
WHERE per.role::text = 'builder' AND per.employer_id IS NOT NULL
ON CONFLICT DO NOTHING;

INSERT INTO public.employer_role_tags (employer_id, tag)
SELECT DISTINCT per.employer_id, 'head_contractor'::public.employer_role_tag
FROM public.project_employer_roles per
WHERE per.role::text = 'head_contractor' AND per.employer_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- Keep tags in sync when roles are added/changed
CREATE OR REPLACE FUNCTION public.sync_employer_role_tag_from_per()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.employer_id IS NOT NULL AND (NEW.role::text = 'builder' OR NEW.role::text = 'head_contractor') THEN
    INSERT INTO public.employer_role_tags (employer_id, tag)
    VALUES (NEW.employer_id, NEW.role::public.employer_role_tag)
    ON CONFLICT (employer_id, tag) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_per_sync_role_tags_ins') THEN
    CREATE TRIGGER trg_per_sync_role_tags_ins
    AFTER INSERT ON public.project_employer_roles
    FOR EACH ROW EXECUTE FUNCTION public.sync_employer_role_tag_from_per();
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_per_sync_role_tags_upd') THEN
    CREATE TRIGGER trg_per_sync_role_tags_upd
    AFTER UPDATE ON public.project_employer_roles
    FOR EACH ROW EXECUTE FUNCTION public.sync_employer_role_tag_from_per();
  END IF;
END$$;

-- 3) Project-level trade contractors (kept flexible via text trade_type for now)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = 'public' AND table_name = 'project_contractor_trades'
  ) THEN
    CREATE TABLE public.project_contractor_trades (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
      employer_id uuid NOT NULL REFERENCES public.employers(id) ON DELETE CASCADE,
      trade_type text NOT NULL,
      eba_signatory public.eba_status_type NOT NULL DEFAULT 'not_specified',
      start_date date,
      end_date date,
      created_at timestamptz NOT NULL DEFAULT now(),
      updated_at timestamptz NOT NULL DEFAULT now(),
      CONSTRAINT project_contractor_trades_uniq UNIQUE (project_id, employer_id, trade_type)
    );
  END IF;
END$$;

-- Keep updated_at fresh
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
