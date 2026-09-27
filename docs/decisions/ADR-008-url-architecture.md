# ADR-008: URL architecture

- **Status:** Accepted (locked)
- **Date:** 2026-09-23

## Context

A5 has multiple page types (homepage, service hub, location hub, service × location, problem/intent, guide, cost guide, project, about, request service). Not every combination should be published.

## Decision

- Canonical public origin: `https://www.a5homeservices.com/`
- URL structures are derived from approved content registry records and product registries (`/config/services.ts`, `/config/locations.ts`).
- Programmatic generation of structures is allowed; **programmatic publishing of everything is not**.
- Every indexable page requires real demand, unique purpose, useful differentiated content, local relevance, quality review, and owner approval — otherwise `NOINDEX` or do not create the page.

### Finalized slug patterns (A5-G001)

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

`{service}` / `{location}` are registry slugs (e.g. `madison`). Registry presence does not authorize publishing or indexing a page.

## Consequences

- Sitemap derives from approved, published, indexable content only.
- Do not auto-generate hundreds of pages.
- Exact slug patterns for each page type are finalized in A5-G001 (`docs/AUTHORITY_ENGINE.md`).
