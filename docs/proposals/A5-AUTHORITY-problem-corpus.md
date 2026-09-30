# A5 authority draft: service hubs as help centers + problem corpus (tranche 1)

- **Branch:** `feature/a5-authority-problem-corpus` (from `origin/main` @ `695dbd9`)
- **Date:** 2026-09-29
- **Status:** DRAFT — not published, not seeded, not in the sitemap
- **Owner approval required** before any of this becomes a `content_pages` record

## What this is

Draft copy only, stored as typed data in `src/lib/authority/drafts/`:

| File | Contents |
| --- | --- |
| `drafts/service-hubs.ts` | Rewrites of the eight SERVICE hubs, each with its own structure |
| `drafts/problems.ts` | 14 PROBLEM pages (tranche 1) |
| `drafts/claims.ts` | Statements that need a source attached before publish |
| `drafts/types.ts` | Draft shapes, the A5-G002 problem-entity list, validation helpers |
| `tests/a5-authority-drafts.test.ts` | Guards: DRAFT-only, not imported by the app, no fabricated claims, URL budget |

Sections use only the existing `ContentSection` types, so no renderer or schema change is needed to publish them later.

## Why nothing was wired

`GOVERNANCE.md` forbids agents from publishing content, ADR-010 forbids AI moving Draft → Published, and `docs/AUTHORITY_ENGINE.md` makes a page public only when a `PUBLISHED` `content_pages` row exists. The sitemap is built live from `PUBLISHED` + `indexable` rows. Writing seed SQL or database rows would be the first step of publishing, so this branch stops at repo files that nothing imports.

## Withheld from the sitemap

Everything below. None of it is reachable, seeded, or listed.

**Hub rewrites (0 new URLs — these replace copy on existing routes):**
`/services/handyman`, `/services/masonry`, `/services/landscaping`, `/services/painting`, `/services/drywall`, `/services/tile`, `/services/plumbing`, `/services/electrical`

**Problem pages (14 URLs):**

| Canonical URL | Problem entity | Primary service | Other services |
| --- | --- | --- | --- |
| `/services/masonry/brick-step-repair` | brick-step-repair | masonry | — |
| `/services/masonry/loose-mortar` | loose-mortar | masonry | — |
| `/services/masonry/sunken-pavers` | sunken-pavers | masonry | — |
| `/services/plumbing/visible-pipe-leak` | visible-pipe-leak | plumbing | — |
| `/services/plumbing/running-toilet` | running-toilet | plumbing | — |
| `/services/drywall/water-damaged-ceiling` | water-damaged-ceiling | drywall | plumbing, painting |
| `/services/drywall/hole-in-drywall` | hole-in-drywall | drywall | — |
| `/services/drywall/drywall-crack` | drywall-crack | drywall | — |
| `/services/electrical/failed-light-fixture` | failed-light-fixture | electrical | — |
| `/services/electrical/dead-outlet` | dead-outlet | electrical | — |
| `/services/tile/crumbling-grout` | crumbling-grout | tile | — |
| `/services/painting/peeling-exterior-paint` | peeling-exterior-paint | painting | — |
| `/services/handyman/sticking-interior-door` | sticking-interior-door | handyman | — |
| `/services/landscaping/yard-surface-grading` | yard-surface-grading | landscaping | — |

`water-damaged-ceiling` would also resolve at `/services/plumbing/…` and `/services/painting/…`, but canonical metadata and the sitemap use the primary-service path only, so it counts as one indexable URL.

## URL-count impact (ADR-010 target ~40–50 indexable)

| Scenario | Core | Hubs | Location hubs | Problems | Total |
| --- | --- | --- | --- | --- | --- |
| Tranche 1 only | 2 | 8 | 0 | 14 | **24** |
| Tranche 1 + six location hubs | 2 | 8 | 6 | 14 | **30** |
| Every G002 problem entity | 2 | 8 | 0 | 42 | **52** — over budget |
| Every G002 problem entity + location hubs | 2 | 8 | 6 | 42 | **58** — over budget |

"Core" is `CORE_SITEMAP_ROUTES` (`/`, `/request-service`). The full service × location matrix (48 more) is not proposed.

**Recommendation:** publish no more than tranche 1 (14) until owner sets a hard cap. That leaves roughly 10–20 slots for location hubs, guides, cost guides, and approved projects.

## Information architecture

```text
/services/{service}                  8 hubs (help centers)
  └─ /services/{service}/{problem}   tranche 1: 14 problems, ≥1 per service
                                     later: remaining 28 G002 entities, owner-selected
/request-service                     single request path from every page (CTA)
```

Each hub has its own organizing idea:

