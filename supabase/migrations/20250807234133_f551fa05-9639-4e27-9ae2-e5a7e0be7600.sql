-- Enhanced Roles & Permissions: Phase 1 (text-based roles to avoid enum conflicts)

-- 0) Extend profiles safely
ALTER TABLE public.profiles 
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE;

-- 1) Core tables
CREATE TABLE IF NOT EXISTS public.user_role_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin','lead_organiser','organiser','delegate','viewer')),
  assigned_by UUID REFERENCES public.profiles(id),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, role, start_date)
);

CREATE TABLE IF NOT EXISTS public.role_hierarchy (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  child_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  assigned_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(parent_user_id, child_user_id, start_date)
);

CREATE TABLE IF NOT EXISTS public.organiser_allocations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('project','job_site','employer')),
  entity_id UUID NOT NULL,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  allocated_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organiser_id, entity_type, entity_id, start_date)
);

CREATE TABLE IF NOT EXISTS public.worker_delegate_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  worker_id UUID NOT NULL REFERENCES public.workers(id) ON DELETE CASCADE,
  delegate_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  assigned_by UUID NOT NULL REFERENCES public.profiles(id),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  is_active BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(worker_id, delegate_id, start_date)
);

-- Field-level permissions
CREATE TABLE IF NOT EXISTS public.entity_fields (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('workers','employers','projects','job_sites','company_eba_records','union_activities')),
  field_name TEXT NOT NULL,
  field_label TEXT NOT NULL,
  field_type TEXT NOT NULL CHECK (field_type IN ('text','email','phone','date','number','boolean','array','select')),
  is_sensitive BOOLEAN NOT NULL DEFAULT false,
  is_required BOOLEAN NOT NULL DEFAULT false,
  default_viewable BOOLEAN NOT NULL DEFAULT true,
  default_editable BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(entity_type, field_name)
);

CREATE TABLE IF NOT EXISTS public.field_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_field_id UUID NOT NULL REFERENCES public.entity_fields(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin','lead_organiser','organiser','delegate','viewer')),
  can_view BOOLEAN NOT NULL DEFAULT true,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(entity_field_id, role)
);

CREATE TABLE IF NOT EXISTS public.delegate_field_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  entity_field_id UUID NOT NULL REFERENCES public.entity_fields(id) ON DELETE CASCADE,
  can_edit BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(organiser_id, entity_field_id)
);

CREATE TABLE IF NOT EXISTS public.permission_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  field_name TEXT,
  old_value TEXT,
  new_value TEXT,
  access_method TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 2) Helper functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = _user_id AND p.role = _role
  ) OR EXISTS (
    SELECT 1 FROM public.user_role_assignments ura
    WHERE ura.user_id = _user_id
      AND ura.role = _role
      AND ura.is_active
      AND ura.start_date <= CURRENT_DATE
      AND (ura.end_date IS NULL OR ura.end_date >= CURRENT_DATE)
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.has_role(auth.uid(), 'admin');
$$;

CREATE OR REPLACE FUNCTION public.is_lead_of(_parent uuid, _child uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.role_hierarchy rh
    WHERE rh.parent_user_id = _parent
      AND rh.child_user_id = _child
      AND rh.is_active
      AND rh.start_date <= CURRENT_DATE
      AND (rh.end_date IS NULL OR rh.end_date >= CURRENT_DATE)
  );
$$;

-- 3) Enable RLS
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organiser_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_delegate_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegate_field_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_audit_log ENABLE ROW LEVEL SECURITY;

-- 4) RLS policies
-- user_role_assignments
DROP POLICY IF EXISTS "ura_select" ON public.user_role_assignments;
DROP POLICY IF EXISTS "ura_modify" ON public.user_role_assignments;
CREATE POLICY "ura_select" ON public.user_role_assignments
FOR SELECT TO authenticated
USING (public.is_admin() OR user_id = auth.uid());
CREATE POLICY "ura_modify" ON public.user_role_assignments
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- role_hierarchy
DROP POLICY IF EXISTS "rh_select" ON public.role_hierarchy;
DROP POLICY IF EXISTS "rh_modify" ON public.role_hierarchy;
CREATE POLICY "rh_select" ON public.role_hierarchy
FOR SELECT TO authenticated
USING (public.is_admin() OR parent_user_id = auth.uid() OR child_user_id = auth.uid());
CREATE POLICY "rh_modify" ON public.role_hierarchy
FOR ALL TO authenticated
USING (public.is_admin() OR (public.has_role(auth.uid(),'lead_organiser') AND parent_user_id = auth.uid()))
WITH CHECK (public.is_admin() OR (public.has_role(auth.uid(),'lead_organiser') AND parent_user_id = auth.uid()));

