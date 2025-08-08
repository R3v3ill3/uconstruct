
-- Add a phone field to user profiles for admin-editable contact details
alter table public.profiles
  add column if not exists phone text;
