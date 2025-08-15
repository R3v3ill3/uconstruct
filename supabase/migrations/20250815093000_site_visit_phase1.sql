-- Site Visit / Compliance Blitz – Phase 1 Schema & RLS
-- This migration is additive and follows existing conventions (public schema, RLS enabled, helper access functions).
--
-- Contents
-- 1) Reference tables and seeds
-- 2) Core tables
-- 3) Helper access function(s)
-- 4) RLS enablement and policies
-- 5) Audit log + triggers (minimal)
--
-- Notes
-- - Reference tables prefer code-as-PK for simpler defaults and human-readable joins
-- - Policies align to organiser/lead organiser scoping via get_accessible_job_sites/get_accessible_employers
-- - All objects are created IF NOT EXISTS to be idempotent

BEGIN;

-- 1) Reference tables and seeds ------------------------------------------------

CREATE TABLE IF NOT EXISTS public.site_visit_status (
  code text PRIMARY KEY,
  label text NOT NULL
);

INSERT INTO public.site_visit_status (code, label) VALUES
  ('draft_prep','Draft (Prep)'),
  ('scheduled','Scheduled'),
  ('in_progress','In Progress'),
  ('completed','Completed'),
  ('archived','Archived')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.checklist_item (
  code text PRIMARY KEY,
  label text NOT NULL,
  is_active boolean NOT NULL DEFAULT true
);

INSERT INTO public.checklist_item (code,label) VALUES
  ('roe_email_sent','Right-of-Entry email sent'),
  ('delegate_contact_verified','Delegate contact verified'),
  ('worker_list_updated','Worker/member list updated'),
  ('eba_links_attached','EBA links attached')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.checklist_response_option (
  code text PRIMARY KEY,
  label text NOT NULL
);

INSERT INTO public.checklist_response_option (code,label) VALUES
  ('yes','Yes'),('no','No'),('na','N/A')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.dd_attempt_method (
  code text PRIMARY KEY,
  label text NOT NULL
);

INSERT INTO public.dd_attempt_method (code,label) VALUES
  ('in_person','In person'),('phone','Phone'),('sms','SMS'),('email','Email')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.dd_attempt_outcome (
  code text PRIMARY KEY,
  label text NOT NULL
);

INSERT INTO public.dd_attempt_outcome (code,label) VALUES
  ('converted','Converted to DD'),
  ('declined','Declined'),
  ('already_on_dd','Already on DD'),
  ('follow_up','Follow-up scheduled')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.delegate_role_type (
  code text PRIMARY KEY,
  label text NOT NULL
);

INSERT INTO public.delegate_role_type (code,label) VALUES
  ('communication','Communication'),('mobilisation','Mobilisation'),('advocacy','Advocacy'),('advice','Advice')
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.rating_scale_5 (
  code text PRIMARY KEY,
  label text NOT NULL,
  numeric_value integer NOT NULL CHECK (numeric_value BETWEEN 1 AND 5)
);

INSERT INTO public.rating_scale_5 (code,label,numeric_value) VALUES
  ('1','None/Low',1),('2','Improving',2),('3','Consistent',3),('4','Excellent',4),('5','N/A',5)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.compliance_category (
  code text PRIMARY KEY,
  label text NOT NULL,
  weight_pct numeric(5,2) NOT NULL CHECK (weight_pct >= 0 AND weight_pct <= 100)
);

INSERT INTO public.compliance_category (code,label,weight_pct) VALUES
  ('membership_dd','Membership & DD', 10),
  ('entitlements','Entitlements', 35),
  ('whs','Work Health and Safety', 35),
  ('delegate','Delegate', 20)
ON CONFLICT (code) DO NOTHING;

