-- TASK A5-G001: Authority / content schema foundation
-- CHANGE: Create problems, sources, content_pages, and relationship tables
-- REASON: Structured local home-services knowledge corpus (not an SEO page farm)
-- DESTRUCTIVE: NO
-- OWNER APPROVAL: A5-G001 task authorization
-- DO NOT APPLY TO PRODUCTION without explicit owner approval
--
-- ENTITY DOCUMENTATION (inline):
-- problems          — homeowner-observable needs; PUBLIC reference; few samples only
-- problem_services  — M2M problem↔ service (registry ids); PUBLIC reference
-- sources           — reusable provenance; PUBLIC metadata (no PII)
-- content_pages     — canonical content registry; PUBLIC read ONLY when status=PUBLISHED
-- content_sources   — page↔ source with constrained rel types; PUBLIC when page PUBLISHED
-- content_relationships — explicit internal links; PUBLIC when from_page PUBLISHED
--
-- Solutions table intentionally deferred (document in AUTHORITY_ENGINE.md).
-- Questions use page fields (primary_question / direct_answer) + QUESTION_ANSWER sections.
-- Public PROJECT pages use content_pages.page_type=PROJECT + public_project_approved;
-- never auto-publish from leads / project_photos.

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

create type public.content_page_type as enum (
  'SERVICE',
  'LOCATION',
  'SERVICE_LOCATION',
  'PROBLEM',
  'GUIDE',
  'COST_GUIDE',
  'COMPARISON',
  'PROJECT',
  'CORE'
);

create type public.content_status as enum (
  'IDEA',
  'DRAFT',
  'REVIEW',
  'APPROVED',
  'PUBLISHED',
  'ARCHIVED'
);

create type public.source_type as enum (
  'GOVERNMENT',
  'MANUFACTURER',
  'INDUSTRY',
  'A5_FIRST_PARTY',
  'OTHER'
);

create type public.content_source_rel_type as enum (
  'SUPPORTS',
  'BACKGROUND',
  'REGULATORY',
  'COST_INPUT'
);

create type public.content_rel_type as enum (
  'RELATED',
  'PARENT',
  'SUPPORTING_GUIDE',
  'COMPARISON',
  'COST_GUIDE',
  'LOCAL_VARIANT'
);

-- ---------------------------------------------------------------------------
-- problems
-- WHY: homeowner-observable needs distinct from services
-- PUBLIC: yes (reference)
-- ---------------------------------------------------------------------------

create table public.problems (
  id text primary key,
  slug text not null unique,
  name text not null,
  description text not null default '',
  created_at timestamptz not null default now(),
  constraint problems_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

comment on table public.problems is
  'A5-G001 homeowner-observable problem entities. Not a medical diagnosis taxonomy.';

create index problems_slug_idx on public.problems (slug);

-- ---------------------------------------------------------------------------
-- problem_services (M2M)
-- ---------------------------------------------------------------------------

create table public.problem_services (
  problem_id text not null references public.problems (id) on delete cascade,
  service_id text not null references public.services (id),
  primary key (problem_id, service_id)
);

comment on table public.problem_services is
  'A5-G001 problem ↔ approved service relationships. service_id from services registry.';

create index problem_services_service_id_idx on public.problem_services (service_id);

-- ---------------------------------------------------------------------------
-- sources
-- ---------------------------------------------------------------------------

create table public.sources (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  url text not null,
  publisher text,
  source_type public.source_type not null,
  retrieved_at timestamptz,
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  constraint sources_url_http check (
    url ~* '^https?://'
    and url !~* '^javascript:'
    and url !~* '^data:'
  )
);

comment on table public.sources is
  'A5-G001 reusable source/provenance records. No credibility scores.';

-- ---------------------------------------------------------------------------
-- content_pages
-- WHY: canonical content registry — publication + indexability are separate
-- PUBLIC: SELECT only when status = PUBLISHED (drafts never publicly readable)
-- ---------------------------------------------------------------------------

create table public.content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null,
  page_type public.content_page_type not null,
  title text not null,
  meta_title text,
  meta_description text,
  h1 text not null,
  primary_service_id text references public.services (id),
  primary_location_id text references public.locations (id),
  primary_problem_id text references public.problems (id),
  primary_question text,
  direct_answer text,
  sections jsonb not null default '[]'::jsonb,
  status public.content_status not null default 'DRAFT',
  indexable boolean not null default false,
  ai_assisted boolean not null default false,
  created_by text,
  reviewed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  reviewed_at timestamptz,
  published_at timestamptz,
  last_reviewed_at timestamptz,
  cost_methodology text,
  cost_geography text,
  public_project_approved boolean not null default false,
  constraint content_pages_slug_format check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  constraint content_pages_indexable_published check (
    indexable = false or status = 'PUBLISHED'
  ),
  constraint content_pages_type_slug_unique unique (page_type, slug)
);

