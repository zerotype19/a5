-- TASK A5-005: Project photos + private lead-uploads bucket
-- CHANGE:
--   1) public.project_photos table (Lead → photo metadata; no binary in Postgres)
--   2) RLS deny-all for anon/authenticated on project_photos
--   3) private storage.buckets row "lead-uploads"
--   4) storage.objects policies: no anon/authenticated read/list/write except
--      via signed-upload mechanism (service-role issues signed URLs)
-- REASON: Optional homeowner project photos after successful A5-004 lead creation
-- DESTRUCTIVE: NO
-- DO NOT APPLY TO PRODUCTION without explicit owner approval

-- ---------------------------------------------------------------------------
-- project_photos
-- ---------------------------------------------------------------------------

create table public.project_photos (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid not null references public.leads (id),
  storage_bucket text not null default 'lead-uploads',
  storage_path text not null,
  original_filename text,
  mime_type text not null,
  file_size bigint not null,
  created_at timestamptz not null default now(),
  constraint project_photos_bucket_nonempty check (length(trim(storage_bucket)) > 0),
  constraint project_photos_path_nonempty check (length(trim(storage_path)) > 0),
  constraint project_photos_mime_nonempty check (length(trim(mime_type)) > 0),
  constraint project_photos_file_size_positive check (file_size > 0),
  constraint project_photos_bucket_path_unique unique (storage_bucket, storage_path)
);

comment on table public.project_photos is
  'A5-005 metadata for private homeowner project photos in storage. Binary lives in Storage only.';

comment on column public.project_photos.storage_path is
  'Object key within storage_bucket. Generated path — never customer PII.';

comment on column public.project_photos.original_filename is
  'Optional original filename metadata only. Not used for auth or path construction.';

create index project_photos_lead_id_idx on public.project_photos (lead_id);
create index project_photos_created_at_idx on public.project_photos (created_at desc);

alter table public.project_photos enable row level security;

create policy project_photos_deny_all on public.project_photos
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);

-- ---------------------------------------------------------------------------
-- Private Storage bucket: lead-uploads
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'lead-uploads',
  'lead-uploads',
  false,
  10485760, -- 10 MiB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Deny broad anon/authenticated object access. Signed uploads use the signed
-- upload token endpoint and do not rely on open INSERT policies for anon.
-- Service role bypasses RLS for management and createSignedUploadUrl.

create policy lead_uploads_no_select
  on storage.objects
  as restrictive
  for select
  to anon, authenticated
  using (bucket_id <> 'lead-uploads');

create policy lead_uploads_no_insert
  on storage.objects
  as restrictive
  for insert
  to anon, authenticated
  with check (bucket_id <> 'lead-uploads');

create policy lead_uploads_no_update
  on storage.objects
  as restrictive
  for update
  to anon, authenticated
  using (bucket_id <> 'lead-uploads')
  with check (bucket_id <> 'lead-uploads');

create policy lead_uploads_no_delete
  on storage.objects
  as restrictive
  for delete
  to anon, authenticated
  using (bucket_id <> 'lead-uploads');
