# ADR-003: Hosting / edge — Cloudflare

- **Status:** Accepted (locked)
- **Date:** 2026-09-23

## Context

A5 requires edge delivery, bot protection (Turnstile), and production hosting under owner control.

## Decision

**Cloudflare is the approved hosting/edge platform** for the public application path (DNS/CDN/edge as configured by the owner).

## Consequences

- Production deployment remains owner-controlled.
- Agents must not autonomously change DNS or production Cloudflare configuration.
- Preview/staging must not be indexable by search engines.
- Vercel is not the approved hosting provider for A5 production.
