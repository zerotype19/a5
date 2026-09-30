-- TASK A5-008: Vendor model + manual lead assignment
-- CHANGE:
--   1) vendors, vendor_services, vendor_locations, lead_assignments
--   2) admin_upsert_vendor and admin_assign_lead_to_vendor (service_role only)
--   3) generic status RPC refuses to_status ASSIGNED
-- REASON: Owner can manually assign a qualified, classified lead to one eligible vendor
-- DESTRUCTIVE: NO
-- OWNER APPROVAL: A5-008 task authorization
-- DO NOT APPLY TO PRODUCTION without explicit owner approval
-- Does not alter authority/content tables.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.vendor_status as enum (
  'DISCOVERED',
  'APPROVED',
  'ACTIVE',
  'PAUSED',
  'INACTIVE'
);

create type public.lead_assignment_status as enum (
  'ASSIGNED',
  'ACCEPTED',
  'PASSED',
  'CANCELLED'
);

comment on type public.lead_assignment_status is
  'Vendor-routing history. Distinct from public.lead_status. Lead status ASSIGNED is the opportunity lifecycle, not this enum.';

-- ---------------------------------------------------------------------------
-- vendors
-- ---------------------------------------------------------------------------

create table public.vendors (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  contact_name text,
  phone text,
  email text,
  website text,
  source text,
  source_url text,
  discovery_notes text,
  status public.vendor_status not null default 'DISCOVERED',
  accepting_leads boolean not null default false,
  registration_number text,
  license_number text,
  insurance_verified boolean not null default false,
  credentials_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint vendors_business_name_len check (char_length(business_name) between 1 and 160),
  constraint vendors_contact_name_len check (
    contact_name is null or char_length(contact_name) between 1 and 160
  ),
  constraint vendors_phone_len check (
    phone is null or char_length(phone) between 7 and 32
  ),
  constraint vendors_email_len check (
    email is null or char_length(email) between 3 and 200
  ),
  constraint vendors_website_len check (
    website is null or char_length(website) between 8 and 300
  ),
  constraint vendors_source_len check (
    source is null or char_length(source) between 1 and 80
  ),
  constraint vendors_source_url_len check (
    source_url is null or char_length(source_url) between 8 and 500
  ),
  constraint vendors_discovery_notes_len check (
    discovery_notes is null or char_length(discovery_notes) between 1 and 2000
  ),
  constraint vendors_accepting_requires_active check (
    accepting_leads = false or status = 'ACTIVE'
  ),
  constraint vendors_registration_len check (
    registration_number is null or char_length(registration_number) between 1 and 80
  ),
  constraint vendors_license_len check (
    license_number is null or char_length(license_number) between 1 and 80
  ),
  constraint vendors_credentials_notes_len check (
    credentials_notes is null or char_length(credentials_notes) between 1 and 2000
  )
);

comment on table public.vendors is
  'A5-008 fulfillment partners. No public directory. No vendor login. Credential fields are operational notes, not a licensing model.';

create index vendors_status_idx on public.vendors (status);

alter table public.vendors enable row level security;

create policy vendors_deny_all on public.vendors
  for all to anon, authenticated
  using (false)
  with check (false);

-- ---------------------------------------------------------------------------
-- coverage
-- ---------------------------------------------------------------------------

create table public.vendor_services (
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  service_id text not null references public.services (id),
  primary key (vendor_id, service_id)
);

comment on table public.vendor_services is
  'A5-008 vendor coverage. service_id must be a canonical services.id.';

create index vendor_services_service_id_idx on public.vendor_services (service_id);

alter table public.vendor_services enable row level security;

create policy vendor_services_deny_all on public.vendor_services
  for all to anon, authenticated
  using (false)
  with check (false);

create table public.vendor_locations (
  vendor_id uuid not null references public.vendors (id) on delete cascade,
  location_id text not null references public.locations (id),
  primary key (vendor_id, location_id)
);

comment on table public.vendor_locations is
  'A5-008 vendor coverage. location_id must be a canonical locations.id. No ZIP radius.';

create index vendor_locations_location_id_idx on public.vendor_locations (location_id);

alter table public.vendor_locations enable row level security;

create policy vendor_locations_deny_all on public.vendor_locations
  for all to anon, authenticated
  using (false)
  with check (false);

