# Town profile publication progress

Initial scope: 202 existing published/noindex municipality records. Publish in the exact QUEUE.json order, ten per batch and two in the last batch. A batch is complete only after its live verification report has zero errors.

## Batch 01: ready for publication

Boonton, Boonton Township, Butler, Chatham Borough, Chatham Township, Chester Borough, Chester Township, Denville, Dover and Harding.

Official sources were read and checked against narrow local claims. ChatGPT's Brand positioning ideas editorial review approved all ten, with a reminder to verify Boonton Township's smoke-inspection responsibilities; the official Construction Department page confirms the distinction. Denville's 2023 newsletter supports only waterway geography, paired with the current NJDEP tool. No parcel-level risk or current insurance rules are inferred.

Validation: 303 tests passed, lint and typecheck passed, Next and Vinext builds passed. Vinext overwrites generated Next route types; rerunning `next typegen` restores them before a subsequent typecheck. Existing middleware/dynamic-import warnings remain unrelated to this content-only task.

Coverage: all 160 service/town combinations have at least ten active emailed vendors with recorded matching coverage. This does not establish specialty, current availability or deliverability.

The release tool defaults to dry-run, enforces exact queued IDs and reviewed digest, compares live updated_at, and records every write. Cache refresh is limited to regenerable HTML/RSC for the ten town paths and directory/county hubs. No runtime, schema, dependency, vendor or outreach changes.

## Batch 01: published and verified

2026-10-08: PR #50 merged (e0e8577); exact ten-record guarded release completed. Live verification: 10/10 HTTP 200, correct unique titles/descriptions, index/follow, canonicals, valid structured data, county inbound links and all 16 contextual intake links. Sitemap increased from 116 to 126 URLs. Boonton article and service cards were also inspected in a 390px browser viewport with no horizontal overflow. Ten completed; 192 remain.

## Batch 02: ready for publication

Jefferson Township, Kinnelon, Lincoln Park, Long Hill Township, Mendham Borough, Mendham Township, Mine Hill, Montville, Morris Plains and Mount Arlington. Current official municipal pages and Kinnelon's 2025 directory support narrow local distinctions; no fees, hours, universal permit rules or parcel flood claims copied. Brand positioning ideas editorial review approved all ten. All 160 service/town combinations retain at least ten active emailed mapped vendors. Tests, lint, typecheck and Next build passed. No runtime changes.

## Batch 02: published and verified

2026-10-08: PR #51 merged (09778ba). Ten guarded updates applied and 10/10 live checks passed with zero errors. Sitemap: 136 URLs. Twenty completed; 182 remain.

## Batch 03: ready for publication

Mount Olive, Mountain Lakes, Netcong, Pequannock, Riverdale, Rockaway Borough, Rockaway Township, Roxbury, Victory Gardens and Washington Township (Morris). Brand positioning ideas approved all ten. Official sources support the local project guidance; no collection dates, fees or property-specific approvals inferred. All 160 service/town combinations retain at least ten mapped active emailed vendors. Tests, lint, typecheck and Next build passed. Wharton remains the final Morris municipality and begins batch 04.

## Batch 03: published and verified

2026-10-08: PR #52 merged (1ccdfaf). Ten guarded updates applied; live verification passed 10/10 with zero errors. Sitemap: 146 URLs. Thirty completed; 172 remain.

## Batch 04: ready for publication

Wharton completes Morris; Belleville, Caldwell, Cedar Grove, East Orange, Essex Fells, Fairfield, Glen Ridge, Irvington and Maplewood begin Essex. Editorial review approved all ten; its Maplewood wording refinement was incorporated. Official resources support narrow local claims, with exact property responsibility and approvals left to the relevant office. All 160 service/town combinations retain at least ten mapped active emailed vendors. Tests, lint, typecheck and Next build passed. No runtime changes.
