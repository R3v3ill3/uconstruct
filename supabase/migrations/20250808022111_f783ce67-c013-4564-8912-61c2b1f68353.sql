
-- Expand the allowed set of roles in profiles.role

alter table public.profiles
  drop constraint if exists profiles_role_check;

alter table public.profiles
  add constraint profiles_role_check
  check (
    role is null
    or role in ('admin', 'lead_organiser', 'organiser', 'delegate', 'viewer')
  );
