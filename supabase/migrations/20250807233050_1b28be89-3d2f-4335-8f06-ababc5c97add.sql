-- Phase 1: Enhanced Roles and Permissions System Implementation

-- 1.1 Create app_role enum first
CREATE TYPE app_role AS ENUM ('admin', 'lead_organiser', 'organiser', 'delegate', 'viewer');

-- 1.2 Extend profiles table with activity status and role
ALTER TABLE public.profiles 
ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;

-- Update role column to use the new enum (migrate existing text values)
ALTER TABLE public.profiles 
ALTER COLUMN role TYPE app_role USING 
  CASE 
    WHEN role = 'admin' THEN 'admin'::app_role
    WHEN role = 'organiser' THEN 'organiser'::app_role
    WHEN role = 'viewer' THEN 'viewer'::app_role
    ELSE 'viewer'::app_role
  END;

-- 1.3 Create user role assignments table (many-to-many)
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

-- 1.4 Create role hierarchy table for Lead Organiser relationships
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

-- 1.5 Create comprehensive organiser allocations table
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

-- 1.6 Create worker-delegate assignments table
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

-- Enable RLS on new tables
ALTER TABLE public.user_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_hierarchy ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organiser_allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.worker_delegate_assignments ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_user_role_assignments_user_active ON public.user_role_assignments(user_id, is_active, start_date, end_date);
CREATE INDEX idx_role_hierarchy_parent ON public.role_hierarchy(parent_user_id, is_active);
CREATE INDEX idx_role_hierarchy_child ON public.role_hierarchy(child_user_id, is_active);
CREATE INDEX idx_organiser_allocations_entity ON public.organiser_allocations(entity_type, entity_id, is_active);
CREATE INDEX idx_worker_delegate_assignments_worker ON public.worker_delegate_assignments(worker_id, is_active);
CREATE INDEX idx_worker_delegate_assignments_delegate ON public.worker_delegate_assignments(delegate_id, is_active);

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