comment on table public.content_pages is
  'A5-G001 canonical content registry. Cursor may draft; owner publishes. Drafts are not publicly readable.';

comment on column public.content_pages.indexable is
  'Separate from status. Only PUBLISHED + indexable=true belongs in the public sitemap.';

comment on column public.content_pages.public_project_approved is
  'PROJECT pages only. Explicit approval — never auto-set from operational Lead/ProjectPhoto data.';

comment on column public.content_pages.reviewed_at is
  'Set only by explicit review action — not auto-copied from updated_at.';

create index content_pages_status_idx on public.content_pages (status);
create index content_pages_published_indexable_idx
  on public.content_pages (status, indexable)
  where status = 'PUBLISHED';
create index content_pages_service_idx on public.content_pages (primary_service_id);
create index content_pages_location_idx on public.content_pages (primary_location_id);
create index content_pages_problem_idx on public.content_pages (primary_problem_id);
create index content_pages_type_service_location_idx
  on public.content_pages (page_type, primary_service_id, primary_location_id);

-- At most one SERVICE page per service, one LOCATION per location,
-- one SERVICE_LOCATION per pair (when present).
create unique index content_pages_service_unique
  on public.content_pages (primary_service_id)
  where page_type = 'SERVICE' and primary_service_id is not null;

create unique index content_pages_location_unique
  on public.content_pages (primary_location_id)
  where page_type = 'LOCATION' and primary_location_id is not null;

create unique index content_pages_service_location_unique
  on public.content_pages (primary_service_id, primary_location_id)
  where page_type = 'SERVICE_LOCATION'
    and primary_service_id is not null
    and primary_location_id is not null;

-- ---------------------------------------------------------------------------
-- content_sources
-- ---------------------------------------------------------------------------

create table public.content_sources (
  content_page_id uuid not null references public.content_pages (id) on delete cascade,
  source_id uuid not null references public.sources (id) on delete cascade,
  relationship_type public.content_source_rel_type not null,
  primary key (content_page_id, source_id, relationship_type)
);

comment on table public.content_sources is
  'A5-G001 content ↔ source links with constrained relationship vocabulary.';

create index content_sources_source_id_idx on public.content_sources (source_id);

-- ---------------------------------------------------------------------------
-- content_relationships (explicit internal links)
-- ---------------------------------------------------------------------------

create table public.content_relationships (
  from_page_id uuid not null references public.content_pages (id) on delete cascade,
  to_page_id uuid not null references public.content_pages (id) on delete cascade,
  relationship_type public.content_rel_type not null,
  primary key (from_page_id, to_page_id, relationship_type),
  constraint content_relationships_no_self check (from_page_id <> to_page_id)
);

comment on table public.content_relationships is
  'A5-G001 explicit internal content relationships. No free-text relationship types.';

create index content_relationships_to_page_id_idx
  on public.content_relationships (to_page_id);

-- ---------------------------------------------------------------------------
-- RLS
-- Public website must NOT require service-role for published content.
-- Draft/review content is never readable by anon/authenticated.
-- Operational tables remain untouched (still deny-all).
-- ---------------------------------------------------------------------------

alter table public.problems enable row level security;
alter table public.problem_services enable row level security;
alter table public.sources enable row level security;
alter table public.content_pages enable row level security;
alter table public.content_sources enable row level security;
alter table public.content_relationships enable row level security;

-- problems / problem_services / sources: public read (no PII)
create policy problems_public_read on public.problems
  for select
  to anon, authenticated
  using (true);

create policy problem_services_public_read on public.problem_services
  for select
  to anon, authenticated
  using (true);

create policy sources_public_read on public.sources
  for select
  to anon, authenticated
  using (true);

-- content_pages: only PUBLISHED rows are publicly readable
create policy content_pages_public_read_published on public.content_pages
  for select
  to anon, authenticated
  using (status = 'PUBLISHED');

-- content_sources: readable when parent content page is PUBLISHED
create policy content_sources_public_read on public.content_sources
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.content_pages cp
      where cp.id = content_page_id
        and cp.status = 'PUBLISHED'
    )
  );

-- content_relationships: readable when from_page is PUBLISHED
create policy content_relationships_public_read on public.content_relationships
  for select
  to anon, authenticated
  using (
    exists (
      select 1
      from public.content_pages cp
      where cp.id = from_page_id
        and cp.status = 'PUBLISHED'
    )
  );

-- No insert/update/delete policies for anon/authenticated — writes via service-role only.
-- Service-role bypasses RLS for management / seeds / owner publication actions.
