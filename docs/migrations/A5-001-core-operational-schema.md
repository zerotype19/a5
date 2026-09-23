# A5-001 — Core operational schema foundation

**Task:** A5-001  
**Migration:** `supabase/migrations/20260923140000_a5_001_core_operational_schema.sql`  
**Date:** 2026-09-23  
**Production apply:** NOT authorized (owner must apply explicitly later)

## CHANGE

Create the first MVP operational tables and supporting enums:

| Object | Kind |
| --- | --- |
| `lead_status` | enum (canonical lifecycle §15) |
| `attribution_confidence` | enum (ADR-007) |
| `preferred_contact_method` | enum (`phone` \| `email`) |
| `services` | table + seed (8 approved) |
| `locations` | table + seed (6 approved) |
| `customers` | table |
| `leads` | table (incl. first/last-touch attribution columns) |
| `lead_status_events` | table (immutable ledger) |
| RLS policies | deny-all for `anon` / `authenticated` on all five tables |

## REASON

Day 0 report §15 / owner-approved Day 1 task: establish core entities needed before lead intake, with RLS denying public read of operational data. Service and location rows are seeded to match `/config/services.ts` and `/config/locations.ts` for FK integrity.

## TABLES AFFECTED

New only: `services`, `locations`, `customers`, `leads`, `lead_status_events`.

## EXISTING RECORDS AFFECTED

None (empty product schema prior to this migration). Seeds insert reference rows only.

## DESTRUCTIVE?

**NO** — create-only. No drops, truncates, or data rewrites.

## ROLLBACK APPROACH

Local / preview only (never run against production without owner approval):

```sql
drop policy if exists lead_status_events_deny_all on public.lead_status_events;
drop policy if exists leads_deny_all on public.leads;
drop policy if exists customers_deny_all on public.customers;
drop policy if exists locations_deny_all on public.locations;
drop policy if exists services_deny_all on public.services;

drop table if exists public.lead_status_events;
drop table if exists public.leads;
drop table if exists public.customers;
drop table if exists public.locations;
drop table if exists public.services;

drop type if exists public.preferred_contact_method;
drop type if exists public.attribution_confidence;
drop type if exists public.lead_status;
```

Or revert the migration file from the branch before any environment apply.

## OWNER APPROVAL

Authorized as TASK A5-001 by owner (Day 1 = recommended task from Day 0 report §15). Production migration apply remains owner-controlled.

## OUT OF SCOPE (intentionally omitted)

Vendor, LeadAssignment, Project entity table, storage buckets, intake UI, CRM, email, GA4, content, AI, payments.