-- ---------------------------------------------------------------------------
-- assignments
-- ---------------------------------------------------------------------------

create table public.lead_assignments (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id),
  vendor_id uuid not null references public.vendors (id),
  status public.lead_assignment_status not null default 'ASSIGNED',
  assigned_at timestamptz not null default now(),
  assigned_by uuid not null references auth.users (id),
  accepted_at timestamptz,
  passed_at timestamptz,
  pass_reason text,
  constraint lead_assignments_pass_reason_len check (
    pass_reason is null or char_length(pass_reason) between 1 and 500
  )
);

comment on table public.lead_assignments is
  'A5-008 vendor-routing history. Separate from leads.status. At most one ASSIGNED or ACCEPTED row per lead.';

create index lead_assignments_lead_id_idx
  on public.lead_assignments (lead_id, assigned_at desc);

create unique index lead_assignments_one_open_idx
  on public.lead_assignments (lead_id)
  where status in ('ASSIGNED', 'ACCEPTED');

alter table public.lead_assignments enable row level security;

create policy lead_assignments_deny_all on public.lead_assignments
  for all to anon, authenticated
  using (false)
  with check (false);

-- ---------------------------------------------------------------------------
-- Generic transition cannot invent ASSIGNED
-- ---------------------------------------------------------------------------

