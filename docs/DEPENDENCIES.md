# Approved dependencies

Only packages listed here (plus transitive installs of those packages) may be used without a new owner dependency proposal.

## Runtime

| Package | Purpose | Notes |
| --- | --- | --- |
| `next` | Application framework | Official scaffold |
| `react` / `react-dom` | UI | Official scaffold |
| `@supabase/supabase-js` | Supabase JS client | Service-role **server-only** for privileged ops; anon key for Auth/signed Storage |
| `@supabase/ssr` | Cookie Auth sessions for Next.js App Router | **A5-006** — official browser/server/middleware clients; anon key only; never service-role |

## Dev

| Package | Purpose |
| --- | --- |
| `typescript`, `eslint`, `eslint-config-next`, `@types/*` | Toolchain |

## Explicitly not approved (examples)

- Turnstile npm SDKs (use native CDN + `fetch` siteverify)
- `pg` / alternate DB clients (not approved while supabase-js + RPC path is chosen)
- UI kits (Tailwind/shadcn) unless separately approved
- Resend/GA4 SDKs until an approved task requires them
- Clerk / Auth0 / NextAuth / Firebase Auth

## Introducing a new dependency

Follow project context §50 — return a DEPENDENCY PROPOSAL and wait for owner approval before `npm install`.

## Decisions

| Decision | Package | Task | Status |
| --- | --- | --- | --- |
| [`docs/proposals/A5-006-dependency-supabase-ssr.md`](./proposals/A5-006-dependency-supabase-ssr.md) | `@supabase/ssr` | A5-006 admin Auth SSR sessions | **Approved** (owner decision `a5-006-ssr-decision.md`) |
