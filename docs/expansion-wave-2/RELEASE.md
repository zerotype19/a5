# Content and geographic expansion — October 7, 2026

Release in preparation. Final deployment and live checks will be appended here.

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
