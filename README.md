# A5 Home Services

Technology-enabled home-services contractor and local project coordination platform beginning in Northern New Jersey.

**Canonical public site:** [https://www.a5homeservices.com/](https://www.a5homeservices.com/)  
**Canonical GitHub repository:** [https://github.com/zerotype19/a5](https://github.com/zerotype19/a5)

Contact (owner-confirmed): `(973) 437-5517` · `hello@a5homeservices.com`

## Stack (approved)

- Next.js + TypeScript + React
- Supabase / Postgres (+ Storage)
- Cloudflare Workers via the pinned vinext adapter (ADR-003), plus DNS, HTTPS, and Turnstile. Resend and GA4 are not required to launch.
- `@supabase/supabase-js` — service-role **server-only** + anon for Auth/Storage (see `docs/DEPENDENCIES.md`)
- `@supabase/ssr` — official cookie Auth sessions for `/admin` (A5-006)

See [`GOVERNANCE.md`](./GOVERNANCE.md) and [`docs/`](./docs/) before contributing.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

App defaults to [http://127.0.0.1:43123](http://127.0.0.1:43123).

Fill Supabase (+ Turnstile for intake) values in `.env.local`. Without Turnstile keys, non-production skips the widget; production always requires them. Never put `SUPABASE_SERVICE_ROLE_KEY` or `TURNSTILE_SECRET_KEY` in client code.

Admin (`/admin`): bootstrap the first allowlisted user per `docs/migrations/A5-006-admin-users.md`. Timestamps in Operations display as **UTC** (`YYYY-MM-DD HH:mm UTC`).

Apply migrations to your Supabase project before testing live flows — production apply remains owner-controlled.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server (port 43123) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Node test runner |
| `npm run build` | Next.js production build |
| `npm run build:vinext` | Cloudflare Workers build. `NEXT_PUBLIC_*` values are inlined here. |
| `npm run deploy:vinext` | Deploy the built Worker with Wrangler. Requires a prior `build:vinext`. |

## Current production state

The public foundation, responsive templates and authority directory are deployed. Supabase holds 62 published content records: 8 service hubs, 9 town hubs, 18 service/town pages, 18 problem pages and 9 guides. The sitemap contains 67 URLs. The latest wave adds Livingston, Summit and Hanover Township with individual provider-availability review; these are request areas, not verified standing vendor coverage.

Intake supports private photos, idempotent submission and acquisition attribution. Operations supports qualification, manual vendor assignment, email Accept/Pass and audited lead outcomes. Scheduled internal new-lead alerts are live at hello@a5homeservices.com, with inbox receipt confirmed. GA4 is configured with consent controls.

See [the expansion release](docs/expansion-wave-2/RELEASE.md), [operations evidence](docs/operations/RELEASE-2026-10-07.md), and [the completion audit](docs/launch/PLAN-COMPLETION-AUDIT-2026-10-07.md). Paid pilot spending remains deferred. Verified provider capacity, genuine project/team evidence and the full operational rehearsal remain separate operating tasks.
