# A5 Cloudflare migration plan

Draft for Kevin — November 11, 2026. Planning only; no migration, new infrastructure, access-policy changes or spending has been executed.

## Recommendation

Consolidate A5 on Cloudflare in stages: keep the existing Worker and website, move relational data to D1, private project photos to R2, and admin authentication to Cloudflare Access with the existing application allowlist. Keep Resend for email and Turnstile for form protection. Build and test the complete replacement in staging before changing the production source of truth.

The main benefit is one hosting/data deployment workflow with versioned imports and publishing commands, rather than needing a browser SQL session for routine content updates. A D1 move alone does not replace authentication or file storage. It also does not guarantee faster admin screens; benchmark the actual queries and page timings.

## Current implementation verified from source

- Production website: www.a5homeservices.com; Worker: a5-home-services. Next.js/TypeScript via Vinext, existing static assets and VINEXT_KV_CACHE remain.
- Supabase project: hfzzudrukeshkzsqhwsg. Nineteen SQL migrations define 26 public tables and 28 distinct functions, including trigger functions. These are source counts, not a live-schema certification.
- Public content: 341 published records at the final copy audit, with sources, relationships, slugs, canonical URLs and indexability.
- Operations: customers, leads, attribution, vendors, service/town coverage, signup review, assignment history, notes, status events and progress reports.
- Supabase Auth identifies admins; admin_users provides a separate active allowlist. Existing actor IDs are referenced in audit history.
- Private project photos use Supabase Storage, signed upload grants and access checks. Preserve the five-photo limit and existing type/size validation.
- Database functions enforce intake idempotency, assignment eligibility, Accept/Pass, token revocation, status changes and notification state. These are substantive application behavior, not just SQL syntax to translate.
- The Worker runs the email outbox every five minutes. Resend delivery and idempotency keys must remain intact.
- Production flags: launch pipeline, operations alerts, outcomes, signup and vendor progress enabled; network follow-up disabled. Preserve actual values at cutover.

## Target responsibilities

| Responsibility | Target | Required behavior |
| --- | --- | --- |
| Website/admin rendering | Existing Cloudflare Worker | Same routes, forms, public URLs and tracking |
| Relational records/content | D1 | Stable UUIDs, constraints, indexes, history and timestamps |
| Lead photos | Private R2 bucket through Worker | No public bucket; authorized, expiring upload/read access |
| Admin identity | Cloudflare Access + app allowlist | Validate signed JWT issuer/audience/expiry; map identity to stable internal admin IDs |
| Email | Existing Resend integration | Same sender domains, recipients, templates, deduplication and recovery |
| Scheduled delivery | Existing Worker cron | One active dispatcher, atomic claim and explicit uncertain delivery state |
| Form protection/cache | Existing Turnstile/KV | Same protections; refresh public-content caches after publication |

## Delivery sequence and exit gates

### 1. Inventory, backups and baseline

Export the live schema and row counts with least-privileged tooling, plus an encrypted data snapshot and private-photo manifest. Inventory extensions, triggers, policies, all function versions, storage sizes and active capability tokens. Measure admin page/query latency, database size, read/write volume and email-outbox backlog. Confirm the applicable Cloudflare plan, Access seats/identity provider and actual monthly costs; do not assume a free migration.

Gate: restore the snapshot in isolated staging; reconcile table counts, foreign keys, photo counts and checksums. Confirm the live schema against the 19 source migrations. Update the backend/auth/storage ADRs as proposed decisions before implementation.

### 2. Implement the D1 data layer in staging

Create explicit data-access modules for public content, admin operations, intake, assignments, capabilities and outbox delivery. Keep handlers and business behavior stable. Map PostgreSQL UUIDs to stable text IDs, enums to constrained values, timestamps to a consistent UTC representation and JSONB to validated JSON text. Preserve null semantics, uniqueness, foreign keys and query indexes.

Rewrite the 28 database functions as reviewed Worker operations using conditional SQL and transactional D1 batches where appropriate. Never replace row locks with a separate read followed by an unguarded write. Use unique constraints and compare-and-set state transitions; test concurrent intake, assignments, Accept/Pass, expired tokens and outbox claims. If a required transaction invariant cannot be expressed safely, stop that part of the cutover and evaluate a narrow Durable Object coordinator rather than weakening the invariant or adding one speculatively.

Gate: existing 333-test baseline plus meaningful D1 integration/concurrency tests passes. Duplicate submissions create one request; vendor eligibility and pass exclusions match production; history remains append-only.

### 3. Replace admin auth and private photo storage

