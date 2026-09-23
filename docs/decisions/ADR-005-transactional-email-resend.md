# ADR-005: Transactional email — Resend

- **Status:** Accepted (locked)
- **Date:** 2026-09-23

## Context

A5 needs transactional email for customer confirmation, vendor lead notification, and operations alerts.

## Decision

**Resend is the approved transactional email provider.**

Email is a communication layer, not the system of record.

## Consequences

- Templates must be controlled.
- AI-generated customer communication must not send autonomously.
- Initial email classes: customer transactional, vendor lead notification, A5 operations.
- Do not introduce another email SaaS without owner approval.
