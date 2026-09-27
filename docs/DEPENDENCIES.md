# Approved dependencies

Only packages listed here (plus transitive installs of those packages) may be used without a new owner dependency proposal.

## Runtime

| Package | Purpose | Notes |
| --- | --- | --- |
| `next` | Application framework | Official scaffold |
| `react` / `react-dom` | UI | Official scaffold |
| `@supabase/supabase-js` | Supabase JS client | Service-role **server-only** for privileged ops; anon key for Auth/signed Storage |
| `@supabase/ssr` | Cookie Auth sessions for Next.js App Router | **A5-006** — official browser/server/middleware clients; anon key only; never service-role |
| `vinext` | Next.js on Cloudflare Workers | **A5-L001** exact pin `1.0.0-beta.13` |
| `@vinext/cloudflare` | Workers deploy helper | **A5-L001** exact pin `1.0.0-beta.11` |
| `react-server-dom-webpack` | RSC runtime matching React 19.2.8 | **A5-L001** exact pin `19.2.8`. Do not float. |

## Dev

| Package | Purpose |
| --- | --- |
| `typescript`, `eslint`, `eslint-config-next`, `@types/*` | Toolchain |
| `vite` `8.3.1` | vinext build |
| `@vitejs/plugin-react` `6.1.1` | vinext build |
| `@vitejs/plugin-rsc` `0.5.35` | vinext build |
| `@cloudflare/vite-plugin` `1.61.0` | Workers Vite plugin |
| `wrangler` `4.142.0` | Workers CLI |

Hosting package versions are exact. See `config/approved-dependencies.ts` and ADR-003.

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
| ADR-003 | vinext, `@vinext/cloudflare`, `react-server-dom-webpack`, Vite, Wrangler | A5-L001 Cloudflare Workers | **Approved** exact pins |
