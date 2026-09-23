# A5 Home Services

Technology-enabled home-services contractor and local project coordination platform beginning in Northern New Jersey.

**Canonical public site:** [https://www.a5homeservices.com/](https://www.a5homeservices.com/)  
**Canonical GitHub repository:** [https://github.com/zerotype19/a5](https://github.com/zerotype19/a5)

Contact (owner-confirmed): `(973) 437-5517` · `hello@a5homeservices.com`

## Stack (approved)

- Next.js + TypeScript + React
- Supabase / Postgres (+ Storage)
- Cloudflare (edge/hosting), Resend, Turnstile, GA4
- `@supabase/supabase-js` — **server-only** service-role access (see `docs/DEPENDENCIES.md`)

See [`GOVERNANCE.md`](./GOVERNANCE.md) and [`docs/`](./docs/) before contributing.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

App defaults to [http://127.0.0.1:43123](http://127.0.0.1:43123).

Fill Supabase + Turnstile values in `.env.local` for end-to-end submission. Without Turnstile keys, non-production skips the widget; production always requires them. Never put `SUPABASE_SERVICE_ROLE_KEY` or `TURNSTILE_SECRET_KEY` in client code.

Apply migrations (including `submit_project_request`) to your Supabase project before testing live submits — production apply remains owner-controlled.

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server (port 43123) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Node test runner |
| `npm run build` | Production build |

## Current slice

Public homepage, multi-step project intake, and server-side lead submission (Customer + Lead + LeadCreated via atomic RPC). Photo upload, email, admin, and attribution enrichment are later tasks.
