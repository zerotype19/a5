# A5 Home Services

Technology-enabled home-services contractor and local project coordination platform beginning in Northern New Jersey.

**Canonical public site:** [https://www.a5homeservices.com/](https://www.a5homeservices.com/)  
**Canonical GitHub repository:** [https://github.com/zerotype19/a5](https://github.com/zerotype19/a5)

Contact (owner-confirmed): `(973) 437-5517` · `hello@a5homeservices.com`

## Stack (approved)

- Next.js + TypeScript + React
- Supabase / Postgres (+ Storage)
- Cloudflare (edge/hosting), Resend, Turnstile, GA4
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
| `npm run build` | Production build |

## Current slice

Public homepage, multi-step project intake, canonical lead submission (A5-004), optional private project photos (A5-005), read-only **A5 Operations** admin shell with Supabase Auth + `admin_users` allowlist (A5-006), and the **A5 Authority Engine** foundation (A5-G001: content model, routes, publication gates — draft fixtures only; no page farm). See [`docs/AUTHORITY_ENGINE.md`](./docs/AUTHORITY_ENGINE.md). Lead editing and vendor routing are later tasks (Track A).