| Hub | Organizing idea |
| --- | --- |
| Handyman | Build a list; handyman-vs-trade table |
| Masonry | Unit / joint / base diagnosis; repair-vs-rebuild table; winter pattern |
| Landscaping | Three jobs (cleanup / planting / grading); northern NJ yard calendar |
| Painting | Read the failure first; lead paint in pre-1978 homes; exterior season |
| Drywall | Four sizes of damage; water → board → paint sequence; plaster vs drywall |
| Tile | Can it be matched? Is it dry behind? |
| Plumbing | Stop the water first; then classify; who does plumbing work |
| Electrical | Safety stop signs first; one device vs circuit; older wiring |

The problem pages share one help-article structure on purpose: what you're seeing, (optional) first steps, likely causes, what to photograph, repair or replace, who you need, cost factors, questions, related problems, request.

## Editorial guardrails applied

- No prices or dollar amounts; cost is framed as factors only.
- No testimonials, reviews, ratings, or "A5 completed/installed" claims. "Typical projects" sections describe kinds of work, not jobs done.
- No invented credentials. Licensing appears only as homeowner guidance ("it is reasonable to ask…"), never as a claim about A5's vendors.
- No emergency promises: plumbing and electrical say A5 does not offer emergency dispatch.
- Photo guidance is capped at five shots, matching `MAX_PROJECT_PHOTOS`.
- Local context uses only the six registry towns. Tile names the service area only, because no real tile-specific local fact was available.
- No imagery exists in `public/`, so hub visuals are text descriptions in `typicalProjectVisuals`, each labeled "Typical projects".

## Sources attached

Each remaining factual claim in `drafts/claims.ts` has `sourceUrl` and `exactSupportedClaim`. Wording that those sources do not support was removed or narrowed on the page:

- Freeze-thaw is limited to NOAA 1991–2020 January normals at Canoe Brook (USC00281335): high 39.5°F, low 21.9°F. Summer humidity, indoor winter dryness, and a separate measurement for each town were removed.
- De-icing salt is limited to Brick Industry Association Technical Note 14B: residue on clay-paver walks can stain joints and cause efflorescence. It is no longer described as speeding surface flaking.
- Mortar and freezing cites BIA Technical Note 1.
- Plumbing contracting cites the NJ master-plumber board FAQ / N.J.S.A. 45:14C-12.3.
- Electrical contracting cites N.J.S.A. 45:5A-9.
- Permits cite N.J.A.C. 5:23-2.7, 2.14, and 2.17A. Like-capacity water-heater replacement is minor work and still needs a permit. A new circuit is not ordinary maintenance.
- 811 cites N.J.A.C. 14:2-3.1 and New Jersey One Call's private-facilities page.
- Lead paint cites 40 CFR Part 745 Subpart E, including the small-repair and lead-free exceptions.
- The claim that the six towns range from plaster houses to drywall houses was removed. Census year-built data does not identify wall material.

## Canonical pages

Problem entities stay on A5-G002 (`5477208`). This branch does not insert `problems` rows. `brick-step-repair` updates G001 content page `10000000-0000-4000-8000-000000000004` at `/services/masonry/brick-step-repair`. The other 13 problem drafts would be one new `content_pages` row each, at `/services/{primary}/{slug}`, after that G002 problem row exists.

## Dependencies and conflicts to resolve before publish

1. **A5-G002 is not on `main`.** The problem entities (`problems`, `problem_services`) and the current hub copy live on `feature/a5-g002-service-authority` (`5477208`). These drafts reuse G002 slugs exactly and add no new entities. Either G002 merges first, or its entity list is carried into the publishing task.
2. **Hub rewrite supersedes G002 hub copy.** G002's test asserts every hub's primary question starts with "What can A5 help with for …". The rewrite deliberately breaks that template, so the test must change when this copy is adopted.
3. **`brick-step-repair` already has a G001 PROBLEM fixture** (`10000000-0000-4000-8000-000000000004`). The tranche-1 draft is meant to replace that copy in place, not create a second record.
4. **Live status unverified.** `main` links to `/services/{slug}` as if the hubs are published. Production data was not queried for this draft.

## Owner decisions needed

- Approve, edit, or reject each hub and problem page.
- Confirm `drywall` (vs `plumbing`) as the canonical service for `water-damaged-ceiling`.
- Set a hard indexable-URL cap, or confirm tranche 1 (14) as the next ceiling.
- Confirm the landscaping answer about recurring lawn maintenance (currently defers to intake).
- Authorize a separate publishing task: render DRAFT seed rows → owner REVIEW → PUBLISHED → `indexable=true`.
