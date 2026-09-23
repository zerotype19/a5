# Approved dependencies

Only packages listed here (plus transitive installs of those packages) may be used without a new owner dependency proposal.

## Runtime

| Package | Purpose | Notes |
| --- | --- | --- |
| `next` | Application framework | Official scaffold |
| `react` / `react-dom` | UI | Official scaffold |
| `@supabase/supabase-js` | Server-side access to Supabase/Postgres | **A5-004** — service-role **server-only**; never browser operational writes; no extra Supabase packages without approval |

## Dev

| Package | Purpose |
| --- | --- |
| `typescript`, `eslint`, `eslint-config-next`, `@types/*` | Toolchain |

## Explicitly not approved (examples)

- Turnstile npm SDKs (use native CDN + `fetch` siteverify)
- `pg` / alternate DB clients (not approved while supabase-js + RPC path is chosen)
- UI kits (Tailwind/shadcn) unless separately approved
- Resend/GA4 SDKs until an approved task requires them

## Introducing a new dependency

Follow project context §50 — return a DEPENDENCY PROPOSAL and wait for owner approval before `npm install`.
