-- Fix security definer view issues by recreating views without security definer
DROP VIEW IF EXISTS public.employer_analytics;
DROP VIEW IF EXISTS public.unallocated_workers_analysis;

-- Create views without security definer to fix security linter warnings
CREATE OR REPLACE VIEW public.employer_analytics AS
SELECT 
    e.id as employer_id,
    e.name as employer_name,
    e.estimated_worker_count,
    COUNT(DISTINCT w.id) as current_worker_count,
    COUNT(DISTINCT CASE WHEN w.union_membership_status = 'member' THEN w.id END) as member_count,
    COUNT(DISTINCT CASE WHEN wp.job_site_id IS NOT NULL THEN w.id END) as workers_with_job_site,
    COUNT(DISTINCT CASE WHEN wp.job_site_id IS NULL THEN w.id END) as workers_without_job_site,
    CASE 
        WHEN COUNT(DISTINCT w.id) > 0 
        THEN ROUND((COUNT(DISTINCT CASE WHEN w.union_membership_status = 'member' THEN w.id END) * 100.0 / COUNT(DISTINCT w.id)), 2)
        ELSE 0 
    END as member_density_percent,
    CASE 
        WHEN e.estimated_worker_count > 0 
        THEN ROUND((COUNT(DISTINCT CASE WHEN w.union_membership_status = 'member' THEN w.id END) * 100.0 / e.estimated_worker_count), 2)
        ELSE 0 
    END as estimated_density_percent
FROM public.employers e
LEFT JOIN public.worker_placements wp ON e.id = wp.employer_id
LEFT JOIN public.workers w ON wp.worker_id = w.id
GROUP BY e.id, e.name, e.estimated_worker_count;

-- Create view for unallocated workers analysis
CREATE OR REPLACE VIEW public.unallocated_workers_analysis AS
SELECT 
    w.id,
    w.first_name,
    w.surname,
    w.member_number,
    w.union_membership_status,
    w.email,
    w.mobile_phone,
    CASE 
        WHEN wp.employer_id IS NULL THEN 'no_employer'
        WHEN wp.job_site_id IS NULL THEN 'no_job_site'
        ELSE 'allocated'
    END as allocation_status,
    wp.employer_id,
    wp.job_site_id,
    e.name as employer_name,
    js.name as job_site_name
FROM public.workers w
LEFT JOIN public.worker_placements wp ON w.id = wp.worker_id
LEFT JOIN public.employers e ON wp.employer_id = e.id
LEFT JOIN public.job_sites js ON wp.job_site_id = js.id
WHERE wp.employer_id IS NULL OR wp.job_site_id IS NULL OR wp.id IS NULL;