CREATE TABLE IF NOT EXISTS public.compliance_rule (
  code text PRIMARY KEY,
  label text NOT NULL,
  category_code text NOT NULL REFERENCES public.compliance_category(code),
  severity text NOT NULL CHECK (severity IN ('critical','medium','advisory')),
  is_critical_flag boolean NOT NULL DEFAULT false,
  parameters_json jsonb,
  is_active boolean NOT NULL DEFAULT true
);

INSERT INTO public.compliance_rule (code,label,category_code,severity,is_critical_flag,parameters_json)
VALUES
  ('critical_ent_super_not_paid','Critical: Super not paid','entitlements','critical',true,'{}'),
  ('critical_ent_super_not_cbus','Critical: Super not paid to CBUS','entitlements','critical',true,'{}'),
  ('critical_whs_low','Critical: WHS <= 2','whs','critical',true,'{}'),
  ('medium_delegate_absent','Delegate not present','delegate','medium',false,'{}')
ON CONFLICT (code) DO NOTHING;

-- 2) Core tables ---------------------------------------------------------------

CREATE TABLE IF NOT EXISTS public.site_visit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  employer_id uuid NOT NULL REFERENCES public.employers(id),
  job_site_id uuid NOT NULL REFERENCES public.job_sites(id),
  scheduled_at timestamptz,
  started_at timestamptz,
  completed_at timestamptz,
  status_code text NOT NULL REFERENCES public.site_visit_status(code) DEFAULT 'draft_prep',
  form_version text NOT NULL DEFAULT 'v1',
  sv_code text UNIQUE NOT NULL,
  objective text,
  estimated_workers_count integer,
  created_by_profile_id uuid NOT NULL REFERENCES public.profiles(id),
  client_generated_id text UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  updated_by_profile_id uuid,
  version integer NOT NULL DEFAULT 1
);

CREATE TABLE IF NOT EXISTS public.site_visit_checklist_response (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_visit_id uuid NOT NULL REFERENCES public.site_visit(id) ON DELETE CASCADE,
  checklist_item_code text NOT NULL REFERENCES public.checklist_item(code),
  response_option_code text NOT NULL REFERENCES public.checklist_response_option(code),
  comment text,
  responded_at timestamptz NOT NULL DEFAULT now(),
  responded_by_profile_id uuid NOT NULL REFERENCES public.profiles(id),
  UNIQUE(site_visit_id, checklist_item_code)
);

CREATE TABLE IF NOT EXISTS public.whs_assessment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_visit_id uuid NOT NULL UNIQUE REFERENCES public.site_visit(id) ON DELETE CASCADE,
  rating_code text NOT NULL REFERENCES public.rating_scale_5(code),
  notes text,
  photo_evidence_path text[],
  assessed_at timestamptz NOT NULL DEFAULT now(),
  assessed_by_profile_id uuid NOT NULL REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.whs_breach (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  whs_assessment_id uuid NOT NULL REFERENCES public.whs_assessment(id) ON DELETE CASCADE,
  title text,
  breach_code text,
  notes text,
  rating_code text NOT NULL REFERENCES public.rating_scale_5(code),
  photo_evidence_path text[],
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by_profile_id uuid NOT NULL REFERENCES public.profiles(id)
);

CREATE INDEX IF NOT EXISTS idx_whs_breach_assessment ON public.whs_breach(whs_assessment_id);
CREATE INDEX IF NOT EXISTS idx_whs_breach_rating ON public.whs_breach(rating_code);

CREATE TABLE IF NOT EXISTS public.delegate_assessment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_visit_id uuid NOT NULL REFERENCES public.site_visit(id) ON DELETE CASCADE,
  delegate_worker_id uuid REFERENCES public.workers(id),
  present boolean NOT NULL DEFAULT false,
  overall_notes text,
  assessed_at timestamptz NOT NULL DEFAULT now(),
  assessed_by_profile_id uuid NOT NULL REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.delegate_role_rating (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delegate_assessment_id uuid NOT NULL REFERENCES public.delegate_assessment(id) ON DELETE CASCADE,
  role_type_code text NOT NULL REFERENCES public.delegate_role_type(code),
  rating_code text NOT NULL REFERENCES public.rating_scale_5(code),
  notes text,
  UNIQUE(delegate_assessment_id, role_type_code)
);

