# ADR-010: Content architecture

- **Status:** Accepted (locked)
- **Date:** 2026-09-23

## Context

A5 needs a controlled local content footprint that supports qualified demand, not traffic volume alone.

## Decision

- Page types: Homepage, Service Hub, Location Hub, Service × Location, Problem/Intent, Guide, Cost Guide, Project, About, Request Service.
- No fixed indexable-page ceiling. Every indexable URL must represent distinct homeowner intent, contain materially differentiated useful content, pass factual/source review where claims require it, have an explicit canonical and a place in the authority graph, and be owner-approved for publication.
- Automated service × location × problem permutations remain prohibited.
- Every indexable page has a structured content registry record (slug, type, service, location, status, indexable, metadata, review dates).
- Content workflow: Opportunity → Research → Brief → Draft → Review → **Owner approval** → Publish → Measure → Refresh.
- AI may move Idea → Draft; it may **not** autonomously move Draft → Published during MVP.

## Amendment (2026-09-30)

The original ~40–50 URL target stopped an agent from expanding 8 services × 6 towns × 40 problems into hundreds of thin URLs. That protection stays, as a quality gate rather than a count. Owner approved the first 22-page authority tranche and replaced the numeric ceiling with the rule above.

## Consequences

- `ENABLE_PROGRAMMATIC_PUBLISHING` remains `false` unless explicitly approved later.
- AI must not fabricate reviews, projects, credentials, pricing-as-fact, or local regulations.
- Local factual claims require evidence.
