# A5-007 — Lead operations (notes, actor, atomic transitions)

**Task:** A5-007  
**Migration:** `supabase/migrations/20260923190000_a5_007_lead_operations.sql`  
**Destructive:** NO  
**Owner approval:** A5-007 task authorization  

## Changes

1. **Relax** `leads_service_selection_consistency` so `NOT_SURE` may have a non-null `service_id` (A5 ops classification) without rewriting homeowner `service_selection_status`.
2. **Add** `lead_status_events.actor_user_id` → `auth.users` (nullable for historical/system events).
3. **Create** `lead_notes` (`id`, `lead_id`, `body` 1–2000, `created_at`, `created_by`) + RLS deny-all for `anon` / `authenticated`.
4. **RPCs** (SECURITY DEFINER, `service_role` execute only):
   - `admin_transition_lead_status` — atomic status update + event (concurrency via expected status)
   - `admin_classify_lead_service` — set `service_id` on `NOT_SURE` + `ServiceClassified` event
   - `admin_classify_lead_location` — set `location_id` without touching `postal_code` + `LocationClassified` event
   - `admin_add_lead_note` — insert private note with `created_by`

Admin allowlist checks remain in the Next.js server boundary before RPC calls.

## Apply (non-prod)

```bash
# via Supabase SQL editor or CLI — owner-controlled for production
psql "$DATABASE_URL" -f supabase/migrations/20260923190000_a5_007_lead_operations.sql
# reload PostgREST if RPCs/columns missing from API:
# select pg_notify('pgrst', 'reload schema');
```

## Rollback (non-prod)

```sql
drop function if exists public.admin_add_lead_note(uuid, text, uuid);
drop function if exists public.admin_classify_lead_location(uuid, text, uuid);
drop function if exists public.admin_classify_lead_service(uuid, text, uuid);
drop function if exists public.admin_transition_lead_status(uuid, public.lead_status, public.lead_status, text, uuid, text);
drop policy if exists lead_notes_deny_all on public.lead_notes;
drop table if exists public.lead_notes;
drop index if exists public.lead_status_events_actor_user_id_idx;
alter table public.lead_status_events drop column if exists actor_user_id;
-- Restore A5-003A constraint only if no NOT_SURE rows have service_id set:
alter table public.leads drop constraint if exists leads_service_selection_consistency;
alter table public.leads add constraint leads_service_selection_consistency check (
  service_selection_status is null
  or (service_selection_status = 'NOT_SURE' and service_id is null)
  or (service_selection_status = 'SELECTED' and service_id is not null)
);
```
