# ADR-003: Hosting — Cloudflare Workers

- **Status:** Accepted (locked)
- **Date:** 2026-09-23
- **Updated:** 2026-09-27

## Context

A5 requires edge delivery, bot protection (Turnstile), and production hosting under owner control.

The application is Next.js 16 App Router with server actions, Supabase cookie sessions, dynamic admin routes, and `node:crypto` photo grants. A vinext compatibility spike built that application for Cloudflare Workers under `nodejs_compat` without changing product behavior.

On 2026-09-27 the production Worker `a5-home-services` passed the real paths against the existing Supabase project and a production Turnstile widget: token verification, transactional lead creation, idempotent retry, private photo storage, anon denial, Supabase cookie login, admin allowlist denial, server actions, and admin note and status mutations. That proof locks Workers as the production host. The G001 relationship policy retest passed, and the privacy page is the approved September 27 text. Both `a5homeservices.com` and `www.a5homeservices.com` are attached to the Worker. The application redirects the apex and plain HTTP requests to `https://www.a5homeservices.com`, preserving path and query.

## Decision

Cloudflare Workers is the approved production host for A5. The Next.js application is hosted on Cloudflare Workers using the approved vinext adapter. Cloudflare also provides DNS, HTTPS, and Turnstile. Supabase provides Postgres, Auth, and private Storage.

Vercel is not part of the production architecture.

The approved hosting packages are exact pins. They are not upgraded as part of ordinary dependency maintenance.

| Package | Version | Role |
| --- | --- | --- |
| `vinext` | `1.0.0-beta.13` | Next.js-on-Vite adapter |
| `@vinext/cloudflare` | `1.0.0-beta.11` | Workers deploy helper |
| `react-server-dom-webpack` | `19.2.8` | RSC runtime, pinned to the app's React version |
| `vite` | `8.3.1` | Build tool |
| `@vitejs/plugin-react` | `6.1.1` | React plugin |
| `@vitejs/plugin-rsc` | `0.5.35` | RSC plugin |
| `@cloudflare/vite-plugin` | `1.61.0` | Workers Vite plugin |
| `wrangler` | `4.142.0` | Workers CLI |

Production Worker name: `a5-home-services`.

Pages that set `revalidate` use the approved `@vinext/cloudflare` KV data adapter. The Worker binding is `VINEXT_KV_CACHE`. That is cache storage, not a new application package.

Canonical origin remains `https://www.a5homeservices.com`. The apex host redirects to `www`. Only that host is eligible for indexing.

## Build-time and runtime configuration

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are inlined when `vite build` runs. A production deploy must be built with the production values in the build environment. Do not reuse a preview build for production.

`SUPABASE_SERVICE_ROLE_KEY` and `TURNSTILE_SECRET_KEY` stay runtime Worker secrets. They are not inlined into client assets.

## Consequences

- Production deployment remains owner-controlled.
- Agents must not change DNS records other than the website route for `a5homeservices.com`, and must not alter unrelated zones or Workers.
- The `workers.dev` hostname is not a public indexable host.
- Hosting-package upgrades are a deliberate maintenance task.
- Vercel is not the approved hosting provider for A5 production.
