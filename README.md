# A5 Home Services

Technology-enabled home-services contractor and local project coordination platform beginning in Northern New Jersey.

**Canonical public site:** [https://www.a5homeservices.com/](https://www.a5homeservices.com/)  
**Canonical GitHub repository:** [https://github.com/zerotype19/a5](https://github.com/zerotype19/a5)

Contact (owner-confirmed): `(973) 437-5517` · `hello@a5homeservices.com`

## Stack (approved)

- Next.js + TypeScript + React
- Supabase / Postgres (+ Storage)
- Cloudflare (edge/hosting), Resend, Turnstile, GA4

See [`GOVERNANCE.md`](./GOVERNANCE.md) and [`docs/`](./docs/) before contributing.

## Local development

```bash
cp .env.example .env.local
npm install
npm run dev
```

App defaults to [http://127.0.0.1:43123](http://127.0.0.1:43123).

### Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript (`tsc --noEmit`) |
| `npm test` | Node test runner via `tsx` |
| `npm run build` | Production build |

## Day 0 status

This repository currently contains the **Day 0 foundation** only: docs, ADRs, config registries, empty Supabase scaffolding, CI, and a non-indexable skeleton page. Product features require owner-approved tasks.
