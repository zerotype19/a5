# A5-004 — Atomic submit_project_request RPC

**Task:** A5-004 (+ revision: durable `submission_key`)  
**Migration:** `supabase/migrations/20260923160000_a5_004_submit_project_request_rpc.sql`  
**Date:** 2026-09-23  
**Production apply:** NOT authorized without owner approval

## CHANGE

1. Add nullable `public.leads.submission_key uuid` with **UNIQUE** constraint (`leads_submission_key_unique`). Technical submission idempotency only — not a customer id, not attribution, not an access credential.
2. Add `public.submit_project_request(p_submission_key uuid, ...)` — SECURITY DEFINER function that inserts Customer + Lead (`status=NEW`, `location_id=NULL`, `submission_key`) + `LeadCreated` in one transaction, returning `(lead_id, public_reference)`.
3. Idempotent retry: if `submission_key` already exists, return that lead’s `public_reference` without creating another Customer/Lead/event. Concurrent duplicates resolved via UNIQUE + `unique_violation` handler (subtransaction rollback).

## REASON

Owner-approved Option 1 atomicity, plus A5-004 revision: durable idempotency must live at the Postgres transaction boundary (not process memory).

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
| `submission_key` | Not an authorization secret; RPC still returns only `lead_id` + `public_reference` to the service-role caller; browser never receives customer rows |

Intended path: Browser → A5 server (validate + Turnstile) → service-role Supabase client → RPC.

Public/anonymous users have **zero** direct authority to create leads via this function.

## PRIVILEGES

See migration `revoke` / `grant` statements. Do not grant EXECUTE to anon/authenticated.

## TABLES AFFECTED

- DDL: `leads.submission_key` + UNIQUE constraint
- Writes via function: `customers`, `leads`, `lead_status_events`

## EXISTING RECORDS AFFECTED

None (additive nullable column; no production apply yet).

## DESTRUCTIVE?

**NO**

## DATA LOSS RISK

None.

## ROLLBACK

```sql
drop function if exists public.submit_project_request(
  uuid, text, text, text, public.preferred_contact_method,
  public.service_selection_status, text, text, text, text
);

alter table public.leads drop constraint if exists leads_submission_key_unique;
alter table public.leads drop column if exists submission_key;
```

## OWNER APPROVAL

A5-004 owner decision (Option 1) + A5-004 required revision (durable submission_key). Production apply remains owner-controlled.
