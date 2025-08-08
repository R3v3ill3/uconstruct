-- Create function to apply pending user role on first login without requiring service role
create or replace function public.apply_pending_user_on_login()
returns void
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_email text;
  v_role text;
begin
  -- Ensure a profile exists for the current user
  if not exists (select 1 from public.profiles where id = auth.uid()) then
    insert into public.profiles (id, email, full_name)
    select au.id, au.email, coalesce(au.raw_user_meta_data->>'full_name', au.email)
    from auth.users au
    where au.id = auth.uid()
    on conflict (id) do nothing;
  end if;

  -- Get the user's email
  select email into v_email from public.profiles where id = auth.uid();

  -- Try to find a matching pending user entry (latest wins)
  select pu.role into v_role
  from public.pending_users pu
  where pu.email = v_email
  order by pu.created_at desc
  limit 1;

  if v_role is not null then
    -- Apply role to profile
    update public.profiles
    set role = v_role,
        updated_at = now()
    where id = auth.uid();

    -- Mark pending user as invited if not already
    update public.pending_users
    set status = coalesce(status, 'invited'),
        invited_at = coalesce(invited_at, now())
    where email = v_email;
  end if;
end;
$$;

grant execute on function public.apply_pending_user_on_login() to authenticated;