-- TASK A5-006: Admin allowlist (admin_users)
-- CHANGE: public.admin_users table + RLS deny-all for anon/authenticated
-- REASON: Explicit allowlist for A5 Operations; Auth alone is insufficient
-- DESTRUCTIVE: NO
-- DO NOT APPLY TO PRODUCTION without explicit owner approval
--
-- Bootstrap: do NOT invent credentials here. See
-- docs/migrations/A5-006-admin-users.md for controlled owner bootstrap.

create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now(),
  active boolean not null default true
);

comment on table public.admin_users is
  'A5-006 allowlist of Supabase Auth users permitted to access A5 Operations. Not publicly readable.';

comment on column public.admin_users.user_id is
  'Supabase Auth user id (auth.users.id). Authorization is allowlist membership + active, not email domain.';

comment on column public.admin_users.active is
  'When false, authenticated user is denied admin access without deleting the row.';

create index admin_users_active_idx on public.admin_users (active)
  where active = true;

alter table public.admin_users enable row level security;

-- Anon and authenticated have no access. Service-role bypasses RLS for
-- server-side allowlist checks after session verification.
create policy admin_users_deny_all on public.admin_users
  as restrictive
  for all
  to anon, authenticated
  using (false)
  with check (false);
