# Content and geographic expansion — October 7, 2026

Published and deployed. PR #26 merged as `855171c707418d53b7a656532de210d7a9672d49`; Cloudflare Worker version `1a44af14-cc10-4dea-beb7-660ee2e3ffdd`.

## Exact scope

- Three town hubs: Livingston, Summit and Hanover Township.
- Six local service pages: Livingston handyman and painting; Summit plumbing and tile; Hanover Township landscaping and masonry.
- Four problem pages: punch-list repairs, paint after patching, dripping faucet and overgrown planting beds.
- Twenty-two existing service/problem revisions. Existing URLs, titles/metadata and publication history are retained.
- Target: 62 published content records and 67 sitemap URLs, across nine municipalities and eight existing services. This is a curated batch, not an automatic town/service/problem matrix.

The registry and idempotent location seed add request geography only. New-town hero copy, schema and request forms say provider availability is checked individually. No provider is activated, no coverage mapping added, no outreach sent and no paid pilot started. Supabase remains the data store; Cloudflare remains the runtime.

## Validation and publication

241 tests, lint, typecheck, Next build and vinext build passed. The location seed was applied twice in a local PostgreSQL transaction (3 rows, then 0 rows) and rolled back successfully. All 35 changed pages were reviewed at 390px with no overflow, one H1 and no emojis/text arrows; representative 320px and desktop views passed. Source review is recorded in ../editorial/REVIEW-STATUS.md. MANIFEST.json defines exact page IDs, routes, counts and content hash.

Prepare with scripts/prepare-expansion-wave-2.ts against the saved public baseline. scripts/release-expansion-wave-2.ts defaults to a read-only preflight and requires --publish plus authorized production credentials. It checks the project ID and manifest, backs up affected rows, stages new pages as drafts, adds sources/relationships, then uses per-row updated_at compare-and-swap. This is not one multi-table transaction: an interruption can leave a partial release, recorded after every row. Inspect the receipt before resuming.

## Recovery

The pre-release rows are saved in .wrangler/expansion-wave-2/release-before.json. If recovery is necessary, conditionally restore only changed editorial/review fields using the corresponding release-receipt updated_at values; do not overwrite later edits. New pages can be returned to DRAFT/indexable=false with the same conditional guard. Keep source and municipality records; they are harmless when drafts are private and may already be referenced by requests. Roll back the worker through Cloudflare only after reviewing whether new registry routes are still required. Never delete customer or vendor records as part of content recovery.

## Measurement

The existing GA4 property and Search Console sitemap cover the new cohort. Publication is not evidence of indexing or lead growth. Track search impressions/clicks and requests from the exact new paths; compare qualified leads and outcomes after enough requests mature. Paid acquisition remains deferred. Provider coverage must be confirmed per request until the owner supplies verified standing coverage.

## Live verification

- Publication completed at 2026-10-07T21:54:59.385Z. All 35 intended records matched the released answers and sections; Supabase has 62 published records and nine locations.
- Location data was seeded through the same authenticated, idempotent REST release path; the checked-in migration records the equivalent SQL. It was not applied through Supabase migration history. No schema DDL or vendor mappings changed.
- Added nine source records and 124 reciprocal content relationships. New-record preparation timestamps were aligned to actual release time; the publisher now stamps staging time instead of carrying proposed draft timestamps into production.
- At 2026-10-07T21:57:04.469Z, all 67 sitemap URLs returned 200 with one H1, correct canonical, indexable robots and no emoji/text arrows. All 35 changed answers were present. Root trailing-slash equivalence is normalized by the checker.
- The Summit-context intake form displayed the individual-availability notice. The temporary /authority-preview route returned 404. Published Livingston hub and its selected local links were also verified in the browser.
- CI run 37692570621 passed. Local tests (241), lint, types, Next and vinext builds passed. Existing middleware and bundler warnings remain nonblocking.
- The live sitemap is updated at the already-submitted Search Console URL. An additional manual resubmission was not performed because the signed-in Mac browser was locked; no new indexing/ranking result is claimed.

Private operational evidence: .wrangler/expansion-wave-2/release-before.json, release-receipt.json, after.json, live-verification.json and deploy.log. The exact reviewed content hash is recorded in MANIFEST.json. No credentials are committed.
