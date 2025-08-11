
-- 1) Trigger to auto-tag Builder / Head contractor on project role assignment
drop trigger if exists trg_project_employer_roles_sync_tags on public.project_employer_roles;

create trigger trg_project_employer_roles_sync_tags
after insert or update of role, employer_id on public.project_employer_roles
for each row execute function public.sync_employer_role_tag_from_per();

-- 2) Function + trigger to auto-add trade capability from project trade assignment
create or replace function public.sync_trade_capability_from_pct()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
begin
  if new.employer_id is not null and new.trade_type is not null then
    insert into public.contractor_trade_capabilities (employer_id, trade_type, is_primary)
    select new.employer_id, new.trade_type::public.trade_type, false
    where not exists (
      select 1
      from public.contractor_trade_capabilities c
      where c.employer_id = new.employer_id
        and c.trade_type = new.trade_type::public.trade_type
    );
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_project_contractor_trades_sync_caps on public.project_contractor_trades;

create trigger trg_project_contractor_trades_sync_caps
after insert or update of trade_type, employer_id on public.project_contractor_trades
for each row execute function public.sync_trade_capability_from_pct();

-- 3) Backfill – role tags from existing project roles (enduring, builder/head_contractor only)
insert into public.employer_role_tags (employer_id, tag)
select per.employer_id, (per.role::text)::public.employer_role_tag
from public.project_employer_roles per
where per.role in ('builder','head_contractor')
and not exists (
  select 1
  from public.employer_role_tags ert
  where ert.employer_id = per.employer_id
    and ert.tag = (per.role::text)::public.employer_role_tag
);

-- 4) Backfill – trade capabilities from existing project trade assignments (enduring)
insert into public.contractor_trade_capabilities (employer_id, trade_type, is_primary)
select distinct pct.employer_id, pct.trade_type::public.trade_type, false
from public.project_contractor_trades pct
where pct.employer_id is not null and pct.trade_type is not null
and not exists (
  select 1
  from public.contractor_trade_capabilities c
  where c.employer_id = pct.employer_id
    and c.trade_type = pct.trade_type::public.trade_type
);

-- 5) Helpful indexes to speed filtering
create index if not exists idx_ert_employer_id on public.employer_role_tags (employer_id);
create index if not exists idx_ert_tag on public.employer_role_tags (tag);

create index if not exists idx_ctc_employer_id on public.contractor_trade_capabilities (employer_id);
create index if not exists idx_ctc_trade_type on public.contractor_trade_capabilities (trade_type);
