-- Owner-requested public vendor signup. Additive; no existing vendor changes.
-- Apply before enabling ENABLE_VENDOR_SIGNUP. No anon/authenticated table or RPC access.
create table public.vendor_signups (
  id uuid primary key default gen_random_uuid(),
  submission_key uuid not null unique,
  payload jsonb not null,
  consent_version text not null,
  consented_at timestamptz not null default now(),
  status text not null default 'PENDING' check (status in ('PENDING','CREATED','LINKED','DISMISSED')),
  vendor_id uuid references public.vendors(id),
  reviewed_by uuid references auth.users(id),
  reviewed_at timestamptz,
  review_note text check (char_length(review_note)<=1000),
  created_at timestamptz not null default now(),
  constraint signup_payload_object check (jsonb_typeof(payload)='object'),
  constraint signup_review_state check (
    (status='PENDING' and reviewed_by is null and reviewed_at is null and vendor_id is null) or
    (status='DISMISSED' and reviewed_by is not null and reviewed_at is not null and vendor_id is null) or
    (status in ('CREATED','LINKED') and reviewed_by is not null and reviewed_at is not null and vendor_id is not null)
  )
);
create index vendor_signups_queue_idx on public.vendor_signups(status,created_at);
create index vendor_signups_email_idx on public.vendor_signups((payload->>'email'),created_at);
alter table public.vendor_signups enable row level security;
revoke all on public.vendor_signups from anon, authenticated;
grant select,insert,update on public.vendor_signups to service_role;
comment on table public.vendor_signups is 'Private self-submissions, immutable submitted payload and explicit operator review. No public vendor accounts.';

create function public.submit_vendor_signup(p_submission_key uuid,p_payload jsonb,p_consent_version text)
returns table(ok boolean,error_code text)
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_existing jsonb; v_email text; v_key text;
begin
  if p_submission_key is null or p_consent_version is distinct from '2026-10-08' or jsonb_typeof(p_payload) is distinct from 'object' or octet_length(p_payload::text)>30000 then
    return query select false,'invalid_input'::text;return;
  end if;
  foreach v_key in array array['businessName','contactName','email','phone','website','notes'] loop
    if jsonb_typeof(p_payload->v_key) is distinct from 'string' then return query select false,'invalid_input'::text;return;end if;
  end loop;
  v_email=p_payload->>'email';
  if char_length(btrim(p_payload->>'businessName')) not between 1 and 160 or
     char_length(btrim(p_payload->>'contactName')) not between 1 and 160 or
     char_length(v_email)>200 or v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' or
     v_email<>lower(btrim(v_email)) or
     char_length(p_payload->>'phone')>32 or char_length(p_payload->>'website')>300 or
     char_length(p_payload->>'notes')>2000 or p_payload->'consent' is distinct from 'true'::jsonb or
     jsonb_typeof(p_payload->'serviceIds') is distinct from 'array' or jsonb_typeof(p_payload->'locationIds') is distinct from 'array' then
    return query select false,'invalid_input'::text;return;
  end if;
  if jsonb_array_length(p_payload->'serviceIds') < 1 or jsonb_array_length(p_payload->'serviceIds') > (select count(*) from public.services) or
     jsonb_array_length(p_payload->'locationIds') < 1 or jsonb_array_length(p_payload->'locationIds') > (select count(*) from public.locations) or
     exists(select 1 from jsonb_array_elements_text(p_payload->'serviceIds') x(value) where not exists(select 1 from public.services s where s.id=x.value)) or
     exists(select 1 from jsonb_array_elements_text(p_payload->'locationIds') x(value) where not exists(select 1 from public.locations l where l.id=x.value)) then
    return query select false,'invalid_coverage'::text;return;
  end if;
  -- Serialize submissions for the same email; bound repeated abuse across workers.
  perform pg_advisory_xact_lock(hashtextextended('signup-email:'||v_email,0));
  select s.payload into v_existing from public.vendor_signups s where s.submission_key=p_submission_key;
  if found then return query select v_existing=p_payload,case when v_existing=p_payload then null::text else 'key_conflict' end;return;end if;
  if (select count(*) from public.vendor_signups s where s.payload->>'email'=v_email and s.created_at>now()-interval '24 hours')>=3 then
    return query select false,'rate_limited'::text;return;
  end if;
  insert into public.vendor_signups(submission_key,payload,consent_version)
  values(p_submission_key,p_payload,p_consent_version) on conflict(submission_key) do nothing;
  select s.payload into v_existing from public.vendor_signups s where s.submission_key=p_submission_key;
  return query select v_existing=p_payload,case when v_existing=p_payload then null::text else 'key_conflict' end;
