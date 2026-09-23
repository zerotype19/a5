-- TASK A5-001: Core operational schema foundation
-- CHANGE: Create services, locations, customers, leads, lead_status_events
-- REASON: MVP entities required before lead intake; RLS denies public read
-- DESTRUCTIVE: NO
-- OWNER APPROVAL: A5-001 (Day 0 report §15 / owner Day 1 authorization)
-- DO NOT APPLY TO PRODUCTION without explicit owner approval

-- ---------------------------------------------------------------------------
-- Enums (approved lead lifecycle — project context §15)
-- ---------------------------------------------------------------------------

create type public.lead_status as enum (
  'NEW',
  'QUALIFIED',
  'ASSIGNED',
  'ACCEPTED',
  'CONTACTED',
  'ESTIMATE',
  'WON',
  'LOST',
  'INVALID',
  'DUPLICATE',
  'UNSERVICEABLE'
);

create type public.attribution_confidence as enum (
  'KNOWN',
  'PLATFORM_REPORTED',
  'INFERRED',
  'UNKNOWN'
);

create type public.preferred_contact_method as enum (
  'phone',
  'email'
);

-- ---------------------------------------------------------------------------
-- Reference: services (aligned to /config/services.ts)
-- ---------------------------------------------------------------------------

create table public.services (
  id text primary key,
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

comment on table public.services is
  'Approved MVP service registry mirror. Do not add rows without owner approval.';

-- ---------------------------------------------------------------------------
-- Reference: locations (aligned to /config/locations.ts)
-- ---------------------------------------------------------------------------

create table public.locations (
  id text primary key,
  name text not null,
  slug text not null unique,
  state text not null check (state = 'NJ'),
  created_at timestamptz not null default now()
);

comment on table public.locations is
  'Approved MVP location registry mirror (Northern NJ cluster). Do not add towns without owner approval.';

-- ---------------------------------------------------------------------------
-- Customer (person/contact — distinct from Property; project context §13)
-- ---------------------------------------------------------------------------

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  phone text,
  email text,
  preferred_contact_method public.preferred_contact_method,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint customers_contact_present check (
    phone is not null or email is not null
  )
);

comment on table public.customers is
  'Homeowner/contact person. Not a property/home record.';

create index customers_email_idx on public.customers (email)
  where email is not null;
create index customers_phone_idx on public.customers (phone)
  where phone is not null;

-- ---------------------------------------------------------------------------
-- Lead (homeowner service opportunity — project context §14–§15, §21)
-- ---------------------------------------------------------------------------

create table public.leads (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.customers (id),
  service_id text not null references public.services (id),
  location_id text not null references public.locations (id),
  project_description text not null,
  -- Urgency vocabulary not yet owner-locked; free text until approved enum task.
  urgency text,
  status public.lead_status not null default 'NEW',
  estimated_project_value numeric(12, 2),
  actual_project_value numeric(12, 2),

  -- First-touch attribution (do not overwrite once set — ADR-007)
  first_landing_page text,
  first_referrer text,
  first_utm_source text,
  first_utm_medium text,
  first_utm_campaign text,
  first_utm_content text,
  first_utm_term text,
  first_gclid text,
  first_gbraid text,
  first_wbraid text,
  first_msclkid text,
  first_fbclid text,
  first_touch_at timestamptz,
  first_session_id text,
  first_attribution_confidence public.attribution_confidence
    not null default 'UNKNOWN',

  -- Last-touch attribution (stored separately; may update)
  last_landing_page text,
  last_referrer text,
  last_utm_source text,
  last_utm_medium text,
  last_utm_campaign text,
  last_utm_content text,
  last_utm_term text,
  last_gclid text,
  last_gbraid text,
  last_wbraid text,
  last_msclkid text,
  last_fbclid text,
  last_touch_at timestamptz,
  last_session_id text,
  last_attribution_confidence public.attribution_confidence,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.leads is
  'Canonical homeowner service opportunity. Vendor assignment is a separate entity (out of A5-001 scope).';

create index leads_customer_id_idx on public.leads (customer_id);
create index leads_service_id_idx on public.leads (service_id);
create index leads_location_id_idx on public.leads (location_id);
create index leads_status_idx on public.leads (status);
create index leads_created_at_idx on public.leads (created_at desc);

-- ---------------------------------------------------------------------------
-- Lead status event ledger (immutable transitions — project context §16)
-- ---------------------------------------------------------------------------

create table public.lead_status_events (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id),
  from_status public.lead_status,
  to_status public.lead_status not null,
  -- Intended vocabulary includes §16 examples (LeadCreated, LeadQualified, …).
  -- Not an exhaustive DB enum so exceptional statuses are not blocked.
  event_type text not null,
  occurred_at timestamptz not null default now(),
  note text,
  constraint lead_status_events_event_type_nonempty check (length(trim(event_type)) > 0)
);

comment on table public.lead_status_events is
  'Immutable lead lifecycle event ledger. Do not update or delete rows in application flows.';

create index lead_status_events_lead_id_idx
  on public.lead_status_events (lead_id, occurred_at);

-- ---------------------------------------------------------------------------
-- Seed approved services / locations (registry alignment)
-- ---------------------------------------------------------------------------

insert into public.services (id, name, slug) values
  ('handyman', 'Handyman', 'handyman'),
  ('masonry', 'Masonry', 'masonry'),
  ('landscaping', 'Landscaping', 'landscaping'),
  ('painting', 'Painting', 'painting'),
  ('drywall', 'Drywall', 'drywall'),
  ('tile', 'Tile', 'tile'),
  ('plumbing', 'Plumbing', 'plumbing'),
  ('electrical', 'Electrical', 'electrical');

insert into public.locations (id, name, slug, state) values
  ('florham-park', 'Florham Park', 'florham-park', 'NJ'),
  ('madison', 'Madison', 'madison', 'NJ'),
  ('chatham', 'Chatham', 'chatham', 'NJ'),
  ('morris-township', 'Morris Township', 'morris-township', 'NJ'),
  ('morristown', 'Morristown', 'morristown', 'NJ'),
  ('east-hanover', 'East Hanover', 'east-hanover', 'NJ');

-- ---------------------------------------------------------------------------
-- RLS: deny public read/write of operational data
-- Reference tables also locked — public site uses /config registries, not DB.
-- ---------------------------------------------------------------------------

alter table public.services enable row level security;
alter table public.locations enable row level security;
alter table public.customers enable row level security;
alter table public.leads enable row level security;
alter table public.lead_status_events enable row level security;

-- Explicit deny for anon + authenticated (service_role bypasses RLS).
create policy services_deny_all on public.services
  for all to anon, authenticated
  using (false)
  with check (false);

create policy locations_deny_all on public.locations
  for all to anon, authenticated
  using (false)
  with check (false);

create policy customers_deny_all on public.customers
  for all to anon, authenticated
  using (false)
  with check (false);

create policy leads_deny_all on public.leads
  for all to anon, authenticated
  using (false)
  with check (false);

create policy lead_status_events_deny_all on public.lead_status_events
  for all to anon, authenticated
  using (false)
  with check (false);
