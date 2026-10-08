# Content, measurement and vendor depth — October 8, 2026

Owner-authorized sequence: content (5), measurement (6), database QA, missing-email recovery (2), ten-vendor depth (1). The owner-designated Brand positioning ideas task approved the 16-page content wave and the analytics/assignment fixes. Existing production authorization applies.

## Published content

Eight practical guides and eight problem pages are live for HVAC, roofing, house cleaning, gutters, pest control, junk removal, tree services and appliance repair. The reviewed manifest is `content/growth-wave-3/manifest.json`. It adds eight problem entities, eight service/problem mappings, five primary reference sources, ten source links and 48 relationships connecting guides, problems and service hubs. Distinct question, answer, sections, metadata and contextual CTA treatments were checked. The pages preserve provider scope, local resource guidance and network positioning without fabricated prices, reviews or local offices.

The release used the guarded data script with private before-images and receipts, following the existing content/import release path. No schema change or new dependency. The initial metadata uniqueness test found matching guide/problem descriptions; a shell sequencing mistake allowed publication before that failed check stopped the release. All 16 descriptions were immediately corrected with compare-and-set writes, and the final manifest and test now agree. Receipts preserve both operations. No claim is made that the original pre-publication check passed.

Public audit: 312 published content records, 102 indexable content pages, 108 sitemap URLs including core routes. The other published pages retain their intentional noindex state; sitemap inclusion is not proof of Google indexing. Pre-code-release audit checked 321 routes with zero HTTP, canonical, robots, sitemap or internal-link errors.

## Vendor target and field quality

212 real businesses, 187 with published business email; every one of 3,616 combinations of 16 services and 226 municipalities has ten or more distinct mapped emailed businesses. This wave added 19 businesses, recovered one existing email and added three service relationships on two existing businesses. Daibes was correctly skipped as an existing identity. County claims and specialty limits are recorded with source URLs and dates. Counts represent category-level advertised coverage, not ten interchangeable specialists for every job or brand. Imports remain DISCOVERED and manual routing remains unchanged.

Corrections made with private before-images:

- A5 Owner Email Test: INACTIVE, email cleared, accepting_leads=false; history retained, excluded from vendor counts and new email assignment.
- HomeTech Fix: replaced the invalid published service-page domain with `info@homtek-fix.com`, the exact current homepage address with mail records.
- All Star Hauling: invalid email domain removed, INACTIVE, accepting_leads=false; original value retained in notes for research.
- Mohawk Handyman Services: exact official `info@mohawkhandymanservices.com` recovered, restored to DISCOVERED, existing Sparta territory preserved.

The original missing-email set is now 24 unresolved; All Star adds one newly quarantined record, leaving 25 real inactive vendors. No guessed emails, form submissions or outreach. JMB Tile and Pipe Works had secondary/older email hints but were not overwritten without sufficient current evidence. Example/template addresses and unrelated businesses were rejected.

Final DNS review: 109 distinct email domains, 105 with explicit mail records, four with address records only (First Rate Chimney, NJ Handyman Services, Two Pest Control and Balance of Nature). Those four vendor records now carry an explicit mail-route QA note in the assignment-visible discovery notes; those mail routes remain unverified; an address-record fallback is not proof of delivery. Published email presence is also not proof of a live mailbox for any vendor. Delivery failures must remain actionable in the operations queue.

The paginated QA checks registry names/IDs, email/phone/URL formats, placeholder values, suspicious contact-name fields, missing-email status, fixture quarantine, service/location relationships, foreign keys, duplicate identities, content structures and problem/service alignment. Operational checks use IDs/status only, excluding homeowner contact details/descriptions/tokens. The full aggregate result is in `DATA-QA.json`; private evidence stays in ignored `.wrangler/growth-wave-3/`.

## Application and measurement changes

- `request_started` now waits for consented analytics readiness and emits once per mounted intake. Earlier actions are not replayed. The submitted event still requires canonical API success; CAPTCHA/rejected requests are not conversions.
- Vendor selection uses compact labels and displays recorded service/location match plus scope/credential notes at the assignment decision. This is operator guidance, not a new eligibility gate.
- Replaced stale homepage “eight core home services” copy.
- Updated sourcing and measurement documentation to the current 16-service free-lead model.

Assignment component interaction was verified in an isolated local fixture: selecting a vendor displayed the service match, location mismatch, specialty restriction, credential note and profile link. No production assignment was created.

Browser checks on production: mobile homepage at 390px, all three request stages at 390px, footer at 320px; clean wrapping and visible controls. No test lead was submitted. Footer consent began off with no GA tag; allowing analytics loaded G-ZLD8SRP78F; withdrawal reloaded with no tag. Google account reports were not accessible: in-app Google requires sign-in, Chrome connection times out. Public PageSpeed API returned quota error 429, so no new performance score is claimed. Account-level GA4 receipt, current Search Console indexing and fresh CAPTCHA-to-inbox verification remain open.

## Validation and release

294 tests pass, including consent/privacy and delayed-start deduplication regressions. Lint, typecheck, Next and Vinext production builds pass. No dependencies, schema, routing, service registry, geography registry or follow-up activation changed. ENABLE_NETWORK_FOLLOWUP stays false. Supabase remains the system of record.

PR #41 passed exact-head CI run 37729186308 and merged as 9037dd6. Cloudflare Worker cfb9cf01-71ba-4a4a-bc69-bb41dcdf2ced is deployed. Post-deployment audit again checked 321 routes with zero HTTP/canonical/robots/sitemap/link issues. The live analytics, intake and assignment-selector JavaScript assets exactly match the reviewed build; homepage copy is updated. A post-deploy guide inspection found direct answers repeated in INTRO sections; the duplicate INTRO was removed from all 16 new records with compare-and-set receipts and a regression assertion. Only those pages’ regenerable HTML/RSC cache entries were invalidated. This editorial correction requires no runtime redeployment. Private content/vendor receipts record each completed write and support targeted recovery; do not blindly rerun applied scripts.
