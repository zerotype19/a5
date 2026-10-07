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

The public foundation, responsive templates and authority directory are deployed. Supabase holds 49 published content records: 8 service hubs, 6 town hubs, 12 service/town pages, 14 problem pages and 9 guides. The sitemap contains 54 URLs. Intake supports optional private photos, idempotent submission and acquisition attribution. Operations supports qualification, notes, manual vendor assignment and email Accept/Pass. Vendor notification is implemented; internal new-lead alerts are a separate gated capability.

Use [the current completion audit](docs/launch/PLAN-COMPLETION-AUDIT-2026-10-07.md) for remaining operating, measurement and evidence requirements. The [operations task](docs/operations/TASK.md) and [verification record](docs/operations/VERIFICATION.md) describe work in progress; implementation does not mean production activation. Pilot spending and expansion choices are deferred at the owner's request.
