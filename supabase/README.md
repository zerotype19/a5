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
| `20260923150000_a5_003a_intake_schema_compat.sql` | A5-003A | Intake compatibility (nullable service/location, postal_code, text contact, service_selection_status); see [`docs/migrations/A5-003A-intake-schema-compat.md`](../docs/migrations/A5-003A-intake-schema-compat.md) |

Apply migrations only to local/preview environments until the owner explicitly authorizes production apply.

## Local notes

- Product schema begins with A5-001 (Customer, Lead, Service, Location, LeadStatusEvent).
- A5-003A amends leads for intake compatibility: nullable `service_id` / `location_id`, `postal_code`, `service_selection_status`, and preferred contact `text`.
- Public site registries in `/config` remain the application source for approved services/locations; DB seeds mirror them for FK integrity.
- `@supabase/supabase-js` is not required for schema verification (static migration/registry tests).
