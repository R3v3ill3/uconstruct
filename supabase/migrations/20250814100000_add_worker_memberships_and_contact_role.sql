-- Add worker_memberships for dues/payment tracking, add 'contact' to union roles, and extend EBA records with document URLs

-- 1) Enums for payment method and direct debit status
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method_type') THEN
        CREATE TYPE public.payment_method_type AS ENUM (
            'direct_debit',
            'payroll_deduction',
            'cash',
            'card',
            'unknown'
        );
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'dd_status_type') THEN
        CREATE TYPE public.dd_status_type AS ENUM (
            'not_started',
            'in_progress',
            'active',
            'failed'
        );
    END IF;
END
$$;

-- 2) worker_memberships (1:1 with workers)
CREATE TABLE IF NOT EXISTS public.worker_memberships (
    worker_id uuid PRIMARY KEY REFERENCES public.workers(id) ON DELETE CASCADE,
    payment_method public.payment_method_type NOT NULL DEFAULT 'unknown',
    dd_status public.dd_status_type NOT NULL DEFAULT 'not_started',
    dd_mandate_id text,
    arrears_amount numeric(12,2) DEFAULT 0,
    last_payment_at timestamptz,
    notes text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

-- Indexes for reporting
CREATE INDEX IF NOT EXISTS idx_worker_memberships_payment_method ON public.worker_memberships(payment_method);
CREATE INDEX IF NOT EXISTS idx_worker_memberships_dd_status ON public.worker_memberships(dd_status);

-- RLS for worker_memberships
ALTER TABLE public.worker_memberships ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read memberships for workers they can access (or admins)
DROP POLICY IF EXISTS "wm_select" ON public.worker_memberships;
CREATE POLICY "wm_select" ON public.worker_memberships
FOR SELECT TO authenticated
USING (
    public.is_admin() OR EXISTS (
        SELECT 1 FROM public.get_accessible_workers(auth.uid()) aw
        WHERE aw.worker_id = worker_id
    )
);

-- Allow authenticated users to modify memberships for accessible workers (or admins)
DROP POLICY IF EXISTS "wm_modify" ON public.worker_memberships;
CREATE POLICY "wm_modify" ON public.worker_memberships
FOR ALL TO authenticated
USING (
    public.is_admin() OR EXISTS (
        SELECT 1 FROM public.get_accessible_workers(auth.uid()) aw
        WHERE aw.worker_id = worker_id
    )
)
WITH CHECK (
    public.is_admin() OR EXISTS (
        SELECT 1 FROM public.get_accessible_workers(auth.uid()) aw
        WHERE aw.worker_id = worker_id
    )
);

-- Trigger for updated_at maintenance
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_trigger WHERE tgname = 'update_worker_memberships_updated_at'
    ) THEN
        CREATE TRIGGER update_worker_memberships_updated_at
        BEFORE UPDATE ON public.worker_memberships
        FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;

-- 3) Add 'contact' to union_role_type enum if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_enum e
        JOIN pg_type t ON e.enumtypid = t.oid
        WHERE t.typname = 'union_role_type' AND e.enumlabel = 'contact'
    ) THEN
        ALTER TYPE public.union_role_type ADD VALUE 'contact';
    END IF;
END
$$;

-- 4) Extend company_eba_records with document URL fields (optional, additive)
ALTER TABLE public.company_eba_records
    ADD COLUMN IF NOT EXISTS eba_document_url text,
    ADD COLUMN IF NOT EXISTS wage_rates_url text,
    ADD COLUMN IF NOT EXISTS summary_url text;