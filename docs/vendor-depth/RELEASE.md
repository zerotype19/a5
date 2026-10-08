# Service expansion and vendor depth release

October 8 update: the subsequent [content/data release](../growth-wave-3/RELEASE.md) completed the ten-vendor target for all 3,616 pairs. STATUS.json and COVERAGE.csv contain current counts. The original eight-vendor milestone below is historical.

The owner-requested minimum is complete: all 3,616 combinations of 16 services and 226 municipalities have at least eight email-assignable business records. The production audit on October 8, 2026 found 193 real businesses: 168 with public business email contacts eligible for manual assignment and 25 inactive without email. This work added 110 distinct businesses in ten receipted batches and 18 source-backed service relationships on 13 existing businesses. No outreach was sent. Email presence is not proof of deliverability, availability, credential verification, or fit for every request.

## Production release

PR #39 merged to main at d196fbe. Cloudflare Worker version f948bcaa-9e6d-447b-a0b5-c7de52d00b74 serves the 16-service taxonomy; Supabase remains the database. The eight new authored hubs are heating and cooling, roofing, house cleaning, gutters, pest control, junk removal, tree services and appliance repair. Each has distinct content, illustrations, common requests, preparation and scope guidance. Existing intake, admin and signup selectors consume the canonical registry.

The data-only service seed was applied through the matching guarded release script, not the SQL migration ledger. It inserted eight service records and eight published/indexable authored hubs, and corrected outdated service-count/roofing-exclusion copy on 218 existing pages. Existing indexing flags were preserved. No schema changes, dependencies, automatic routing, spending or mass-generated service/town pages were introduced.

Production HTTP audit: 305 checks, zero HTTP issues, zero broken links; 296 published content records and 86 indexable content records. Release regression: 290 tests, typecheck, lint, Next build and Vinext build passed. Desktop live HVAC hub was visually inspected.

## Coverage

| Service | Lowest town count | Towns with 8+ | Towns with 10+ |
|---|---:|---:|---:|
| handyman | 8 | 226/226 | 101/226 |
| masonry | 11 | 226/226 | 226/226 |
| landscaping | 10 | 226/226 | 226/226 |
| painting | 11 | 226/226 | 226/226 |
| drywall | 9 | 226/226 | 204/226 |
| tile | 10 | 226/226 | 226/226 |
| plumbing | 9 | 226/226 | 183/226 |
| electrical | 8 | 226/226 | 39/226 |
| hvac | 9 | 226/226 | 204/226 |
| roofing | 12 | 226/226 | 226/226 |
| house-cleaning | 8 | 226/226 | 0/226 |
| gutters | 9 | 226/226 | 21/226 |
| pest-control | 8 | 226/226 | 85/226 |
| junk-removal | 8 | 226/226 | 0/226 |
| tree-services | 8 | 226/226 | 0/226 |
| appliance-repair | 8 | 226/226 | 63/226 |

The ten-vendor target remains open for the combinations recorded in COVERAGE.csv. The minimum milestone does not imply ten everywhere. Counts represent business-level advertised service and territory mappings, not a separate company office in every municipality.

## Assignment limits and evidence

DISCOVERED vendors with email remain manually assignable, without a capacity or preconfirmation gate. Missing-email vendors remain inactive. No vendors were promoted to ACTIVE. Source URLs, observation dates and scope notes are in CANDIDATES.json and SERVICE-ENRICHMENT.json and copied into the database discovery notes. Examples requiring request-level fit checks: PTL advertises heating/boiler work rather than cooling; Affordable Services is a Liebherr refrigeration specialist; some landscape contractors accept statewide projects rather than statewide routine mowing. These specialists do not establish eight interchangeable choices for every sub-job or appliance brand.

County exclusions are preserved: Ti Constant lacks Essex and Passaic in its published county list; Boost excludes Warren in its current list; Howey advertises only parts of Passaic, which were not expanded county-wide. Placeholder emails and duplicate identities were rejected. Shared email/phone is a hold signal; reviewed duplicate brands are not counted twice. Existing vendor territory, status and operating history were preserved during service enrichment.

## Receipts and recovery

Private before-images, batch CSVs, write intents and completed receipts are under .wrangler/vendor-depth/. The service release receipt is service-release-receipt.json; vendor batches are release-<manifest-hash>-receipt.json and service enrichment uses enrich-<manifest-hash>-receipt.json. Do not blindly repeat partial writes. Read-only dry runs should report zero new vendors and zero missing service mappings after this release. STATUS.json and COVERAGE.csv are reproducible with scripts/audit-vendor-depth.ts.

## Review closeout

The owner-designated “Brand positioning ideas” conversation accepted the minimum-eight milestone and 16-service expansion on October 8, 2026, with no further product or engineering corrections. Final read-only dry runs found zero new businesses and zero missing service mappings. A second production coverage audit reproduced 193 businesses, 168 email-assignable and zero pairs below eight. Wave-two verification passed 290 tests, lint, Next build and typecheck after regenerating Next route types (Vinext's generated route types initially conflicted with Next's validator). The ten-vendor target remains separately recorded rather than claimed complete.
