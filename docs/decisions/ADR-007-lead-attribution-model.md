# ADR-007: Lead attribution model

- **Status:** Accepted (locked)
- **Date:** 2026-09-23

## Context

Every lead should preserve acquisition context. Aggregate search data must not be forged into user-level certainty.

## Decision

- Preserve **first-touch** attribution wherever available; do not overwrite it.
- Store **last-touch** separately when needed.
- Capture standard campaign/referrer fields (landing page, referrer, UTM params, click IDs, timestamps, session identifier) when present.
- Distinguish attribution confidence: `KNOWN` | `PLATFORM_REPORTED` | `INFERRED` | `UNKNOWN`.

## Consequences

- Organic Search Console query data is generally not deterministically tied to an individual lead.
- Never convert aggregate search information into fake user-level attribution.
- Exact schema fields are defined through approved migrations (not Day 0).