-- organiser_allocations
DROP POLICY IF EXISTS "oa_select" ON public.organiser_allocations;
DROP POLICY IF EXISTS "oa_modify" ON public.organiser_allocations;
CREATE POLICY "oa_select" ON public.organiser_allocations
FOR SELECT TO authenticated
USING (true);
CREATE POLICY "oa_modify" ON public.organiser_allocations
FOR ALL TO authenticated
USING (
  public.is_admin() OR (
    public.has_role(auth.uid(),'lead_organiser') AND public.is_lead_of(auth.uid(), organiser_id)
  )
)
WITH CHECK (
  public.is_admin() OR (
    public.has_role(auth.uid(),'lead_organiser') AND public.is_lead_of(auth.uid(), organiser_id)
  )
);

-- worker_delegate_assignments
DROP POLICY IF EXISTS "wda_select" ON public.worker_delegate_assignments;
DROP POLICY IF EXISTS "wda_modify" ON public.worker_delegate_assignments;
CREATE POLICY "wda_select" ON public.worker_delegate_assignments
FOR SELECT TO authenticated
USING (public.is_admin() OR public.has_role(auth.uid(),'organiser') OR delegate_id = auth.uid());
CREATE POLICY "wda_modify" ON public.worker_delegate_assignments
FOR ALL TO authenticated
USING (public.is_admin() OR public.has_role(auth.uid(),'organiser'))
WITH CHECK (public.is_admin() OR public.has_role(auth.uid(),'organiser'));

-- entity_fields
DROP POLICY IF EXISTS "ef_select" ON public.entity_fields;
DROP POLICY IF EXISTS "ef_modify" ON public.entity_fields;
CREATE POLICY "ef_select" ON public.entity_fields
FOR SELECT TO authenticated
USING (true);
CREATE POLICY "ef_modify" ON public.entity_fields
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- field_permissions
DROP POLICY IF EXISTS "fp_select" ON public.field_permissions;
DROP POLICY IF EXISTS "fp_modify" ON public.field_permissions;
CREATE POLICY "fp_select" ON public.field_permissions
FOR SELECT TO authenticated
USING (true);
CREATE POLICY "fp_modify" ON public.field_permissions
FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- delegate_field_permissions
DROP POLICY IF EXISTS "dfp_select" ON public.delegate_field_permissions;
DROP POLICY IF EXISTS "dfp_modify" ON public.delegate_field_permissions;
CREATE POLICY "dfp_select" ON public.delegate_field_permissions
FOR SELECT TO authenticated
USING (public.is_admin() OR organiser_id = auth.uid());
CREATE POLICY "dfp_modify" ON public.delegate_field_permissions
FOR ALL TO authenticated
USING (public.is_admin() OR organiser_id = auth.uid())
WITH CHECK (public.is_admin() OR organiser_id = auth.uid());

-- permission_audit_log (admin-only for now)
DROP POLICY IF EXISTS "pal_select" ON public.permission_audit_log;
DROP POLICY IF EXISTS "pal_modify" ON public.permission_audit_log;
CREATE POLICY "pal_select" ON public.permission_audit_log
FOR SELECT TO authenticated
USING (public.is_admin());
CREATE POLICY "pal_modify" ON public.permission_audit_log
FOR INSERT TO authenticated
WITH CHECK (public.is_admin());

-- 5) Indexes
CREATE INDEX IF NOT EXISTS idx_ura_user_active ON public.user_role_assignments(user_id, is_active, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_rh_parent ON public.role_hierarchy(parent_user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_rh_child ON public.role_hierarchy(child_user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_oa_entity ON public.organiser_allocations(entity_type, entity_id, is_active);
CREATE INDEX IF NOT EXISTS idx_wda_worker ON public.worker_delegate_assignments(worker_id, is_active);
CREATE INDEX IF NOT EXISTS idx_wda_delegate ON public.worker_delegate_assignments(delegate_id, is_active);

-- 6) Triggers for updated_at
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_ura_updated_at'
  ) THEN
    CREATE TRIGGER update_ura_updated_at
      BEFORE UPDATE ON public.user_role_assignments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_rh_updated_at'
  ) THEN
    CREATE TRIGGER update_rh_updated_at
      BEFORE UPDATE ON public.role_hierarchy
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_oa_updated_at'
  ) THEN
    CREATE TRIGGER update_oa_updated_at
      BEFORE UPDATE ON public.organiser_allocations
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'update_wda_updated_at'
  ) THEN
    CREATE TRIGGER update_wda_updated_at
      BEFORE UPDATE ON public.worker_delegate_assignments
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;