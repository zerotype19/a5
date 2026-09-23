# ADR-010: Content architecture

- **Status:** Accepted (locked)
- **Date:** 2026-09-23

## Context

A5 needs a controlled local content footprint that supports qualified demand, not traffic volume alone.

## Decision

- Page types: Homepage, Service Hub, Location Hub, Service × Location, Problem/Intent, Guide, Cost Guide, Project, About, Request Service.
- Initial footprint targets ~40–50 indexable URLs (not mass programmatic SEO).
- Every indexable page has a structured content registry record (slug, type, service, location, status, indexable, metadata, review dates).
- Content workflow: Opportunity → Research → Brief → Draft → Review → **Owner approval** → Publish → Measure → Refresh.
- AI may move Idea → Draft; it may **not** autonomously move Draft → Published during MVP.

## Consequences

- `ENABLE_PROGRAMMATIC_PUBLISHING` remains `false` unless explicitly approved later.
- AI must not fabricate reviews, projects, credentials, pricing-as-fact, or local regulations.
- Local factual claims require evidence.
