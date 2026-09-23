# Secrets and environment variable names

This file lists **secret and configuration NAMES only**.

Actual values belong in environment configuration (local `.env`, preview/staging secrets, production secrets). Never place credentials in source code, Git, documentation bodies, issues, task specs, AI prompts, or screenshots.

## Supabase

| Name | Purpose |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (public) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/public key (public; RLS-enforced) |
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

## If a credential is exposed

```text
STOP → REVOKE → ROTATE → INVESTIGATE
```

Deleting the exposed text alone is not sufficient.
