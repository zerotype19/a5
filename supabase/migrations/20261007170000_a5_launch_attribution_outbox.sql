-- Additive launch migration. Apply only after owner review. Requires first_landing_page migration.
-- Existing submission RPC remains unchanged; enable ENABLE_LAUNCH_PIPELINE only after validation.
begin;
create table if not exists public.lead_acquisition (
 lead_id uuid primary key references public.leads(id) on delete cascade,
 first_touch jsonb not null default '{}'::jsonb,
 last_touch jsonb not null default '{}'::jsonb,
 confidence text not null default 'KNOWN' check(confidence in ('KNOWN','UNKNOWN')),
 created_at timestamptz not null default now()
);
alter table public.lead_acquisition enable row level security;
revoke all on public.lead_acquisition from anon, authenticated;
grant all on public.lead_acquisition to service_role;
create table if not exists public.lead_notification_outbox (
 id uuid primary key default gen_random_uuid(),
 lead_id uuid not null references public.leads(id) on delete cascade,
 kind text not null check(kind='operations_new_lead'),
 public_reference text not null,
 status text not null default 'PENDING' check(status in ('PENDING','SENDING','SENT','FAILED')),
 attempts integer not null default 0,
 created_at timestamptz not null default now(),
 locked_at timestamptz,
 sent_at timestamptz,
 last_error text,
 unique(lead_id,kind)
);
alter table public.lead_notification_outbox enable row level security;
revoke all on public.lead_notification_outbox from anon, authenticated;
grant all on public.lead_notification_outbox to service_role;
create or replace function public.submit_project_request_with_acquisition(
 p_submission_key uuid,p_full_name text,p_phone text,p_email text,
 p_preferred_contact public.preferred_contact_method,p_service_selection_status public.service_selection_status,
 p_service_id text,p_postal_code text,p_project_description text,p_urgency text,
 p_first_landing_page text default null,p_acquisition jsonb default null
) returns table(lead_id uuid,public_reference text)
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v record;
begin
 select * into v from public.submit_project_request(p_submission_key,p_full_name,p_phone,p_email,p_preferred_contact,p_service_selection_status,p_service_id,p_postal_code,p_project_description,p_urgency,p_first_landing_page);
 if p_acquisition is not null and octet_length(p_acquisition::text)<=5000 then
  insert into public.lead_acquisition(lead_id,first_touch,last_touch,confidence)
  values(v.lead_id,p_acquisition->'first',p_acquisition->'last','KNOWN') on conflict do nothing;
 end if;
 insert into public.lead_notification_outbox(lead_id,kind,public_reference)
 values(v.lead_id,'operations_new_lead',v.public_reference) on conflict do nothing;
 return query select v.lead_id,v.public_reference;
end $$;
revoke all on function public.submit_project_request_with_acquisition(uuid,text,text,text,public.preferred_contact_method,public.service_selection_status,text,text,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.submit_project_request_with_acquisition(uuid,text,text,text,public.preferred_contact_method,public.service_selection_status,text,text,text,text,text,jsonb) to service_role;
-- Workers claim a small batch atomically. Failed jobs require explicit operator requeue.
create or replace function public.claim_lead_notifications() returns setof public.lead_notification_outbox
language sql security definer set search_path=pg_catalog,public as $$
 update public.lead_notification_outbox set status='SENDING',locked_at=now(),attempts=attempts+1
 where id in (select id from public.lead_notification_outbox where status='PENDING' order by created_at for update skip locked limit 10) returning *;
$$;
revoke all on function public.claim_lead_notifications() from public,anon,authenticated;
grant execute on function public.claim_lead_notifications() to service_role;
commit;
notify pgrst,'reload schema';
