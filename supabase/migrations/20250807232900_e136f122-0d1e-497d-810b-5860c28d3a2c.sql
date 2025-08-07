-- Phase 1: Enhanced Roles and Permissions System Implementation

-- 1.1 Extend profiles table with activity status
ALTER TABLE public.profiles 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;

-- Update role enum to include Lead Organiser
ALTER TYPE app_role RENAME TO app_role_old;
CREATE TYPE app_role AS ENUM ('admin', 'lead_organiser', 'organiser', 'delegate', 'viewer');

-- Migrate existing role data
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE app_role USING role::text::app_role;

-- Drop old enum
DROP TYPE app_role_old;

-- 1.2 Create user role assignments table (many-to-many)
CREATE TABLE public.user_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    assigned_by UUID REFERENCES public.profiles(id),
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(user_id, role, start_date)
);

-- 1.3 Create role hierarchy table for Lead Organiser relationships
CREATE TABLE public.role_hierarchy (
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

-- 1.4 Create comprehensive organiser allocations table
CREATE TABLE public.organiser_allocations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('project', 'job_site', 'employer')),
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

-- 1.5 Create worker-delegate assignments table
CREATE TABLE public.worker_delegate_assignments (
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

-- 1.6 Create entity fields definition table
CREATE TABLE public.entity_fields (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_type TEXT NOT NULL CHECK (entity_type IN ('workers', 'employers', 'projects', 'job_sites', 'company_eba_records', 'union_activities')),
    field_name TEXT NOT NULL,
    field_label TEXT NOT NULL,
    field_type TEXT NOT NULL CHECK (field_type IN ('text', 'email', 'phone', 'date', 'number', 'boolean', 'array', 'select')),
    is_sensitive BOOLEAN NOT NULL DEFAULT false,
    is_required BOOLEAN NOT NULL DEFAULT false,
    default_viewable BOOLEAN NOT NULL DEFAULT true,
    default_editable BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(entity_type, field_name)
);

-- 1.7 Create field permissions table
CREATE TABLE public.field_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entity_field_id UUID NOT NULL REFERENCES public.entity_fields(id) ON DELETE CASCADE,
    role app_role NOT NULL,
    can_view BOOLEAN NOT NULL DEFAULT true,
    can_edit BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(entity_field_id, role)
);

-- 1.8 Create delegate field permissions table (organiser-defined)
CREATE TABLE public.delegate_field_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organiser_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    entity_field_id UUID NOT NULL REFERENCES public.entity_fields(id) ON DELETE CASCADE,
    can_edit BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(organiser_id, entity_field_id)
);

-- 1.9 Add date ranges to existing relationship tables
ALTER TABLE public.worker_placements 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.site_employers 
ADD COLUMN start_date DATE NOT NULL DEFAULT CURRENT_DATE,
ADD COLUMN end_date DATE,
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now();

-- 1.10 Create project-job site links table
CREATE TABLE public.project_job_site_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
    job_site_id UUID NOT NULL REFERENCES public.job_sites(id) ON DELETE CASCADE,
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(project_id, job_site_id, start_date)
);

-- 1.11 Create audit log table
CREATE TABLE public.permission_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    field_name TEXT,
    old_value TEXT,
    new_value TEXT,
    access_method TEXT, -- 'direct', 'inherited', 'emergency'
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organiser_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_delegate_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entity_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.field_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delegate_field_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_job_site_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permission_audit_log ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_user_role_assignments_user_active ON public.user_role_assignments(user_id, is_active, start_date, end_date);
CREATE INDEX idx_role_hierarchy_parent ON public.role_hierarchy(parent_user_id, is_active);
CREATE INDEX idx_role_hierarchy_child ON public.role_hierarchy(child_user_id, is_active);
CREATE INDEX idx_organiser_allocations_entity ON public.organiser_allocations(entity_type, entity_id, is_active);
CREATE INDEX idx_worker_delegate_assignments_worker ON public.worker_delegate_assignments(worker_id, is_active);
CREATE INDEX idx_worker_delegate_assignments_delegate ON public.worker_delegate_assignments(delegate_id, is_active);
CREATE INDEX idx_permission_audit_log_user_time ON public.permission_audit_log(user_id, created_at);

-- Add triggers for updated_at columns
CREATE TRIGGER update_user_role_assignments_updated_at
    BEFORE UPDATE ON public.user_role_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_role_hierarchy_updated_at
    BEFORE UPDATE ON public.role_hierarchy
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organiser_allocations_updated_at
    BEFORE UPDATE ON public.organiser_allocations
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_worker_delegate_assignments_updated_at
    BEFORE UPDATE ON public.worker_delegate_assignments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_entity_fields_updated_at
    BEFORE UPDATE ON public.entity_fields
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_field_permissions_updated_at
    BEFORE UPDATE ON public.field_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_delegate_field_permissions_updated_at
    BEFORE UPDATE ON public.delegate_field_permissions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_employers_updated_at
    BEFORE UPDATE ON public.site_employers
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_project_job_site_links_updated_at
    BEFORE UPDATE ON public.project_job_site_links
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();