-- TASK A5-007: Lead operations — notes, actor audit, atomic status transition,
--               classification constraint relaxation for NOT_SURE + service_id
-- CHANGE:
--   1) Relax leads_service_selection_consistency so A5 may set service_id while
--      preserving homeowner NOT_SURE (raw vs classification — A5-003A doctrine)
--   2) Add lead_status_events.actor_user_id (nullable for historical LeadCreated)
--   3) Create lead_notes (private, immutable after insert) + RLS deny-all
--   4) RPCs: admin_transition_lead_status, admin_classify_lead_service,
--            admin_classify_lead_location, admin_add_lead_note
-- REASON: Usable lead management without vendors; atomic status + event ledger;
--         operator identity on mutations; private notes
-- DESTRUCTIVE: NO
-- OWNER APPROVAL: A5-007 task authorization
-- DO NOT APPLY TO PRODUCTION without explicit owner approval

-- ---------------------------------------------------------------------------
-- 1) Classification vs homeowner selection
-- A5-003A required NOT_SURE ⇒ service_id IS NULL (intake-time consistency).
-- A5-007 classifies NOT_SURE without rewriting service_selection_status.
-- SELECTED still requires a non-null service_id.
-- ---------------------------------------------------------------------------

alter table public.leads
  drop constraint if exists leads_service_selection_consistency;

alter table public.leads
  add constraint leads_service_selection_consistency check (
    service_selection_status is null
    or service_selection_status = 'NOT_SURE'
    or (
      service_selection_status = 'SELECTED'
      and service_id is not null
    )
  );

comment on column public.leads.service_selection_status is
  'Homeowner service choice signal: SELECTED or NOT_SURE. NOT_SURE may later have service_id set by A5 ops classification without rewriting this field.';

comment on column public.leads.service_id is
  'Canonical A5 service classification. NULL = not yet classified. When service_selection_status = NOT_SURE, a non-null value is A5 ops classification (not homeowner selected).';

-- ---------------------------------------------------------------------------
-- 2) Actor on lifecycle events (smallest audit addition)
-- ---------------------------------------------------------------------------

alter table public.lead_status_events
  add column actor_user_id uuid references auth.users (id);

comment on column public.lead_status_events.actor_user_id is
  'Authenticated admin (auth.users) who caused the event when known. Null for system/intake events (e.g. LeadCreated).';

create index lead_status_events_actor_user_id_idx
  on public.lead_status_events (actor_user_id)
  where actor_user_id is not null;

-- ---------------------------------------------------------------------------
-- 3) Private internal notes
-- ---------------------------------------------------------------------------

create table public.lead_notes (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id),
  body text not null,
  created_at timestamptz not null default now(),
  created_by uuid not null references auth.users (id),
  constraint lead_notes_body_length check (
    char_length(body) between 1 and 2000
  )
);

comment on table public.lead_notes is
  'Private internal OWNER notes. Immutable after creation. Not customer-visible. Access only via service_role after admin authorization.';

create index lead_notes_lead_id_idx
  on public.lead_notes (lead_id, created_at desc);

alter table public.lead_notes enable row level security;

create policy lead_notes_deny_all on public.lead_notes
  for all to anon, authenticated
  using (false)
  with check (false);

-- ---------------------------------------------------------------------------
-- Shared: revoke/grant helper pattern for service_role-only RPCs
-- Authorization (admin_users) is enforced in the Next.js server boundary.
-- RPCs trust p_actor_user_id from that boundary; they do not re-check allowlist.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- 4a) Atomic status transition + immutable event
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
  'A5-007 atomic lead status update + lead_status_events insert with actor. service_role only; admin allowlist enforced by application server.';

revoke all on function public.admin_transition_lead_status(
  uuid, public.lead_status, public.lead_status, text, uuid, text
) from public;

revoke all on function public.admin_transition_lead_status(
  uuid, public.lead_status, public.lead_status, text, uuid, text
) from anon;

revoke all on function public.admin_transition_lead_status(
  uuid, public.lead_status, public.lead_status, text, uuid, text
) from authenticated;

grant execute on function public.admin_transition_lead_status(
  uuid, public.lead_status, public.lead_status, text, uuid, text
) to service_role;

-- ---------------------------------------------------------------------------
-- 4b) Classify service (preserve NOT_SURE; set service_id)
-- ---------------------------------------------------------------------------