CREATE TABLE IF NOT EXISTS public.entitlements_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_visit_id uuid NOT NULL UNIQUE REFERENCES public.site_visit(id) ON DELETE CASCADE,
  sample_size integer NOT NULL DEFAULT 0,
  super_paid boolean,
  super_fund_code text DEFAULT 'CBUS',
  super_paid_to_fund boolean,
  redundancy_contributions_up_to_date boolean,
  eba_allowances_correct boolean,
  wages_correct boolean,
  issues_summary text,
  evidence_paths text[],
  audited_at timestamptz NOT NULL DEFAULT now(),
  audited_by_profile_id uuid NOT NULL REFERENCES public.profiles(id)
);

CREATE TABLE IF NOT EXISTS public.entitlement_breach (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlements_audit_id uuid NOT NULL REFERENCES public.entitlements_audit(id) ON DELETE CASCADE,
  category_code_v2 text NOT NULL CHECK (category_code_v2 IN ('super','redundancy','wages','allowances')),
  title text,
  notes text,
  rating_code text REFERENCES public.rating_scale_5(code),
  evidence_paths text[],
  worker_id uuid REFERENCES public.workers(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by_profile_id uuid NOT NULL REFERENCES public.profiles(id)
);

-- enforce single-check for super and redundancy per entitlements_audit
CREATE UNIQUE INDEX IF NOT EXISTS uniq_entitlement_breach_super_per_audit
  ON public.entitlement_breach (entitlements_audit_id)
  WHERE category_code_v2 = 'super';

CREATE UNIQUE INDEX IF NOT EXISTS uniq_entitlement_breach_redundancy_per_audit
  ON public.entitlement_breach (entitlements_audit_id)
  WHERE category_code_v2 = 'redundancy';

CREATE TABLE IF NOT EXISTS public.entitlement_issue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entitlements_audit_id uuid NOT NULL REFERENCES public.entitlements_audit(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES public.workers(id),
  issue_code text NOT NULL,
  description text,
  severity text,
  resolved boolean NOT NULL DEFAULT false,
  follow_up_task_id uuid
);

CREATE TABLE IF NOT EXISTS public.dd_conversion_attempt (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_visit_id uuid NOT NULL REFERENCES public.site_visit(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES public.workers(id),
  method_code text NOT NULL REFERENCES public.dd_attempt_method(code),
  starting_payment_method text,
  outcome_code text NOT NULL REFERENCES public.dd_attempt_outcome(code),
  follow_up_at timestamptz,
  dd_mandate_path text,
  notes text,
  attempted_at timestamptz NOT NULL DEFAULT now(),
  attempted_by_profile_id uuid NOT NULL REFERENCES public.profiles(id),
  client_generated_id text UNIQUE
);

-- Link to company EBA records when available
CREATE TABLE IF NOT EXISTS public.site_visit_eba_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_visit_id uuid NOT NULL UNIQUE REFERENCES public.site_visit(id) ON DELETE CASCADE,
  eba_id uuid REFERENCES public.company_eba_records(id),
  eba_version text,
  document_url text,
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_visit_roster_snapshot (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_visit_id uuid NOT NULL UNIQUE REFERENCES public.site_visit(id) ON DELETE CASCADE,
  generated_from_source text,
  total_workers integer,
  captured_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_visit_roster_worker (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  roster_snapshot_id uuid NOT NULL REFERENCES public.site_visit_roster_snapshot(id) ON DELETE CASCADE,
  worker_id uuid REFERENCES public.workers(id),
  external_worker_ref text,
  present boolean,
  phone text,
  email text,
  notes text
);

-- Ensure one row per worker or external ref within a roster snapshot
CREATE UNIQUE INDEX IF NOT EXISTS uniq_roster_worker_in_snapshot
ON public.site_visit_roster_worker (
  roster_snapshot_id,
  COALESCE(worker_id::text, external_worker_ref)
);

CREATE TABLE IF NOT EXISTS public.visit_compliance_summary (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_visit_id uuid NOT NULL UNIQUE REFERENCES public.site_visit(id) ON DELETE CASCADE,
  overall_score numeric(5,2) NOT NULL,
  classification_code text NOT NULL,
  category_scores_json jsonb NOT NULL,
  triggered_rules jsonb NOT NULL,
  computed_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.site_visit_task (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_visit_id uuid NOT NULL REFERENCES public.site_visit(id) ON DELETE CASCADE,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'open',
  due_at timestamptz,
  assigned_to_profile_id uuid REFERENCES public.profiles(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  created_by_profile_id uuid NOT NULL REFERENCES public.profiles(id),
  completed_at timestamptz
);

CREATE TABLE IF NOT EXISTS public.site_visit_attachment (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  site_visit_id uuid NOT NULL REFERENCES public.site_visit(id) ON DELETE CASCADE,
  category text,
  storage_path text NOT NULL,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  uploaded_by_profile_id uuid NOT NULL REFERENCES public.profiles(id)
);

-- 3) Helper access function(s) -----------------------------------------------

CREATE OR REPLACE FUNCTION public.can_access_site_visit(_sv_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT
    public.is_admin()
    OR (
      (public.has_role(_user_id, 'organiser') OR public.has_role(_user_id, 'lead_organiser'))
      AND EXISTS (
        SELECT 1
        FROM public.site_visit sv
        WHERE sv.id = _sv_id
          AND (
            sv.created_by_profile_id = _user_id
            OR sv.job_site_id IN (SELECT job_site_id FROM public.get_accessible_job_sites(_user_id))
            OR sv.employer_id IN (SELECT employer_id FROM public.get_accessible_employers(_user_id))
          )
      )
    );
$$;

-- 4) RLS enablement and policies ---------------------------------------------

-- Enable RLS for reference tables and provide SELECT to authenticated; modifications allowed to admins only
ALTER TABLE public.site_visit_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_item ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_response_option ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_attempt_method ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_attempt_outcome ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegate_role_type ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rating_scale_5 ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_category ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_rule ENABLE ROW LEVEL SECURITY;

-- Reference table policies (read for all authenticated, write for admins)
DO $$
BEGIN
  -- Helper macro-ish using DO blocks ensures idempotency across environments
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='site_visit_status' AND policyname='ref_site_visit_status_select') THEN
    CREATE POLICY ref_site_visit_status_select ON public.site_visit_status FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='site_visit_status' AND policyname='ref_site_visit_status_admin') THEN
    CREATE POLICY ref_site_visit_status_admin ON public.site_visit_status FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='checklist_item' AND policyname='ref_checklist_item_select') THEN
    CREATE POLICY ref_checklist_item_select ON public.checklist_item FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='checklist_item' AND policyname='ref_checklist_item_admin') THEN
    CREATE POLICY ref_checklist_item_admin ON public.checklist_item FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='checklist_response_option' AND policyname='ref_checklist_response_option_select') THEN
    CREATE POLICY ref_checklist_response_option_select ON public.checklist_response_option FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='checklist_response_option' AND policyname='ref_checklist_response_option_admin') THEN
    CREATE POLICY ref_checklist_response_option_admin ON public.checklist_response_option FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_attempt_method' AND policyname='ref_dd_attempt_method_select') THEN
    CREATE POLICY ref_dd_attempt_method_select ON public.dd_attempt_method FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_attempt_method' AND policyname='ref_dd_attempt_method_admin') THEN
    CREATE POLICY ref_dd_attempt_method_admin ON public.dd_attempt_method FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_attempt_outcome' AND policyname='ref_dd_attempt_outcome_select') THEN
    CREATE POLICY ref_dd_attempt_outcome_select ON public.dd_attempt_outcome FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dd_attempt_outcome' AND policyname='ref_dd_attempt_outcome_admin') THEN
    CREATE POLICY ref_dd_attempt_outcome_admin ON public.dd_attempt_outcome FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='delegate_role_type' AND policyname='ref_delegate_role_type_select') THEN
    CREATE POLICY ref_delegate_role_type_select ON public.delegate_role_type FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='delegate_role_type' AND policyname='ref_delegate_role_type_admin') THEN
    CREATE POLICY ref_delegate_role_type_admin ON public.delegate_role_type FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rating_scale_5' AND policyname='ref_rating_scale_5_select') THEN
    CREATE POLICY ref_rating_scale_5_select ON public.rating_scale_5 FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='rating_scale_5' AND policyname='ref_rating_scale_5_admin') THEN
    CREATE POLICY ref_rating_scale_5_admin ON public.rating_scale_5 FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='compliance_category' AND policyname='ref_compliance_category_select') THEN
    CREATE POLICY ref_compliance_category_select ON public.compliance_category FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='compliance_category' AND policyname='ref_compliance_category_admin') THEN
    CREATE POLICY ref_compliance_category_admin ON public.compliance_category FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='compliance_rule' AND policyname='ref_compliance_rule_select') THEN
    CREATE POLICY ref_compliance_rule_select ON public.compliance_rule FOR SELECT TO authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='compliance_rule' AND policyname='ref_compliance_rule_admin') THEN
    CREATE POLICY ref_compliance_rule_admin ON public.compliance_rule FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
  END IF;
