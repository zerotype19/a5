# A5 Home Services — Supabase scaffolding

Canonical datastore: Supabase / Postgres (ADR-001).

## Layout

```text
supabase/
  config.toml          # local project config scaffold
  migrations/          # approved SQL migrations only
  .gitignore
```

## Migrations

| Migration | Task | Notes |
| --- | --- | --- |
| `20260923140000_a5_001_core_operational_schema.sql` | A5-001 | Core entities + RLS deny-all; see [`docs/migrations/A5-001-core-operational-schema.md`](../docs/migrations/A5-001-core-operational-schema.md) |

Apply migrations only to local/preview environments until the owner explicitly authorizes production apply.

## Local notes

- Product schema begins with A5-001 (Customer, Lead, Service, Location, LeadStatusEvent).
- Public site registries in `/config` remain the application source for approved services/locations; DB seeds mirror them for FK integrity.
- `@supabase/supabase-js` is not required for A5-001 verification (static migration/registry tests).
