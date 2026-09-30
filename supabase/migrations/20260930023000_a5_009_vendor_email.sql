-- TASK A5-009: Vendor email capability + Accept / Pass
-- CHANGE:
--   1) notification tracking on lead_assignments
--   2) hashed assignment_capabilities (raw token is never stored)
--   3) prepare/finish notification RPCs and vendor_respond_to_assignment
--   4) generic status RPC refuses ACCEPTED and any move out of ASSIGNED
--   5) reassignment excludes a vendor who already PASSED that lead
-- REASON: A vendor can accept or pass one assignment from an expiring email link
-- DESTRUCTIVE: NO
-- Does not alter authority/content tables.
-- Email delivery is not part of the assignment transaction.

-- ---------------------------------------------------------------------------
-- Delivery tracking
-- ---------------------------------------------------------------------------

alter table public.lead_assignments
  add column notification_status text,
  add column notification_attempted_at timestamptz,
  add column notification_sent_at timestamptz,
  add column notification_error text;

alter table public.lead_assignments
  add constraint lead_assignments_notification_status_check
    check (
      notification_status is null
      or notification_status in ('PENDING', 'SENT', 'FAILED')
    ),
  add constraint lead_assignments_notification_error_len
    check (
      notification_error is null
      or char_length(notification_error) between 1 and 300
    );

comment on column public.lead_assignments.notification_status is
  'A5-009 delivery attempt. Null means no attempt. Independent of assignment status.';

-- ---------------------------------------------------------------------------
-- Capability hashes
-- ---------------------------------------------------------------------------

create table public.assignment_capabilities (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.lead_assignments (id),
  token_hash text not null,
  expires_at timestamptz not null,
  revoked_at timestamptz,
  created_at timestamptz not null default now(),
  constraint assignment_capabilities_token_hash_len
    check (token_hash ~ '^[0-9a-f]{64}$'),
  constraint assignment_capabilities_token_hash_key unique (token_hash)
);

comment on table public.assignment_capabilities is
  'A5-009 hashed opportunity capabilities for one assignment. Raw tokens are not stored. A new send revokes older hashes.';

create index assignment_capabilities_assignment_id_idx
  on public.assignment_capabilities (assignment_id);

alter table public.assignment_capabilities enable row level security;

create policy assignment_capabilities_deny_all on public.assignment_capabilities
  for all to anon, authenticated
  using (false)
  with check (false);

revoke all on table public.assignment_capabilities from public, anon, authenticated;
grant select, insert, update on table public.assignment_capabilities to service_role;

-- ---------------------------------------------------------------------------
-- Generic transition cannot accept or move an assigned lead
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

  if p_to_status = 'ACCEPTED' or p_expected_status = 'ASSIGNED' then
    return query select false, 'vendor_response_required'::text, p_expected_status, p_to_status;
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
  'A5-007 atomic status change. A5-008 refuses ASSIGNED. A5-009 refuses ACCEPTED and any generic move while the lead is ASSIGNED.';

-- ---------------------------------------------------------------------------
-- Assignment excludes a vendor who already passed this lead
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

  if exists (
    select 1
    from public.lead_assignments passed
    where passed.lead_id = p_lead_id
      and passed.vendor_id = p_vendor_id
      and passed.status = 'PASSED'
  ) then
    return query select false, 'vendor_previously_passed'::text, null::uuid;
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
  'A5-008 atomic manual assignment. A5-009: a vendor who PASSED this lead cannot be assigned again. Email is a later delivery attempt.';

-- ---------------------------------------------------------------------------
-- Prepare a delivery attempt and store only the token hash
-- ---------------------------------------------------------------------------