END $$;

ALTER TABLE public.site_visit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visit_checklist_response ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whs_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whs_breach ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegate_assessment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegate_role_rating ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlements_audit ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlement_breach ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entitlement_issue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dd_conversion_attempt ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visit_eba_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visit_roster_snapshot ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visit_roster_worker ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_compliance_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visit_task ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_visit_attachment ENABLE ROW LEVEL SECURITY;

-- site_visit policies
DROP POLICY IF EXISTS "sv_select" ON public.site_visit;
CREATE POLICY "sv_select" ON public.site_visit
FOR SELECT TO authenticated
USING ( public.can_access_site_visit(id, auth.uid()) );

DROP POLICY IF EXISTS "sv_modify" ON public.site_visit;
CREATE POLICY "sv_modify" ON public.site_visit
FOR ALL TO authenticated
USING ( public.can_access_site_visit(id, auth.uid()) )
WITH CHECK ( public.can_access_site_visit(id, auth.uid()) );

-- site_visit_checklist_response
DROP POLICY IF EXISTS "sv_chk_select" ON public.site_visit_checklist_response;
CREATE POLICY "sv_chk_select" ON public.site_visit_checklist_response
FOR SELECT TO authenticated
USING (
  public.can_access_site_visit(site_visit_id, auth.uid())
);

