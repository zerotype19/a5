# A5-004 — Atomic submit_project_request RPC

**Task:** A5-004  
**Migration:** `supabase/migrations/20260923160000_a5_004_submit_project_request_rpc.sql`  
**Date:** 2026-09-23  
**Production apply:** NOT authorized without owner approval

## CHANGE

Add `public.submit_project_request(...)` — one purpose-specific SECURITY DEFINER function that inserts Customer + Lead (`status=NEW`, `location_id=NULL`) + `LeadCreated` event in a single transaction, returning `(lead_id, public_reference)`.

## REASON

Owner-approved Option 1: provide true transactional integrity for A5-004 lead submission without loosening RLS or exposing service-role to the browser.

## SECURITY MODEL

| Control | Setting |
| --- | --- |
| `SECURITY` | `DEFINER` |
| `search_path` | `pg_catalog, public` (fixed) |
| Object refs | schema-qualified `public.*` |
| `EXECUTE` for `PUBLIC` | **REVOKED** |
| `EXECUTE` for `anon` | **REVOKED** |
| `EXECUTE` for `authenticated` | **REVOKED** |
| `EXECUTE` for `service_role` | **GRANTED** |

Intended path: Browser → A5 server (validate + Turnstile) → service-role Supabase client → RPC.

Public/anonymous users have **zero** direct authority to create leads via this function.

## PRIVILEGES

See migration `revoke` / `grant` statements. Do not grant EXECUTE to anon/authenticated.

## TABLES AFFECTED

Writes only via function to existing `customers`, `leads`, `lead_status_events`. No table DDL beyond function create.

## EXISTING RECORDS AFFECTED

None.

## DESTRUCTIVE?

**NO**

## DATA LOSS RISK

None.

## ROLLBACK

```sql
drop function if exists public.submit_project_request(
  text, text, text, public.preferred_contact_method,
  public.service_selection_status, text, text, text, text
);
```

## OWNER APPROVAL

A5-004 owner decision (Option 1). Production apply remains owner-controlled.