create or replace function public.admin_prepare_vendor_notification(
  p_assignment_id uuid,
  p_token_hash text,
  p_expires_at timestamptz,
  p_actor_user_id uuid
)
returns table (
  ok boolean,
  error_code text,
  vendor_email text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_status public.lead_assignment_status;
  v_vendor uuid;
  v_notice text;
  v_vendor_status public.vendor_status;
  v_accepting boolean;
  v_email text;
begin
  if p_actor_user_id is null then
    return query select false, 'actor_required'::text, null::text;
    return;
  end if;

  if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' then
    return query select false, 'invalid_token'::text, null::text;
    return;
  end if;

  if p_expires_at is null
     or p_expires_at <= now()
     or p_expires_at > now() + interval '73 hours' then
    return query select false, 'invalid_expiry'::text, null::text;
    return;
  end if;

  select a.status, a.vendor_id, a.notification_status
    into v_status, v_vendor, v_notice
  from public.lead_assignments a
  where a.id = p_assignment_id
  for update;

  if v_status is null then
    return query select false, 'assignment_not_found'::text, null::text;
    return;
  end if;

  if v_status is distinct from 'ASSIGNED' then
    return query select false, 'assignment_not_open'::text, null::text;
    return;
  end if;

  if v_notice = 'SENT' then
    return query select false, 'already_sent'::text, null::text;
    return;
  end if;

  select v.status, v.accepting_leads, v.email
    into v_vendor_status, v_accepting, v_email
  from public.vendors v
  where v.id = v_vendor;

  if v_vendor_status is distinct from 'ACTIVE' or v_accepting is distinct from true then
    return query select false, 'vendor_not_eligible'::text, null::text;
    return;
  end if;

  if v_email is null or length(trim(v_email)) = 0 then
    return query select false, 'vendor_email_required'::text, null::text;
    return;
  end if;

  update public.assignment_capabilities as c
     set revoked_at = now()
   where c.assignment_id = p_assignment_id
     and c.revoked_at is null;

  insert into public.assignment_capabilities (assignment_id, token_hash, expires_at)
  values (p_assignment_id, p_token_hash, p_expires_at);

  update public.lead_assignments as a
     set notification_status = 'PENDING',
         notification_attempted_at = now(),
         notification_sent_at = null,
         notification_error = null
   where a.id = p_assignment_id;

  return query select true, null::text, v_email;
end;
$$;

comment on function public.admin_prepare_vendor_notification(uuid, text, timestamptz, uuid) is
  'A5-009 start a delivery attempt. Stores the token hash, revokes older capabilities, sets notification PENDING. Does not send email.';

create or replace function public.admin_finish_vendor_notification(
  p_assignment_id uuid,
  p_status text,
  p_error text
)
returns table (
  ok boolean,
  error_code text
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_error text;
begin
  if p_status is distinct from 'SENT' and p_status is distinct from 'FAILED' then
    return query select false, 'invalid_status'::text;
    return;
  end if;

  v_error := nullif(left(trim(coalesce(p_error, '')), 300), '');
  if p_status = 'FAILED' and v_error is null then
    v_error := 'delivery_failed';
  end if;

  update public.lead_assignments as a
     set notification_status = p_status,
         notification_sent_at = case when p_status = 'SENT' then now() else a.notification_sent_at end,
         notification_error = case when p_status = 'FAILED' then v_error else null end
   where a.id = p_assignment_id
     and a.notification_status = 'PENDING';

  if not found then
    return query select false, 'not_pending'::text;
    return;
  end if;

  return query select true, null::text;
end;
$$;

comment on function public.admin_finish_vendor_notification(uuid, text, text) is
  'A5-009 record SENT or FAILED for a PENDING delivery. Does not change assignment or lead status.';

-- ---------------------------------------------------------------------------
-- Accept or Pass. One transaction. One terminal response.
-- ---------------------------------------------------------------------------

create or replace function public.vendor_respond_to_assignment(
  p_token_hash text,
  p_action text
)
returns table (
  ok boolean,
  error_code text,
  lead_id uuid
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_assignment uuid;
  v_expires timestamptz;
  v_revoked timestamptz;
  v_status public.lead_assignment_status;
  v_lead uuid;
  v_lead_status public.lead_status;
begin
  if p_token_hash is null
     or p_token_hash !~ '^[0-9a-f]{64}$'
     or (p_action is distinct from 'ACCEPT' and p_action is distinct from 'PASS') then
    return query select false, 'unavailable'::text, null::uuid;
    return;
  end if;

  select c.assignment_id, c.expires_at, c.revoked_at
    into v_assignment, v_expires, v_revoked
  from public.assignment_capabilities c
  where c.token_hash = p_token_hash
  for update;

  if not found or v_revoked is not null or v_expires <= now() then
    return query select false, 'unavailable'::text, null::uuid;
    return;
  end if;

  select a.status, a.lead_id
    into v_status, v_lead
  from public.lead_assignments a
  where a.id = v_assignment
  for update;

  if v_status = 'ACCEPTED' then
    return query select false, 'already_accepted'::text, v_lead;
    return;
  end if;

  if v_status = 'PASSED' then
    return query select false, 'already_passed'::text, v_lead;
    return;
  end if;

  if v_status is distinct from 'ASSIGNED' then
    return query select false, 'unavailable'::text, null::uuid;
    return;
  end if;

  select l.status
    into v_lead_status
  from public.leads l
  where l.id = v_lead
  for update;

  if v_lead_status is distinct from 'ASSIGNED' then
    return query select false, 'unavailable'::text, null::uuid;
    return;
  end if;

  if p_action = 'ACCEPT' then
    update public.lead_assignments as assigned
       set status = 'ACCEPTED',
           accepted_at = now()
     where assigned.id = v_assignment
       and assigned.status = 'ASSIGNED';
    if not found then
      return query select false, 'unavailable'::text, null::uuid;
      return;
    end if;

    update public.leads as l
       set status = 'ACCEPTED',
           updated_at = now()
     where l.id = v_lead
       and l.status = 'ASSIGNED';
    if not found then
      raise exception 'accept_lead_update_failed';
    end if;

    insert into public.lead_status_events (
      lead_id, from_status, to_status, event_type, occurred_at, note, actor_user_id
    ) values (
      v_lead, 'ASSIGNED', 'ACCEPTED', 'VendorAccepted', now(), null, null
    );

    return query select true, null::text, v_lead;
    return;
  end if;

  update public.lead_assignments as assigned
     set status = 'PASSED',
         passed_at = now()
   where assigned.id = v_assignment
     and assigned.status = 'ASSIGNED';
  if not found then
    return query select false, 'unavailable'::text, null::uuid;
    return;
  end if;

  update public.leads as l
     set status = 'QUALIFIED',
         updated_at = now()
   where l.id = v_lead
     and l.status = 'ASSIGNED';
  if not found then
    raise exception 'pass_lead_update_failed';
  end if;

  insert into public.lead_status_events (
    lead_id, from_status, to_status, event_type, occurred_at, note, actor_user_id
  ) values (
    v_lead, 'ASSIGNED', 'QUALIFIED', 'VendorPassed', now(), null, null
  );

  return query select true, null::text, v_lead;
end;
$$;

comment on function public.vendor_respond_to_assignment(text, text) is
  'A5-009 atomic Accept or Pass for one hashed capability. Locks the capability, then the assignment, then the lead. Repeat calls do not insert another event.';

revoke all on function public.admin_prepare_vendor_notification(uuid, text, timestamptz, uuid)
  from public, anon, authenticated;
revoke all on function public.admin_finish_vendor_notification(uuid, text, text)
  from public, anon, authenticated;
revoke all on function public.vendor_respond_to_assignment(text, text)
  from public, anon, authenticated;

grant execute on function public.admin_prepare_vendor_notification(uuid, text, timestamptz, uuid)
  to service_role;
grant execute on function public.admin_finish_vendor_notification(uuid, text, text)
  to service_role;
grant execute on function public.vendor_respond_to_assignment(text, text)
  to service_role;