DROP POLICY IF EXISTS "sv_chk_modify" ON public.site_visit_checklist_response;
CREATE POLICY "sv_chk_modify" ON public.site_visit_checklist_response
FOR ALL TO authenticated
USING (
  public.can_access_site_visit(site_visit_id, auth.uid())
)
WITH CHECK (
  public.can_access_site_visit(site_visit_id, auth.uid())
);

-- whs_assessment
DROP POLICY IF EXISTS "sv_whs_select" ON public.whs_assessment;
CREATE POLICY "sv_whs_select" ON public.whs_assessment
FOR SELECT TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) );

DROP POLICY IF EXISTS "sv_whs_modify" ON public.whs_assessment;
CREATE POLICY "sv_whs_modify" ON public.whs_assessment
FOR ALL TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) )
WITH CHECK ( public.can_access_site_visit(site_visit_id, auth.uid()) );

-- whs_breach
DROP POLICY IF EXISTS "sv_whs_breach_select" ON public.whs_breach;
CREATE POLICY "sv_whs_breach_select" ON public.whs_breach
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.whs_assessment wa
    WHERE wa.id = whs_breach.whs_assessment_id
      AND public.can_access_site_visit(wa.site_visit_id, auth.uid())
  )
);

DROP POLICY IF EXISTS "sv_whs_breach_modify" ON public.whs_breach;
CREATE POLICY "sv_whs_breach_modify" ON public.whs_breach
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.whs_assessment wa
    WHERE wa.id = whs_breach.whs_assessment_id
      AND public.can_access_site_visit(wa.site_visit_id, auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.whs_assessment wa
    WHERE wa.id = whs_breach.whs_assessment_id
      AND public.can_access_site_visit(wa.site_visit_id, auth.uid())
  )
);

