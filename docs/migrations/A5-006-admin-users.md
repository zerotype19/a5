# A5-006 — admin_users allowlist

**Task:** A5-006  
**Migration:** `supabase/migrations/20260923180000_a5_006_admin_users.sql`  
**Production apply:** NOT authorized without explicit owner approval

## Changes

1. Table `public.admin_users` (`user_id` PK → `auth.users`, `created_at`, `active`)
2. RLS enabled with deny-all for `anon` / `authenticated`
3. No roles, permissions, orgs, or departments

## Security model

| Actor | Access |
| --- | --- |
| `anon` | None |
| `authenticated` (any) | None via PostgREST/RLS |
| A5 server (service-role) | Lookup after verifying Supabase Auth session via `@supabase/ssr` |

Authorization order: **VERIFY SESSION → VERIFY `admin_users.active` → ONLY THEN** privileged operational reads.

Do not authorize by email domain alone.

## Controlled bootstrap (first owner)

Do **not** put passwords or emails in migrations.

1. In the non-prod (or later prod) Supabase dashboard: **Authentication → Users → Add user** (email + password), or use Auth Admin API with service-role from a secure operator machine.
2. Copy the new user's UUID (`auth.users.id`).
3. As a privileged DB role (service-role SQL / dashboard SQL), insert:

```sql
insert into public.admin_users (user_id, active)
values ('<AUTH_USER_UUID>', true);
```

4. Sign in at `/admin/login` with that email/password.
5. To revoke: `update public.admin_users set active = false where user_id = '<UUID>';`

Never commit credentials. Rotate before production launch if build-phase secrets were shared.

## Rollback

```sql
drop table if exists public.admin_users;
```

## Authorization

A5-006 owner decision (including approved `@supabase/ssr`). Production apply remains owner-controlled.
