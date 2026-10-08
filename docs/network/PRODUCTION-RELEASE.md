# Production release and municipality reconciliation — October 8, 2026

Released PR36 and PR37 to production. Main commit `25ea0858fc8440466c5bbcaf9c1c2e21117bb068`; reviewed source `3e916310f9ffb23f01ee9e5cd56ab9cb647fa7b5` has an identical tracked tree. Cloudflare Worker version `dfc9c169-acc3-4e8f-b3a0-630000f58378`. Supabase remains the database.

## Live changes

Network positioning and protected opportunity previews, provider signup, and all 288 audited database copy updates are live. `ENABLE_VENDOR_SIGNUP=true`; `ENABLE_NETWORK_FOLLOWUP=false`; acceptance default 24 hours. Existing operations alert cron and hello@a5homeservices.com are preserved. No new outbound email, automatic routing, spending, or follow-up activation occurred.

Migrations `20261008030000` and `20261008050000` committed together through the authenticated Supabase SQL editor. A private RLS-protected migration ledger records these two migrations; it does not claim retrospective tracking of earlier migrations. All four new application tables have RLS and deny anon/authenticated SELECT. Signup RPC succeeded inside a transaction that was rolled back; no test signup remains.

## Actual coverage

| Measure | Production result |
| --- | --- |
| Municipalities / counties | 226 / 8 |
| Real business records | 83 |
| ACTIVE / DISCOVERED / INACTIVE | 36 / 22 / 25 |
| Usable business email | 58 |
| Missing-email records preserved inactive | 25 |
| Vendor-service mappings | 125 |
| Vendor-location mappings | 3,133 |
| Town/service pairs with emailed mapped vendors | 1,808 / 1,808 |
| Minimum emailed vendors per pair | 2 |
| Missing town/service pairs | 0 |

The existing A5 Owner Email Test fixture is excluded. No duplicate business names were found; two CertaPro franchise branches intentionally share a domain. All real businesses have source URLs. All six initial pilot candidates are already in production; their ledger now reflects that fact.

[Complete municipality/service reconciliation](TOWN-COVERAGE.csv) lists all 1,808 pairs. Assignment options include emailed DISCOVERED businesses, following the owner's free-lead model; ACTIVE is not a prerequisite. Counts describe recorded advertised scope and email syntax, not participation, deliverability, availability, vetting, or guaranteed fulfillment. This audit reconciles existing source-backed imports; it is not a new independent verification of every vendor website.

## Publication verification

297 unique intended public routes returned HTTP 200, including 288 content records and nine core/form/legal routes. All discovered internal link destinations returned successfully. Published content: 78 indexable and 210 intentionally noindex. Six core sitemap routes produce 84 sitemap URLs. Every content route passed canonical, robots, sitemap membership, and intake-link checks. All 226 municipal profiles are published. Indexable does not mean indexed by Google. There are not 1,808 separate service-town landing pages; 1,808 describes vendor mapping coverage, while existing authored pages define the current intended URL inventory.

Exact live text matches all 288 approved manifest updates. Prior values and per-row writes are preserved in the approved copy manifest and private `.wrangler/network/content-receipt.json`. No publication or indexability flags were changed.

288 tests, lint, typecheck and Vinext build pass; GitHub CI passed the exact reviewed source. Production signup and intake reject invalid requests with 400. Production signup database success/rollback and permissions were verified. No successful real CAPTCHA submission or end-to-end email delivery is claimed for this release; earlier mailbox confirmation is not a substitute for the separately gated network communications trial.

## Repeatable audit and rollback

Run `node --env-file=<production-env> --experimental-strip-types scripts/audit-network-production.ts --http` from the repo. It only reads production and stores private raw evidence under ignored `.wrangler/network/`; the CSV contains aggregate counts only.

Previous Worker: `4cea6118-2127-455a-8d59-88bcef5cc9ff`. Preserve additive schema and audit history. Disable signup if needed. Before reverting assignment behavior, inspect/revoke affected outstanding capabilities as documented in RELEASE.md. Restore content only with receipt and compare-and-swap checks for intervening edits; never blindly overwrite later changes.

Remaining work is enrichment of 25 missing business emails, deeper municipal content, and separately reviewed communications activation. No database coverage gap was found in the current eight-service registry.