-- delegate_assessment
DROP POLICY IF EXISTS "sv_delegate_select" ON public.delegate_assessment;
CREATE POLICY "sv_delegate_select" ON public.delegate_assessment
FOR SELECT TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) );

DROP POLICY IF EXISTS "sv_delegate_modify" ON public.delegate_assessment;
CREATE POLICY "sv_delegate_modify" ON public.delegate_assessment
FOR ALL TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) )
WITH CHECK ( public.can_access_site_visit(site_visit_id, auth.uid()) );

-- delegate_role_rating
DROP POLICY IF EXISTS "sv_delegate_role_select" ON public.delegate_role_rating;
CREATE POLICY "sv_delegate_role_select" ON public.delegate_role_rating
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.delegate_assessment da
    WHERE da.id = delegate_role_rating.delegate_assessment_id
      AND public.can_access_site_visit(da.site_visit_id, auth.uid())
  )
);

DROP POLICY IF EXISTS "sv_delegate_role_modify" ON public.delegate_role_rating;
CREATE POLICY "sv_delegate_role_modify" ON public.delegate_role_rating
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.delegate_assessment da
    WHERE da.id = delegate_role_rating.delegate_assessment_id
      AND public.can_access_site_visit(da.site_visit_id, auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.delegate_assessment da
    WHERE da.id = delegate_role_rating.delegate_assessment_id
      AND public.can_access_site_visit(da.site_visit_id, auth.uid())
  )
);

-- entitlements_audit
DROP POLICY IF EXISTS "sv_ent_select" ON public.entitlements_audit;
CREATE POLICY "sv_ent_select" ON public.entitlements_audit
FOR SELECT TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) );

DROP POLICY IF EXISTS "sv_ent_modify" ON public.entitlements_audit;
CREATE POLICY "sv_ent_modify" ON public.entitlements_audit
FOR ALL TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) )
WITH CHECK ( public.can_access_site_visit(site_visit_id, auth.uid()) );

-- entitlement_breach
DROP POLICY IF EXISTS "sv_ent_breach_select" ON public.entitlement_breach;
CREATE POLICY "sv_ent_breach_select" ON public.entitlement_breach
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.entitlements_audit ea
    WHERE ea.id = entitlement_breach.entitlements_audit_id
      AND public.can_access_site_visit(ea.site_visit_id, auth.uid())
  )
);

DROP POLICY IF EXISTS "sv_ent_breach_modify" ON public.entitlement_breach;
CREATE POLICY "sv_ent_breach_modify" ON public.entitlement_breach
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.entitlements_audit ea
    WHERE ea.id = entitlement_breach.entitlements_audit_id
      AND public.can_access_site_visit(ea.site_visit_id, auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.entitlements_audit ea
    WHERE ea.id = entitlement_breach.entitlements_audit_id
      AND public.can_access_site_visit(ea.site_visit_id, auth.uid())
  )
);

