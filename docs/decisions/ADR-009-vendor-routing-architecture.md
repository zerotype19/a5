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

## Amendment — 2026-09-29 owner lock

Fulfillment is the production priority ahead of the next content batch.

- Vendor lifecycle is `DISCOVERED` → `APPROVED` → `ACTIVE`, with `PAUSED` and `INACTIVE` for operations. No recruiting CRM.
- Candidates enter through a CSV import. Columns are `business_name`, `contact_name`, `phone`, `email`, `website`, `services`, `locations`, `source`, `source_url`, `discovery_notes`.
- Services and locations must match the approved registries. Unknown values are rejected.
- Import creates `DISCOVERED` vendors with `accepting_leads = false`. Import never activates a vendor.
- There is no in-app Google scraper. Public ratings are not an A5 score.
- Email Accept/Pass (A5-009) is the vendor response. There is no vendor portal.
- A vendor email is a delivery attempt. It does not roll back a successful assignment.
- The raw opportunity token is emailed once. The database stores only its SHA-256 hash. Links expire after 72 hours. A retry revokes older hashes for that assignment.
- Accept and Pass are POST actions on `/opportunity/{token}`. They are one transaction and return the lead to QUALIFIED on pass. A vendor who passed is not assigned that lead again.