end;$$;
revoke all on function public.submit_vendor_signup(uuid,jsonb,text) from public,anon,authenticated;
grant execute on function public.submit_vendor_signup(uuid,jsonb,text) to service_role;

create function public.admin_review_vendor_signup(p_signup_id uuid,p_action text,p_vendor_id uuid,p_actor_user_id uuid,p_note text default null)
returns table(ok boolean,error_code text,vendor_id uuid)
language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_signup public.vendor_signups%rowtype;v_id uuid;
begin
  if not exists(select 1 from public.admin_users a where a.user_id=p_actor_user_id and a.active=true) then
    return query select false,'forbidden'::text,null::uuid;return;
  end if;
  if p_action is null or p_action not in ('create','link','dismiss') or char_length(coalesce(p_note,''))>1000 then
    return query select false,'invalid_input'::text,null::uuid;return;
  end if;
  select * into v_signup from public.vendor_signups s where s.id=p_signup_id for update;
  if not found then return query select false,'not_found'::text,null::uuid;return;end if;
  if v_signup.status<>'PENDING' then return query select false,'already_reviewed'::text,v_signup.vendor_id;return;end if;
  if p_action='link' then
    select v.id into v_id from public.vendors v where v.id=p_vendor_id;
    if v_id is null then return query select false,'vendor_not_found'::text,null::uuid;return;end if;
    -- Deliberately do not overwrite existing contact, coverage, status or history.
  elsif p_action='create' then
    -- Same name OR email should be reviewed against the existing record.
    -- One lock also handles different names sharing a delivery email.
    perform pg_advisory_xact_lock(hashtextextended('signup-review-create',0));
    if exists(select 1 from public.vendors v where lower(btrim(v.business_name))=lower(v_signup.payload->>'businessName') or lower(btrim(v.email))=v_signup.payload->>'email') then
      return query select false,'possible_duplicate'::text,null::uuid;return;
    end if;
    insert into public.vendors(business_name,contact_name,email,phone,website,source,discovery_notes,status,accepting_leads,insurance_verified)
    values(v_signup.payload->>'businessName',v_signup.payload->>'contactName',v_signup.payload->>'email',nullif(v_signup.payload->>'phone',''),nullif(v_signup.payload->>'website',''),'Vendor self-signup',nullif(v_signup.payload->>'notes',''),'DISCOVERED',false,false)
    returning id into v_id;
    insert into public.vendor_services(vendor_id,service_id) select v_id,x.value from (select distinct value from jsonb_array_elements_text(v_signup.payload->'serviceIds')) x;
    insert into public.vendor_locations(vendor_id,location_id) select v_id,x.value from (select distinct value from jsonb_array_elements_text(v_signup.payload->'locationIds')) x;
  end if;
  update public.vendor_signups s set status=case p_action when 'create' then 'CREATED' when 'link' then 'LINKED' else 'DISMISSED' end,
    vendor_id=v_id,reviewed_by=p_actor_user_id,reviewed_at=now(),review_note=nullif(btrim(p_note),'') where s.id=p_signup_id;
  return query select true,null::text,v_id;
end;$$;
revoke all on function public.admin_review_vendor_signup(uuid,text,uuid,uuid,text) from public,anon,authenticated;
grant execute on function public.admin_review_vendor_signup(uuid,text,uuid,uuid,text) to service_role;