-- entitlement_issue
DROP POLICY IF EXISTS "sv_ent_issue_select" ON public.entitlement_issue;
CREATE POLICY "sv_ent_issue_select" ON public.entitlement_issue
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.entitlements_audit ea
    WHERE ea.id = entitlement_issue.entitlements_audit_id
      AND public.can_access_site_visit(ea.site_visit_id, auth.uid())
  )
);

DROP POLICY IF EXISTS "sv_ent_issue_modify" ON public.entitlement_issue;
CREATE POLICY "sv_ent_issue_modify" ON public.entitlement_issue
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.entitlements_audit ea
    WHERE ea.id = entitlement_issue.entitlements_audit_id
      AND public.can_access_site_visit(ea.site_visit_id, auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.entitlements_audit ea
    WHERE ea.id = entitlement_issue.entitlements_audit_id
      AND public.can_access_site_visit(ea.site_visit_id, auth.uid())
  )
);

-- dd_conversion_attempt
DROP POLICY IF EXISTS "sv_dd_select" ON public.dd_conversion_attempt;
CREATE POLICY "sv_dd_select" ON public.dd_conversion_attempt
FOR SELECT TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) );

DROP POLICY IF EXISTS "sv_dd_modify" ON public.dd_conversion_attempt;
CREATE POLICY "sv_dd_modify" ON public.dd_conversion_attempt
FOR ALL TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) )
WITH CHECK ( public.can_access_site_visit(site_visit_id, auth.uid()) );

-- eba snapshot
DROP POLICY IF EXISTS "sv_eba_select" ON public.site_visit_eba_snapshot;
CREATE POLICY "sv_eba_select" ON public.site_visit_eba_snapshot
FOR SELECT TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) );

DROP POLICY IF EXISTS "sv_eba_modify" ON public.site_visit_eba_snapshot;
CREATE POLICY "sv_eba_modify" ON public.site_visit_eba_snapshot
FOR ALL TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) )
WITH CHECK ( public.can_access_site_visit(site_visit_id, auth.uid()) );

-- roster snapshot
DROP POLICY IF EXISTS "sv_roster_select" ON public.site_visit_roster_snapshot;
CREATE POLICY "sv_roster_select" ON public.site_visit_roster_snapshot
FOR SELECT TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) );

DROP POLICY IF EXISTS "sv_roster_modify" ON public.site_visit_roster_snapshot;
CREATE POLICY "sv_roster_modify" ON public.site_visit_roster_snapshot
FOR ALL TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) )
WITH CHECK ( public.can_access_site_visit(site_visit_id, auth.uid()) );

-- roster worker
DROP POLICY IF EXISTS "sv_roster_worker_select" ON public.site_visit_roster_worker;
CREATE POLICY "sv_roster_worker_select" ON public.site_visit_roster_worker
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.site_visit_roster_snapshot rs
    JOIN public.site_visit sv ON sv.id = rs.site_visit_id
    WHERE rs.id = site_visit_roster_worker.roster_snapshot_id
      AND public.can_access_site_visit(sv.id, auth.uid())
  )
);

DROP POLICY IF EXISTS "sv_roster_worker_modify" ON public.site_visit_roster_worker;
CREATE POLICY "sv_roster_worker_modify" ON public.site_visit_roster_worker
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.site_visit_roster_snapshot rs
    JOIN public.site_visit sv ON sv.id = rs.site_visit_id
    WHERE rs.id = site_visit_roster_worker.roster_snapshot_id
      AND public.can_access_site_visit(sv.id, auth.uid())
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.site_visit_roster_snapshot rs
    JOIN public.site_visit sv ON sv.id = rs.site_visit_id
    WHERE rs.id = site_visit_roster_worker.roster_snapshot_id
      AND public.can_access_site_visit(sv.id, auth.uid())
  )
);

-- compliance summary
DROP POLICY IF EXISTS "sv_summary_select" ON public.visit_compliance_summary;
CREATE POLICY "sv_summary_select" ON public.visit_compliance_summary
FOR SELECT TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) );

