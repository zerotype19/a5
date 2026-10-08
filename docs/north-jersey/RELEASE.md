# North Jersey regional directory release

Implementation and editorial review complete; publication/deployment receipts will be recorded below after release.

## Scope

Eight individually authored county pages, a searchable directory of all 226 municipalities in Bergen, Essex, Hudson, Morris, Passaic, Sussex, Union and Warren, county navigation on the homepage/footer/service pages, contextual request links, and compact admin coverage controls. Existing eight service categories and 62 content records are preserved. Target after publication: 70 published records and 75 sitemap URLs.

The location registry contains 227 records: 226 municipalities plus the historical combined Chatham service-area ID. The nine existing records remain untouched; 218 new rows include separate Chatham Borough and Chatham Township classifications. Both retain links to the existing shared Chatham guide. No inferred ZIP mapping or historical lead/vendor remapping.

Directory coverage means a homeowner can find their municipality and request review. It is not a claim of verified provider capacity in every place. No providers are activated, coverage mappings added, outreach sent or spending initiated. Supabase remains the data store and Cloudflare the runtime. No dependencies, infrastructure, tracking definitions or database schema DDL change.

## Validation

247 tests pass; lint, typecheck, Next and vinext production builds pass. The SQL seed was executed twice inside a rolled-back PostgreSQL transaction: 218 inserts followed by zero. Inventory tests check every county's municipality names/count, unique IDs, county disambiguation, historical Chatham preservation, conditional request context, draft/nonindexable sitemap exclusion, canonical routes, evidence links and absence of automatic content permutations.

All eight county previews passed 390px checks for one H1, correct municipality count, no horizontal overflow and no emojis. Regional directory and county-context intake passed 320px checks; Morris County passed a 1440px desktop review. Search distinguishes the three Washington Townships plus Washington Borough, and has a helpful empty state. The vendor control retained an added Bergen selection and existing Morris selections when filtering between counties. This was a synthetic local control review, not a production vendor edit. Temporary previews were removed before production builds.

## Publication and recovery

The exact content is in county-drafts.json; MANIFEST.json records IDs, paths and content hash. prepare-north-jersey.ts builds the reviewed plan from an anon-readable public snapshot. release-north-jersey.ts defaults to read-only preflight. --publish checks the project, manifest and unchanged nine-location baseline, backs up content/location rows, adds geography and staged drafts, attaches sources/relationships, and publishes each page with an updated_at compare-and-swap guard. The receipt is written after each publication.

This is not a multi-table transaction. If interrupted, inspect release-before.json and release-receipt.json in the ignored .wrangler/north-jersey directory before resuming. Do not rerun blindly. To withdraw a new page, conditionally return it to DRAFT/indexable=false using its receipt timestamp; never overwrite a later edit. Keep municipality/source rows because they may be referenced. Roll back the worker only after checking any new operational location references. Do not delete customer/vendor records.

The checked-in migration records equivalent idempotent geography seed SQL. The release uses authenticated REST inserts, not Supabase CLI migration-history tracking. No schema DDL is involved.

## Measurement

The existing submitted sitemap updates in place. Publication does not demonstrate indexing, ranking or lead growth. Assess search visibility and qualified requests by county and existing service/problem pages. Paid acquisition remains deferred. The eight-county definition excludes Hunterdon and Somerset pending an explicit broader geographic scope.

## Live release

Pending publication and deployment verification.