Configure Access only for admin surfaces and privileged endpoints, preserving public intake, vendor signup and token-based lead pages. Inventory Next server-action entry points as well as /admin routes. Validate the Access JWT in the Worker and apply the existing allowlist on every privileged action; do not trust an email header. Preserve stable actor IDs through an explicit identity mapping. Keep CSRF/origin protections and test direct workers.dev and preview URLs so they cannot bypass admin authorization.

Copy photos to private R2 with object-level checksums and a storage-path mapping. Preserve submission-bound upload grants, file validation, object-existence checks, accepted-vendor access, token expiry/revocation and orphan handling. Existing emailed capability URLs must continue working after the move; keep token hashes and expiry times unchanged. Never resend leads just because storage moved.

Gate: authorized admin can complete existing tasks; unauthenticated and wrong-account users cannot. Customer details/photos stay hidden before acceptance, and revoked/expired links cannot access them. Staging cannot send to real customers/vendors.

### 4. Rehearse and compare

Import a fresh snapshot into staging, including operational history and outstanding delivery state. Compare row counts, normalized field-level checksums, joins, coverage mappings, null/empty values and UTC dates. Verify every public URL/canonical/indexability value and sitemap membership against the current site. Test intake → receipt → admin queue → assignment → vendor acceptance → progress, including partial photo failure, email timeout and recovery. Inspect mobile/desktop pages and admin tables.

Benchmark representative pages and query plans against the baseline. Exercise backup restore and cutover rollback in staging. Shadow reads may compare results; shadow writes and duplicate email senders stay off.

Gate: no unexplained data differences, no privacy regression, no duplicate sends and acceptable measured latency. Record expected downtime and an owner-reviewed cutover checklist.

### 5. Controlled production cutover

Use a short scheduled write freeze for intake, signup, admin mutations, vendor responses and photo attachment. Explain the temporary pause to visitors. Pause cron delivery and reconcile all SENDING/UNCERTAIN messages before export. Take the final snapshot, import to D1/R2, run reconciliation, then deploy one Worker revision using the new bindings. Preserve existing IDs, secrets needed for outstanding token validation, URLs and feature flags.

Run smoke checks before reopening writes. Enable only the new dispatcher, with the original outbox IDs/idempotency keys. Do not replay sent messages. Keep Supabase retained and read-only during the agreed observation window.

Gate: new lead can be received, assigned and viewed by the intended vendor; homeowner receipt and internal alert delivery are verified using owner-controlled addresses. Live sitemap/canonicals and private-photo access checks pass.

### 6. Observation and retirement

Monitor errors, queue age, failed/uncertain sends, admin latency, intake completions and photo failures. Recommend a seven-day observation window, extended if traffic is too low to exercise the workflow. Remove old runtime credentials only after reconciliation and acceptance. Supabase project deletion/cancellation is a separate explicit owner action; retain the export and restore instructions under the agreed retention policy.

## Rollback

Before reopening writes, rollback can switch to the prior Worker and unchanged Supabase source after verifying dispatcher ownership. After D1 accepts writes, a simple code rollback is unsafe: freeze writes again, pause dispatch, export and replay all post-cutover D1 records/events into Supabase using original IDs, copy new photos back and reconcile message state. Resume the old system only after counts and delivery status match. Prepare the reverse importer before cutover.

D1 Time Travel supports database recovery, but restoring a database does not undo emails already sent or restore R2 objects. Retain independent object copies and a delivery reconciliation log. Never use a database restore as permission to resend an uncertain lead.

## Publishing improvement included in this migration

Add a documented content-release command with dry-run diff, allowed-field validation, exact target/environment identity, source revision checks, backup, transactional apply and readback receipt. It should invalidate affected content caches and verify live URLs. Routine content work should no longer depend on opening an SQL editor. This workflow can also be implemented against Supabase first if migration is deferred.

## Estimate and decisions

Planning estimate: 7–12 focused engineering days plus the observation window, subject to the live inventory and concurrency prototype. The database-function rewrite and identity mapping drive uncertainty. No monthly cost estimate is asserted before usage and account-plan verification.

Before implementation: accept the target architecture; confirm admin identities/identity provider and any new costs. Before cutover: approve the tested release, write-pause window and rollback evidence. Current authorization covers this plan, not executing the migration.

## Official references reviewed

- D1 bindings and transactional batches: https://developers.cloudflare.com/d1/worker-api/d1-database/
- D1 limits (including per-database size): https://developers.cloudflare.com/d1/platform/limits/
- D1 recovery: https://developers.cloudflare.com/d1/reference/time-travel/
- R2 Worker bindings: https://developers.cloudflare.com/r2/api/workers/workers-api-usage/
- Access JWT validation: https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/