DROP POLICY IF EXISTS "sv_summary_modify" ON public.visit_compliance_summary;
CREATE POLICY "sv_summary_modify" ON public.visit_compliance_summary
FOR ALL TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) )
WITH CHECK ( public.can_access_site_visit(site_visit_id, auth.uid()) );

-- task
DROP POLICY IF EXISTS "sv_task_select" ON public.site_visit_task;
CREATE POLICY "sv_task_select" ON public.site_visit_task
FOR SELECT TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) );

DROP POLICY IF EXISTS "sv_task_modify" ON public.site_visit_task;
CREATE POLICY "sv_task_modify" ON public.site_visit_task
FOR ALL TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) )
WITH CHECK ( public.can_access_site_visit(site_visit_id, auth.uid()) );

-- attachment
DROP POLICY IF EXISTS "sv_attach_select" ON public.site_visit_attachment;
CREATE POLICY "sv_attach_select" ON public.site_visit_attachment
FOR SELECT TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) );

DROP POLICY IF EXISTS "sv_attach_modify" ON public.site_visit_attachment;
CREATE POLICY "sv_attach_modify" ON public.site_visit_attachment
FOR ALL TO authenticated
USING ( public.can_access_site_visit(site_visit_id, auth.uid()) )
WITH CHECK ( public.can_access_site_visit(site_visit_id, auth.uid()) );

-- 5) Minimal audit log + triggers --------------------------------------------

CREATE TABLE IF NOT EXISTS public.audit_log (
  id bigint generated always as identity primary key,
  table_name text NOT NULL,
  row_id text NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT','UPDATE','DELETE')),
  old_data jsonb,
  new_data jsonb,
  profile_id uuid REFERENCES public.profiles(id),
  occurred_at timestamptz NOT NULL DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.fn_log_audit()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.audit_log(table_name,row_id,action,old_data,new_data,profile_id)
    VALUES (TG_TABLE_NAME, (OLD.id)::text, TG_OP, to_jsonb(OLD), NULL, auth.uid());
    RETURN OLD;
  ELSIF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.audit_log(table_name,row_id,action,old_data,new_data,profile_id)
    VALUES (TG_TABLE_NAME, (NEW.id)::text, TG_OP, to_jsonb(OLD), to_jsonb(NEW), auth.uid());
    RETURN NEW;
  ELSE
    INSERT INTO public.audit_log(table_name,row_id,action,old_data,new_data,profile_id)
    VALUES (TG_TABLE_NAME, (NEW.id)::text, TG_OP, NULL, to_jsonb(NEW), auth.uid());
    RETURN NEW;
  END IF;
END;
$$;

-- Attach audit triggers to primary tables most critical for provenance
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_site_visit'
  ) THEN
    CREATE TRIGGER trg_audit_site_visit
    AFTER INSERT OR UPDATE OR DELETE ON public.site_visit
    FOR EACH ROW EXECUTE FUNCTION public.fn_log_audit();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_dd_conversion_attempt'
  ) THEN
    CREATE TRIGGER trg_audit_dd_conversion_attempt
    AFTER INSERT OR UPDATE OR DELETE ON public.dd_conversion_attempt
    FOR EACH ROW EXECUTE FUNCTION public.fn_log_audit();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_entitlements_audit'
  ) THEN
    CREATE TRIGGER trg_audit_entitlements_audit
    AFTER INSERT OR UPDATE OR DELETE ON public.entitlements_audit
    FOR EACH ROW EXECUTE FUNCTION public.fn_log_audit();
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_audit_whs_assessment'
  ) THEN
    CREATE TRIGGER trg_audit_whs_assessment
    AFTER INSERT OR UPDATE OR DELETE ON public.whs_assessment
    FOR EACH ROW EXECUTE FUNCTION public.fn_log_audit();
  END IF;
END $$;

COMMIT;