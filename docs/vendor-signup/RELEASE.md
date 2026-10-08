# Vendor signup release

## Included

- Public `/vendors/join` page, footer entry and sitemap listing. Shared A5 design, no emojis or extra mobile homeowner CTA over the form.
- Three steps: business details; services and towns; review and submit. Required business/representative/email; optional phone, website and project preferences.
- Eight canonical services and 226 municipalities. Select the whole region, whole counties, or individual towns; search and selected-only filtering preserve choices. County/region choices persist as the exact current town IDs, not future geographic expansion rules.
- Independent service/town mappings mean every selected service applies across the selected towns. Exceptions are explicitly marked as operator notes, not automatic rules.
- Private Supabase submission with consent version/time, Turnstile, bounded request bodies, honeypot, per-email database throttling and UUID retry idempotency. Public callers never receive database IDs or existing vendor contact data.
- Pending submissions in the vendor work queue plus `/admin/vendors/signups`. Review offers create, link or dismiss. Exact email/name matches prevent accidental signup duplicate creation. Linking preserves existing records; the operator uses the vendor editor for changes. Immutable submitted details and review history remain available.
- Create stores DISCOVERED, accepting_leads=false, insurance_verified=false plus canonical service/location mappings in one transaction. Existing open manual assignment permits forwarding to a DISCOVERED vendor with email. No advance capacity/availability confirmation is introduced.

## Validation

269 automated tests pass, including input validation, geographic selection, security gating, HTTP boundaries, idempotency and error response behavior. Lint, TypeScript, Next production build and Cloudflare build pass.

`node scripts/test-vendor-signup-migration.mjs` runs an isolated local PostgreSQL instance using existing Homebrew PostgreSQL tools. It verifies real schema application, concurrent duplicate submissions and reviews, canonical coverage, permission/email validation, rate limiting, duplicate detection, create/link/dismiss, field preservation, stale review rejection, active-admin requirements, anon/authenticated denial, service-role access, and rollback after a forced mapping failure. It never connects to Supabase.

Browser checks: desktop form validation; county bulk selection and individual exclusions; all 226 towns and one-town removal; selected-only filtering; review/back editing; consent requirement; failed-submit recovery with entries preserved; 390px service selection and 320px review without horizontal overflow. Authenticated admin UI was not exercised in a browser; its transaction, authorization and build checks were exercised separately.

## Release sequence

Implementation is prepared for review; this task has not applied a production migration or deployed the new feature.

1. Apply `supabase/migrations/20261008030000_vendor_signup.sql` transactionally to the existing A5 Supabase project. No existing records are rewritten.
2. Enable the server-side `ENABLE_VENDOR_SIGNUP=true` in the production Worker vars in `wrangler.jsonc`; retain all existing vars, secrets and cron settings.
3. Build and deploy using the existing production public Supabase/Turnstile configuration. The feature uses existing server secrets. Do not expose the service-role key in a public environment variable.
4. Verify `/vendors/join`, the footer link, canonical, sitemap (84 URLs with the currently published content), real Turnstile loading, unauthenticated admin protection, then a clearly identified owner test signup and the authenticated review queue. No outbound email is sent by signup or review.
5. Record migration evidence, commit, CI run and Worker version in the release PR.

Flag off: the public page offers the existing A5 email contact; API returns 503; admin does not query the signup table. Rollback by disabling the flag/redeploying the previous Worker. Retain the additive table and received submissions; do not delete signup or vendor history.

No packages, paid services, vendor accounts, automatic assignments, credentials verification, billing or marketing email were added. No production data was changed during implementation.
