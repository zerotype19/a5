# ADR-006: Behavioral analytics — GA4

- **Status:** Accepted (locked)
- **Date:** 2026-09-23

## Context

A5 needs visitor behavior analytics separate from operational business truth.

## Decision

**Google Analytics 4 (GA4) handles behavioral analytics.**

Postgres owns business outcomes (lead, qualification, assignment, estimate, won/lost, job value).

## Consequences

- Do not send PII into GA4.
- Do not depend on GA4 to reconstruct business outcomes.
- Do not change analytics definitions without owner approval.
- Operational funnel events remain canonical in Postgres.
