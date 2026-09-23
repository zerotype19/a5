# A5 Authority Engine

**Task:** A5-G001  
**Status:** Architecture foundation (almost no published SEO content)

## Authority philosophy

A5 is **not** building an SEO page factory.

A5 is building a **structured local home-services knowledge corpus** so homeowners, search engines, maps-supporting signals, and AI answer systems can understand:

```text
HOMEOWNER NEED → PROBLEM → SERVICE → LOCATION → USEFUL ANSWER → EVIDENCE → A5 → PROJECT REQUEST
```

Every indexable page must have: purpose, entity, intent, evidence, relationships, quality review, and **owner approval**.

> **Adding a service/location/problem entity does not authorize creating or indexing every possible page combination.**

> **Cursor may draft content. Cursor may not publish content without owner approval.**

---

## Entity model

| Entity | Source of truth | Notes |
| --- | --- | --- |
| Service | `config/services.ts` (+ DB `services`) | Do not duplicate taxonomies |
| Location | `config/locations.ts` (+ DB `locations`) | Approved NJ cluster only |
| Problem | DB `problems` | Homeowner-observable needs; few samples in G001 |
| Content page | DB `content_pages` | Canonical registry |
| Source | DB `sources` | Provenance; no credibility scores |
| Public project | `content_pages` where `page_type=PROJECT` + `public_project_approved` | Never auto-derived from Lead / ProjectPhoto |

Conceptual relationships (relational, not a graph DB):

```text
SERVICE → solves → PROBLEM
SERVICE → available_in → LOCATION
CONTENT → about → SERVICE / PROBLEM / LOCATION
PROJECT → evidence_for → SERVICE / PROBLEM / LOCATION   (future, approved only)
QUESTION → answered_by → CONTENT fields / sections
FACT → supported_by → SOURCE
```

**Solutions** table is deferred until a clear need appears.

---

## Page types

Canonical vocabulary (`ContentPageType`):

```text
SERVICE | LOCATION | SERVICE_LOCATION | PROBLEM
GUIDE | COST_GUIDE | COMPARISON | PROJECT | CORE
```

Machine-readable registry: `src/lib/authority/registry.ts` → `AUTHORITY_REGISTRIES`.

---

## URL architecture

Finalized in G001 (ADR-008 amendment):

```text
/services/{service}                 SERVICE
/home-services/{location}           LOCATION
/{location}/{service}               SERVICE_LOCATION
/services/{service}/{problem}       PROBLEM
/guides/{slug}                      GUIDE
/cost-guides/{slug}                 COST_GUIDE
/compare/{slug}                     COMPARISON
/projects/{slug}                    PROJECT
```

`{service}` and `{location}` are **registry slugs** (e.g. `madison`, not `madison-nj`).

Registry existence alone does **not** create or index a page. Routes resolve only when a **PUBLISHED** content record exists for that combination.

Reserved roots (never location slugs): `admin`, `api`, `request-service`, `privacy`, `terms`, `services`, `home-services`, `guides`, `cost-guides`, `compare`, `projects`.

---

## Publication states

```text
IDEA → DRAFT → REVIEW → APPROVED → PUBLISHED
                              ↘ ARCHIVED
```

- AI/Cursor may create `IDEA` / `DRAFT`.
- AI/Cursor may **not** autonomously create `PUBLISHED`.
- `validateForPublication(content)` returns VALID or blocking issues — it does not auto-fix or publish.

---

## Indexability

Publication and indexability are **separate**:

| status | indexable | Public URL | Sitemap | robots |
| --- | --- | --- | --- | --- |
| DRAFT / REVIEW / … | false | **404** (not readable) | No | n/a |
| PUBLISHED | false | Readable | No | `noindex, follow` |
| PUBLISHED | true | Readable | Yes | `index, follow` |

`robots=noindex` is **not** authorization. Drafts are denied by RLS + server queries.

---

## Source / provenance

`sources` + `content_sources` with relationship types:

```text
SUPPORTS | BACKGROUND | REGULATORY | COST_INPUT
```

Source types: `GOVERNMENT | MANUFACTURER | INDUSTRY | A5_FIRST_PARTY | OTHER`.

Cost guides require methodology, `last_reviewed_at`, and at least one source before publication validation passes. Market ranges are never presented as A5 quotes.

---

## Structured data

Builders in `src/lib/authority/schema.ts`:

- `buildOrganizationSchema` — from `config/site.ts` only
- `buildLocalBusinessSchema` — truthful facts only (no invented address/ratings/hours)
- `buildServiceSchema` — maps to `config/services.ts`
- `buildArticleSchema` — guides / cost / comparison where appropriate
- `buildBreadcrumbSchema`

Do not attach every schema type to every page. Do not invent ratings, reviews, street address, opening hours, or price range.

---

## Internal linking

Explicit `content_relationships` with constrained types:

```text
RELATED | PARENT | SUPPORTING_GUIDE | COMPARISON | COST_GUIDE | LOCAL_VARIANT
```

Public pages only link to **PUBLISHED** targets. Orphan detection identifies `PUBLISHED + indexable` pages with no inbound eligible relationship — it does **not** auto-publish or auto-link.

Commercial CTAs use canonical `/request-service` — no per-page lead forms.

---

## Privacy boundary

Operational data remains private:

```text
customers | leads | lead_notes | project_photos | submission_key | admin_users
```

The public authority layer queries only:

```text
content_pages | problems | problem_services | sources | content_sources | content_relationships
```

A public PROJECT page is separately approved public content — **not** a public rendering of a Lead.

---

## AI rules

AI may later assist with research, briefs, outlines, drafts, internal-link suggestions, and refresh recommendations.

AI may **not** autonomously: publish, invent local facts, invent project experience, invent reviews, invent prices, invent regulations, or invent sources.

`ENABLE_PROGRAMMATIC_PUBLISHING` remains `false`.

---

## How to add a future content page

1. Confirm the page has real demand, unique purpose, differentiated content, and evidence.
2. Ensure service/location/problem entities already exist in approved registries (do not invent).
3. Insert a `content_pages` row as `DRAFT` / `indexable=false` (or IDEA).
4. Attach sources and explicit relationships as needed.
5. Run `validateForPublication(...)` — fix blocking issues manually.
6. Owner moves status to `REVIEW` → `APPROVED` → `PUBLISHED`.
7. Owner sets `indexable=true` only when the page should enter the sitemap.
8. Do **not** generate the full service × location matrix.

---

## Rendering / cache

Authority pages are server-rendered (App Router). `revalidate = 3600` on content routes. Content must remain readable without client-side JS. No markdown dependency — sections are typed JSON blocks.

---

## Machine-readable registries

```ts
import { AUTHORITY_REGISTRIES } from "@/lib/authority/registry";
// pageTypes, contentStatuses, relationshipTypes, sourceTypes, ...
```
