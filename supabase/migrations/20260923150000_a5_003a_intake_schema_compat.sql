-- TASK A5-003A: Intake compatibility schema amendment
-- CHANGE: preferred_contact text; nullable service_id/location_id; postal_code;
--         service_selection_status (SELECTED | NOT_SURE)
-- REASON: Align A5-001 schema with approved intake semantics (A5-003 stop report)
-- DESTRUCTIVE: NO — additive / nullability relaxations only
-- OWNER APPROVAL: A5-003A (owner chose Option 2)
-- DO NOT APPLY TO PRODUCTION without explicit owner approval

-- ---------------------------------------------------------------------------
-- CHANGE 1 — preferred contact: add text (preserve phone, email)
-- ---------------------------------------------------------------------------

alter type public.preferred_contact_method add value 'text';

-- ---------------------------------------------------------------------------
-- CHANGE 3 — distinguish deliberate Not Sure vs unclassified null service
-- Inspected A5-001: nullable service_id alone cannot encode homeowner intent.
-- Smallest field: service_selection_status SELECTED | NOT_SURE
-- ---------------------------------------------------------------------------

create type public.service_selection_status as enum (
  'SELECTED',
  'NOT_SURE'
);

alter table public.leads
  add column service_selection_status public.service_selection_status;

comment on column public.leads.service_selection_status is
  'Homeowner service choice signal: SELECTED (classified service_id) or NOT_SURE (deliberate unclassified). Null = not recorded / legacy.';

-- ---------------------------------------------------------------------------
-- CHANGE 2 — service_id nullable (not yet classified ≠ no fake UNKNOWN service)
-- CHANGE 4 — postal_code (raw homeowner geography)
-- CHANGE 5 — location_id nullable (not yet mapped to canonical location)
-- ---------------------------------------------------------------------------

alter table public.leads
  alter column service_id drop not null;

alter table public.leads
  alter column location_id drop not null;

alter table public.leads
  add column postal_code text;

comment on column public.leads.service_id is
  'Canonical A5 service classification. NULL = not yet classified (not a fake UNKNOWN service).';

comment on column public.leads.location_id is
  'Canonical A5 location mapping. NULL = not yet mapped to an approved location.';

comment on column public.leads.postal_code is
  'Raw customer-submitted geography (MVP: US ZIP as text). Distinct from location_id.';

comment on table public.leads is
  'Canonical homeowner service opportunity. vendor assignment is separate. service_id/location_id may be null until classified; postal_code holds raw geography.';

-- Consistency: when status is set, it must match service_id nullability.
alter table public.leads
  add constraint leads_service_selection_consistency check (
    service_selection_status is null
    or (
      service_selection_status = 'NOT_SURE'
      and service_id is null
    )
    or (
      service_selection_status = 'SELECTED'
      and service_id is not null
    )
  );

-- Optional lightweight index for ops queues filtering unclassified demand
create index leads_postal_code_idx on public.leads (postal_code)
  where postal_code is not null;

create index leads_service_selection_status_idx
  on public.leads (service_selection_status)
  where service_selection_status is not null;