create or replace function public.admin_transition_lead_status(
  p_lead_id uuid,
  p_expected_status public.lead_status,
  p_to_status public.lead_status,
  p_event_type text,
  p_actor_user_id uuid,
  p_note text default null
)
returns table (
  ok boolean,
  error_code text,
  from_status public.lead_status,
  to_status public.lead_status
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_current public.lead_status;
begin
  if p_to_status = 'ASSIGNED' then
    return query select false, 'assignment_required'::text, p_expected_status, p_to_status;
    return;
  end if;

  if p_lead_id is null then
    return query select false, 'invalid_lead_id'::text, null::public.lead_status, null::public.lead_status;
    return;
  end if;

  if p_expected_status is null or p_to_status is null then
    return query select false, 'invalid_status'::text, null::public.lead_status, null::public.lead_status;
    return;
  end if;

  if p_actor_user_id is null then
    return query select false, 'actor_required'::text, null::public.lead_status, null::public.lead_status;
    return;
  end if;

  if p_event_type is null or length(trim(p_event_type)) = 0 then
    return query select false, 'invalid_event_type'::text, null::public.lead_status, null::public.lead_status;
    return;
  end if;

  if p_expected_status = p_to_status then
    return query select false, 'noop_transition'::text, p_expected_status, p_to_status;
    return;
  end if;

  select l.status
    into v_current
  from public.leads l
  where l.id = p_lead_id
  for update;

  if v_current is null then
    return query select false, 'lead_not_found'::text, null::public.lead_status, null::public.lead_status;
    return;
  end if;

  if v_current is distinct from p_expected_status then
    return query select false, 'stale_status'::text, v_current, p_to_status;
    return;
  end if;

  update public.leads
     set status = p_to_status,
         updated_at = now()
   where id = p_lead_id
     and status = p_expected_status;

  if not found then
    return query select false, 'stale_status'::text, v_current, p_to_status;
    return;
  end if;

  insert into public.lead_status_events (
    lead_id,
    from_status,
    to_status,
    event_type,
    occurred_at,
    note,
    actor_user_id
  ) values (
    p_lead_id,
    p_expected_status,
    p_to_status,
    trim(p_event_type),
    now(),
    nullif(trim(coalesce(p_note, '')), ''),
    p_actor_user_id
  );

  return query select true, null::text, p_expected_status, p_to_status;
end;
$$;

comment on function public.admin_transition_lead_status(
  uuid, public.lead_status, public.lead_status, text, uuid, text
) is
  'A5-007 atomic status change. A5-008: refuses to_status ASSIGNED. Assignment uses admin_assign_lead_to_vendor.';

-- ---------------------------------------------------------------------------
-- Upsert vendor + replace coverage
-- ---------------------------------------------------------------------------

create or replace function public.admin_upsert_vendor(
  p_vendor_id uuid,
  p_business_name text,
  p_contact_name text,
  p_phone text,
  p_email text,
  p_website text,
  p_source text,
  p_source_url text,
  p_discovery_notes text,
  p_status public.vendor_status,
  p_accepting_leads boolean,
  p_registration_number text,
  p_license_number text,
  p_insurance_verified boolean,
  p_credentials_notes text,
  p_service_ids text[],
  p_location_ids text[],
  p_actor_user_id uuid
)
returns table (
  ok boolean,
  error_code text,
  vendor_id uuid
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_id uuid;
  v_service text;
  v_location text;
begin
  if p_actor_user_id is null then
    return query select false, 'actor_required'::text, null::uuid;
    return;
  end if;

  if p_business_name is null or char_length(trim(p_business_name)) not between 1 and 160 then
    return query select false, 'invalid_business_name'::text, null::uuid;
    return;
  end if;

  if p_status is null or p_accepting_leads is null or p_insurance_verified is null then
    return query select false, 'invalid_input'::text, null::uuid;
    return;
  end if;

  if p_accepting_leads and p_status is distinct from 'ACTIVE' then
    return query select false, 'accepting_requires_active'::text, null::uuid;
    return;
  end if;

  if p_service_ids is null or p_location_ids is null then
    return query select false, 'invalid_input'::text, null::uuid;
    return;
  end if;

  foreach v_service in array p_service_ids loop
    if not exists (select 1 from public.services s where s.id = v_service) then
      return query select false, 'unknown_service'::text, null::uuid;
      return;
    end if;
  end loop;

  foreach v_location in array p_location_ids loop
    if not exists (select 1 from public.locations l where l.id = v_location) then
      return query select false, 'unknown_location'::text, null::uuid;
      return;
    end if;
  end loop;

  if p_vendor_id is null then
    insert into public.vendors (
      business_name, contact_name, phone, email, website, source, source_url,
      discovery_notes, status, accepting_leads, registration_number, license_number,
      insurance_verified, credentials_notes
    ) values (
      trim(p_business_name),
      nullif(trim(coalesce(p_contact_name, '')), ''),
      nullif(trim(coalesce(p_phone, '')), ''),
      nullif(lower(trim(coalesce(p_email, ''))), ''),
      nullif(trim(coalesce(p_website, '')), ''),
      nullif(trim(coalesce(p_source, '')), ''),
      nullif(trim(coalesce(p_source_url, '')), ''),
      nullif(trim(coalesce(p_discovery_notes, '')), ''),
      p_status,
      p_accepting_leads,
      nullif(trim(coalesce(p_registration_number, '')), ''),
      nullif(trim(coalesce(p_license_number, '')), ''),
      p_insurance_verified,
      nullif(trim(coalesce(p_credentials_notes, '')), '')
    )
    returning id into v_id;
  else
    update public.vendors
       set business_name = trim(p_business_name),
           contact_name = nullif(trim(coalesce(p_contact_name, '')), ''),
           phone = nullif(trim(coalesce(p_phone, '')), ''),
           email = nullif(lower(trim(coalesce(p_email, ''))), ''),
           website = nullif(trim(coalesce(p_website, '')), ''),
           source = nullif(trim(coalesce(p_source, '')), ''),
           source_url = nullif(trim(coalesce(p_source_url, '')), ''),
           discovery_notes = nullif(trim(coalesce(p_discovery_notes, '')), ''),
           status = p_status,
           accepting_leads = p_accepting_leads,
           registration_number = nullif(trim(coalesce(p_registration_number, '')), ''),
           license_number = nullif(trim(coalesce(p_license_number, '')), ''),
           insurance_verified = p_insurance_verified,
           credentials_notes = nullif(trim(coalesce(p_credentials_notes, '')), ''),
           updated_at = now()
     where id = p_vendor_id
    returning id into v_id;

    if v_id is null then
      return query select false, 'vendor_not_found'::text, null::uuid;
      return;
    end if;

    -- Qualify vendor_id. RETURNS TABLE exposes vendor_id, so an
    -- unqualified reference is ambiguous (42702) and updates fail.
    delete from public.vendor_services as vs
     where vs.vendor_id = v_id;
    delete from public.vendor_locations as vl
     where vl.vendor_id = v_id;
  end if;

  insert into public.vendor_services (vendor_id, service_id)
  select v_id, distinct_service
  from (select distinct unnest(p_service_ids) as distinct_service) s
  where distinct_service is not null and distinct_service <> '';

  insert into public.vendor_locations (vendor_id, location_id)
  select v_id, distinct_location
  from (select distinct unnest(p_location_ids) as distinct_location) l
  where distinct_location is not null and distinct_location <> '';

  return query select true, null::text, v_id;
end;
$$;

comment on function public.admin_upsert_vendor(
  uuid, text, text, text, text, text, text, text, text, public.vendor_status, boolean, text, text, boolean, text, text[], text[], uuid
) is
  'A5-008 create or update a vendor and replace service/location coverage in one transaction. service_role only. accepting_leads requires ACTIVE.';

revoke all on function public.admin_upsert_vendor(
  uuid, text, text, text, text, text, text, text, text, public.vendor_status, boolean, text, text, boolean, text, text[], text[], uuid
) from public, anon, authenticated;

grant execute on function public.admin_upsert_vendor(
  uuid, text, text, text, text, text, text, text, text, public.vendor_status, boolean, text, text, boolean, text, text[], text[], uuid
) to service_role;

-- ---------------------------------------------------------------------------
-- Manual assignment
-- ---------------------------------------------------------------------------

create or replace function public.admin_assign_lead_to_vendor(
  p_lead_id uuid,
  p_vendor_id uuid,
  p_actor_user_id uuid
)
returns table (
  ok boolean,
  error_code text,
  assignment_id uuid
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_status public.lead_status;
  v_service text;
  v_location text;
  v_assignment uuid;
begin
  if p_lead_id is null or p_vendor_id is null then
    return query select false, 'invalid_input'::text, null::uuid;
    return;
  end if;

  if p_actor_user_id is null then
    return query select false, 'actor_required'::text, null::uuid;
    return;
  end if;

  select l.status, l.service_id, l.location_id
    into v_status, v_service, v_location
  from public.leads l
  where l.id = p_lead_id
  for update;

  if v_status is null then
    return query select false, 'lead_not_found'::text, null::uuid;
    return;
  end if;

  if v_status is distinct from 'QUALIFIED' then
    return query select false, 'stale_status'::text, null::uuid;
    return;
  end if;

  if v_service is null or v_location is null then
    return query select false, 'unclassified'::text, null::uuid;
    return;
  end if;

  if exists (
    select 1
    from public.lead_assignments a
    where a.lead_id = p_lead_id
      and a.status in ('ASSIGNED', 'ACCEPTED')
  ) then
    return query select false, 'active_assignment_exists'::text, null::uuid;
    return;
  end if;

  if not exists (
    select 1
    from public.vendors v
    join public.vendor_services vs
      on vs.vendor_id = v.id
     and vs.service_id = v_service
    join public.vendor_locations vl
      on vl.vendor_id = v.id
     and vl.location_id = v_location
    where v.id = p_vendor_id
      and v.status = 'ACTIVE'
      and v.accepting_leads = true
  ) then
    return query select false, 'vendor_not_eligible'::text, null::uuid;
    return;
  end if;

  insert into public.lead_assignments (
    lead_id,
    vendor_id,
    status,
    assigned_at,
    assigned_by
  ) values (
    p_lead_id,
    p_vendor_id,
    'ASSIGNED',
    now(),
    p_actor_user_id
  )
  returning id into v_assignment;

  update public.leads
     set status = 'ASSIGNED',
         updated_at = now()
   where id = p_lead_id
     and status = 'QUALIFIED';

  if not found then
    raise exception 'assignment_lead_update_failed';
  end if;

  insert into public.lead_status_events (
    lead_id,
    from_status,
    to_status,
    event_type,
    occurred_at,
    note,
    actor_user_id
  ) values (
    p_lead_id,
    'QUALIFIED',
    'ASSIGNED',
    'VendorAssigned',
    now(),
    null,
    p_actor_user_id
  );

  return query select true, null::text, v_assignment;
exception
  when unique_violation then
    return query select false, 'active_assignment_exists'::text, null::uuid;
end;
$$;

comment on function public.admin_assign_lead_to_vendor(uuid, uuid, uuid) is
  'A5-008 atomic manual assignment: one open LeadAssignment, lead QUALIFIED to ASSIGNED, VendorAssigned event. No notification.';

revoke all on function public.admin_assign_lead_to_vendor(uuid, uuid, uuid)
  from public, anon, authenticated;

grant execute on function public.admin_assign_lead_to_vendor(uuid, uuid, uuid)
  to service_role;
