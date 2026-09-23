# A5-003A — Intake compatibility schema amendment

**Task:** A5-003A  
**Migration:** `supabase/migrations/20260923150000_a5_003a_intake_schema_compat.sql`  
**Date:** 2026-09-23  
**Production apply:** NOT authorized (owner must apply explicitly later)

## CHANGE

| Object | Change |
| --- | --- |
| `preferred_contact_method` | Add enum value `text` (keep `phone`, `email`) |
| `service_selection_status` | New enum `SELECTED` \| `NOT_SURE` |
| `leads.service_selection_status` | New nullable column + consistency check |
| `leads.service_id` | Drop `NOT NULL` (FK retained) |
| `leads.location_id` | Drop `NOT NULL` (FK retained) |
| `leads.postal_code` | New nullable `text` column |

## REASON

Resolve A5-003 stop mismatches so intake can preserve raw homeowner signals separately from later A5 classification (owner Option 2).

## TABLES AFFECTED

`leads` (and enum types). No changes to `services` / `locations` seed rows, customers shape, lifecycle, or events.

## EXISTING RECORDS AFFECTED

None expected (empty product DB). All changes are additive or relax NOT NULL. Existing phone/email enum values remain valid.

## DESTRUCTIVE?

**NO**

## ROLLBACK APPROACH

Local / preview only:

```sql
drop index if exists public.leads_service_selection_status_idx;
drop index if exists public.leads_postal_code_idx;
alter table public.leads drop constraint if exists leads_service_selection_consistency;
alter table public.leads drop column if exists postal_code;
alter table public.leads drop column if exists service_selection_status;
-- Re-adding NOT NULL requires no null rows:
-- alter table public.leads alter column service_id set not null;
-- alter table public.leads alter column location_id set not null;
drop type if exists public.service_selection_status;
-- Postgres cannot easily remove enum value 'text' from preferred_contact_method;
-- restore via migration revert / rebuild in non-prod.
```

## OWNER APPROVAL

A5-003A authorized by owner (Option 2 after A5-003 schema stop). Production apply remains owner-controlled.
