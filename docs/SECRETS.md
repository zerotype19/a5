# Secrets and environment variable names

This file lists **secret and configuration NAMES only**.

Actual values belong in environment configuration (local `.env`, preview/staging secrets, production secrets). Never place credentials in source code, Git, documentation bodies, issues, task specs, AI prompts, or screenshots.

## Supabase

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (public; RLS-enforced; Auth + signed Storage) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-only; never client-side) |

## Email (Resend)

| Name | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Resend API key for transactional email |

## Bot protection (Cloudflare Turnstile)

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile site key (public) |
| `TURNSTILE_SECRET_KEY` | Turnstile secret key (server-only) |

## Analytics (GA4)

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 measurement ID (public) |

## Feature flags (disabled by default)

| Name | Default | Purpose |
| --- | --- | --- |
| `ENABLE_AI_CLASSIFICATION` | `false` | AI request classification |
| `ENABLE_VENDOR_SCORING` | `false` | Vendor scoring |
| `ENABLE_SMS` | `false` | SMS communications |
| `ENABLE_AUTOMATIC_ROUTING` | `false` | Automatic vendor routing |
| `ENABLE_PROGRAMMATIC_PUBLISHING` | `false` | Programmatic content publishing |

## Build-time public values vs runtime secrets

`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `NEXT_PUBLIC_TURNSTILE_SITE_KEY` are read while `vite build` runs and inlined into the Worker bundle. Set them in the build environment for the target being deployed. A preview build must not be promoted to production.

`SUPABASE_SERVICE_ROLE_KEY` and `TURNSTILE_SECRET_KEY` are Worker secrets. Wrangler stores them for the Worker. They are not build inputs and must not appear in client assets.

## If a credential is exposed

```text
STOP → REVOKE → ROTATE → INVESTIGATE
```

Deleting the exposed text alone is not sufficient.

## Launch pipeline additions (October 7, disabled until release)

- ENABLE_LAUNCH_PIPELINE: server flag, default false; requires 20261007170000 migration before true.
- ENABLE_OPERATIONS_ALERTS: explicit email worker flag, default false; requires delivery verification and a supervised scheduler.
- OPERATIONS_ALERT_EMAIL: private operations notification recipient; configure at runtime, never a public build variable.
- NEXT_PUBLIC_GA_MEASUREMENT_ID: existing public variable; valid G- ID enables the consent UI, not automatic consent. Configure GA4 stream as described in docs/launch/READINESS.md.

Existing Resend and Supabase secrets are reused. The local preview uses only public content read configuration; do not copy production service-role or Turnstile secret keys into preview assets.
