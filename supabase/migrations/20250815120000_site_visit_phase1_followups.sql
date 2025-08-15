-- Site Visit / Compliance Blitz – Phase 1 Follow-ups
-- Applies decisions on defaults, approval metadata, evidence settings, and indexes

BEGIN;

-- 1) Mid-range defaults for WHS ratings
ALTER TABLE public.whs_assessment
  ALTER COLUMN rating_code SET DEFAULT '3';

ALTER TABLE public.whs_breach
  ALTER COLUMN rating_code SET DEFAULT '3';

-- 2) Approval + outcome lock metadata on site_visit
ALTER TABLE public.site_visit
  ADD COLUMN IF NOT EXISTS approved_at timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by_profile_id uuid REFERENCES public.profiles(id),
  ADD COLUMN IF NOT EXISTS outcomes_locked boolean NOT NULL DEFAULT false;

-- 3) Performance indexes
CREATE INDEX IF NOT EXISTS idx_dd_attempt_site_worker ON public.dd_conversion_attempt(site_visit_id, worker_id);
CREATE INDEX IF NOT EXISTS idx_site_visit_lookup ON public.site_visit(job_site_id, employer_id, scheduled_at DESC);

-- 4) Evidence storage defaults via app_settings (idempotent upsert)
INSERT INTO public.app_settings(key, value)
  VALUES
    ('site_visit_evidence_bucket','site-visit-evidence'),
    ('site_visit_evidence_signed_ttl_days','14'),
    ('site_visit_evidence_watermark_enabled','true')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = now();

COMMIT;