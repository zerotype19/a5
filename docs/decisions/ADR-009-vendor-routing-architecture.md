# ADR-009: Vendor routing architecture

- **Status:** Accepted (locked)
- **Date:** 2026-09-23

## Context

A5 coordinates local service providers. MVP must learn marketplace behavior before automation.

## Decision

- MVP routing is **intentionally manual**.
- Eligibility = service match + geography match + vendor `ACTIVE` + vendor accepting leads.
- Then: **owner selects vendor**.
- Assignment is modeled as `LeadAssignment` (history-preserving), not only `lead.vendor_id`.
- Do not build AI routing, predictive matching, or automatic contractor selection in MVP.

## Consequences

- `ENABLE_AUTOMATIC_ROUTING` remains `false` unless explicitly approved later.
- Only `ACTIVE` vendors may receive leads.
- MVP leads are free — no payments/billing in MVP.
