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

## Reconciliation — later September 30 owner-approved open assignment

The September 30 `20260930180000_open_vendor_assignment.sql` migration and matching application eligibility rule supersede the earlier ACTIVE/accepting/service/geography assignment gates above. An operator may manually select a vendor; a vendor who already passed that lead remains excluded. Coverage and status are evidence for the operator to review, not enforced eligibility gates. The October 7 operations work preserves that released behavior. Automatic routing stays disabled, imports do not activate vendors, and verified fulfillment readiness is a separate operating obligation.

## October 8 owner clarification — free lead forwarding

The owner explicitly confirmed that A5 currently forwards free leads without prior vendor confirmation or capacity/availability checks. These are not onboarding, assignment, content publication or geographic expansion gates. This clarification supersedes contrary readiness requirements in earlier plans. Public business emails may be used; source research is not represented as consent, vetting, verified credentials or guaranteed service.

Vendors without a usable business email are marked INACTIVE, with accepting_leads=false, until an address is located. Admin saves/imports enforce this state. Missing-email inactive vendors stay in the research queue. After adding an email, the operator may set Active; no capacity confirmation is required. The admin selector and assignment action require a usable email to prevent creating an undeliverable new handoff. Other open-assignment rules and per-lead Accept/Pass behavior remain unchanged; pass exclusion, delivery failures, token privacy and audit history remain intact. The system does not silently mark a forwarded lead accepted or completed.

The operational queue prioritizes review, assignment, email delivery failures and explicitly scheduled follow-ups. A sourced email or DISCOVERED status does not by itself create a confirmation task. No new recruitment campaign, automatic assignment, billing or mass-send action is authorized by this clarification.
