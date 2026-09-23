# A5 Home Services — Supabase scaffolding (Day 0)

This directory holds local/project scaffolding only.

- No production tables
- No invented operational schema
- Migrations that create product entities require an approved task

## Layout

```text
supabase/
  config.toml          # local project config scaffold
  migrations/          # approved SQL migrations only
  .gitignore
```

## Day 0 state

`migrations/` is intentionally empty of product schema. Add migrations only via approved tasks with owner review.