create or replace function public.admin_classify_lead_service(
  p_lead_id uuid,
  p_service_id text,
  p_actor_user_id uuid
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
  v_selection public.service_selection_status;
  v_current_service text;
  v_status public.lead_status;
begin
  if p_lead_id is null or p_service_id is null or p_actor_user_id is null then
    return query select false, 'invalid_input'::text;
    return;
  end if;

  if not exists (select 1 from public.services s where s.id = p_service_id) then
    return query select false, 'unknown_service'::text;
    return;
  end if;

  select l.service_selection_status, l.service_id, l.status
    into v_selection, v_current_service, v_status
  from public.leads l
  where l.id = p_lead_id
  for update;

  if not found then
    return query select false, 'lead_not_found'::text;
    return;
  end if;

  if v_selection is distinct from 'NOT_SURE' then
    return query select false, 'not_classifiable'::text;
    return;
  end if;

  if v_current_service is not null then
    return query select false, 'already_classified'::text;
    return;
  end if;

  update public.leads
     set service_id = p_service_id,
         updated_at = now()
   where id = p_lead_id;

  -- Preserve service_selection_status = NOT_SURE (do not rewrite to SELECTED).

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
    v_status,
    v_status,
    'ServiceClassified',
    now(),
    'service_id=' || p_service_id,
    p_actor_user_id
  );

  return query select true, null::text;
end;
$$;

comment on function public.admin_classify_lead_service(uuid, text, uuid) is
  'A5-007 set service_id on NOT_SURE lead without rewriting service_selection_status. service_role only.';

revoke all on function public.admin_classify_lead_service(uuid, text, uuid) from public;
revoke all on function public.admin_classify_lead_service(uuid, text, uuid) from anon;
revoke all on function public.admin_classify_lead_service(uuid, text, uuid) from authenticated;
grant execute on function public.admin_classify_lead_service(uuid, text, uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 4c) Classify location (preserve postal_code)
-- ---------------------------------------------------------------------------

create or replace function public.admin_classify_lead_location(
  p_lead_id uuid,
  p_location_id text,
  p_actor_user_id uuid
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
  v_postal text;
  v_status public.lead_status;
begin
  if p_lead_id is null or p_location_id is null or p_actor_user_id is null then
    return query select false, 'invalid_input'::text;
    return;
  end if;

  if not exists (select 1 from public.locations loc where loc.id = p_location_id) then
    return query select false, 'unknown_location'::text;
    return;
  end if;

  select l.postal_code, l.status
    into v_postal, v_status
  from public.leads l
  where l.id = p_lead_id
  for update;

  if not found then
    return query select false, 'lead_not_found'::text;
    return;
  end if;

  update public.leads
     set location_id = p_location_id,
         updated_at = now()
   where id = p_lead_id;
  -- postal_code intentionally untouched

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
    v_status,
    v_status,
    'LocationClassified',
    now(),
    'location_id=' || p_location_id || coalesce('; postal_code=' || v_postal, ''),
    p_actor_user_id
  );

  return query select true, null::text;
end;
$$;

comment on function public.admin_classify_lead_location(uuid, text, uuid) is
  'A5-007 set location_id from approved registry without overwriting postal_code. service_role only.';

revoke all on function public.admin_classify_lead_location(uuid, text, uuid) from public;
revoke all on function public.admin_classify_lead_location(uuid, text, uuid) from anon;
revoke all on function public.admin_classify_lead_location(uuid, text, uuid) from authenticated;
grant execute on function public.admin_classify_lead_location(uuid, text, uuid) to service_role;

-- ---------------------------------------------------------------------------
-- 4d) Add private note
-- ---------------------------------------------------------------------------

create or replace function public.admin_add_lead_note(
  p_lead_id uuid,
  p_body text,
  p_actor_user_id uuid
)
returns table (
  ok boolean,
  error_code text,
  note_id uuid
)
language plpgsql
security definer
set search_path = pg_catalog, public
as $$
declare
  v_id uuid;
  v_body text;
begin
  if p_lead_id is null or p_actor_user_id is null then
    return query select false, 'invalid_input'::text, null::uuid;
    return;
  end if;

  v_body := trim(coalesce(p_body, ''));
  if char_length(v_body) < 1 or char_length(v_body) > 2000 then
    return query select false, 'invalid_note_body'::text, null::uuid;
    return;
  end if;

  if not exists (select 1 from public.leads l where l.id = p_lead_id) then
    return query select false, 'lead_not_found'::text, null::uuid;
    return;
  end if;

  insert into public.lead_notes (lead_id, body, created_by)
  values (p_lead_id, v_body, p_actor_user_id)
  returning id into v_id;

  return query select true, null::text, v_id;
end;
$$;

comment on function public.admin_add_lead_note(uuid, text, uuid) is
  'A5-007 insert private lead note with admin created_by. service_role only.';

revoke all on function public.admin_add_lead_note(uuid, text, uuid) from public;
revoke all on function public.admin_add_lead_note(uuid, text, uuid) from anon;
revoke all on function public.admin_add_lead_note(uuid, text, uuid) from authenticated;
grant execute on function public.admin_add_lead_note(uuid, text, uuid) to service_role;
