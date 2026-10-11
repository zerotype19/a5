# Cost library release — October 11, 2026

Owner asked to finish the cost library after consulting Brand positioning ideas. Scope: 16 service cost guides, a ten-question homeowner estimate FAQ, the existing cost-guide hub, source attribution, internal links and mobile presentation. No new dependencies, database schema, services, towns or vendor/lead changes.

## Content review

The publication manifest contains 17 authored records, 33 source references and 35 source links. Every category retains separate, attributed publisher observations with geography, unit and scope. Each page has tailored cost factors, quote questions and preparation advice. The plumbing Facebook average is not published. No NJ multiplier, statewide price average, invented customer price or A5 quotation is claimed.

Primary price observations were checked against their source text; second-publisher references were reviewed for scope. Differing ranges are not averaged. HVAC's Atlanta-labeled Angi figure is excluded from the price cards; its article remains background reading while HomeGuide supplies diagnosis and common-repair examples. Older source dates remain visible, including the 2023 independent-handyman and 2024 junk-removal comparisons. These are published planning references, not a representative local survey. Quarterly factual review is recommended but no automation was scheduled.

Brand positioning ideas reviewed the proposal and implementation approach. Chat reviewed the complete authored copy and approved publication after four corrections: remove overlapping FAQs, make the introduction conditional, distinguish A5 review dates from source dates, and finish source/build verification. Those corrections are applied; the tree-permission question has NJDEP background provenance. No further editorial cycle was requested. Live evidence is recorded with the PR.

## Validation

- 328 tests pass, including category coverage, publication requirements, price-source joins, discovery and sitemap eligibility.
- Lint, typecheck, Next build and Cloudflare build pass.
- All 17 article previews plus hub return 200; one H1 each, expected price/source rendering and service-prefilled CTAs checked.
- Desktop and 390px/320px mobile previews inspected. Cost-guide contents collapse on mobile. Hub service labels use separated project examples.
- The mobile sticky request action preserves the service for the new cost-guide slugs.
- Local preview route removed before production builds.

## Release and recovery

`release-cost-guidance.ts` is read-only by default. It checks the exact content digest, expected database project, category coverage and absence of conflicting pages/source IDs. With `--apply`, it inserts sources, then nonpublic APPROVED pages, source joins and service relationships. Pages become PUBLISHED in one final update. The ignored receipt records each write and prevents blind reruns after an uncertain result.

Deploy the renderer before publishing the content so the new cost sections render immediately. Invalidate affected generated cache entries after publication. Verify all 18 routes, canonicals, robots, sitemap entries, source links and intake context live.

Recovery: archive only the 17 manifest page IDs and set their indexable flags false, then revert the application release if necessary. Keep sources and receipt evidence; do not touch operational data or delete historical records. Any partial release must be reconciled against its receipt rather than rerun.
