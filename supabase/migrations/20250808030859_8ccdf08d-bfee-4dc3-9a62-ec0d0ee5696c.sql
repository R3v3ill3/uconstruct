
-- 1) Enum for project-scoped roles
create type if not exists public.project_employer_role as enum (
  'head_contractor',
  'contractor',
  'trade_subcontractor'
);

-- 2) Table for project/employer role assignments with history
create table if not exists public.project_employer_roles (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  employer_id uuid not null references public.employers(id) on delete cascade,
  role public.project_employer_role not null,
  start_date date not null default current_date,
  end_date date null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Helpful indexes
create index if not exists idx_per_project on public.project_employer_roles(project_id);
create index if not exists idx_per_employer on public.project_employer_roles(employer_id);
create index if not exists idx_per_role on public.project_employer_roles(role);

-- At most ONE active assignment per (project, employer)
create unique index if not exists uq_active_role_per_project_employer
  on public.project_employer_roles(project_id, employer_id)
  where end_date is null;

-- At most ONE active head contractor per project
create unique index if not exists uq_active_head_contractor_per_project
  on public.project_employer_roles(project_id)
  where end_date is null and role = 'head_contractor';

-- Auto-update updated_at on updates
drop trigger if exists trg_per_set_timestamp on public.project_employer_roles;
create trigger trg_per_set_timestamp
  before update on public.project_employer_roles
  for each row
  execute function public.update_updated_at_column();

-- 3) Row Level Security
alter table public.project_employer_roles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'project_employer_roles' and policyname = 'Admins and organisers can manage project employer roles'
  ) then
    create policy "Admins and organisers can manage project employer roles"
      on public.project_employer_roles
      as restrictive
      for all
      to authenticated
      using (get_user_role(auth.uid()) = any (array['admin','organiser']))
      with check (get_user_role(auth.uid()) = any (array['admin','organiser']));
  end if;

  if not exists (
    select 1 from pg_policies 
    where schemaname = 'public' and tablename = 'project_employer_roles' and policyname = 'Authenticated users can view project employer roles'
  ) then
    create policy "Authenticated users can view project employer roles"
      on public.project_employer_roles
      as restrictive
      for select
      to authenticated
      using (true);
  end if;
end$$;

-- 4) Views to simplify querying

-- Current active roles per project/employer
create or replace view public.v_project_current_roles as
select project_id, employer_id, role
from public.project_employer_roles
where end_date is null;

-- Current head contractor per project
create or replace view public.v_project_head_contractor as
select project_id, employer_id
from public.project_employer_roles
where end_date is null and role = 'head_contractor';
