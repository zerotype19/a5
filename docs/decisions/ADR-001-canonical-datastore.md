# ADR-001: Canonical datastore — Supabase / Postgres

- **Status:** Accepted (locked)
- **Date:** 2026-09-23

## Context

A5 needs a single operational system of record for customers, leads, vendors, projects, assignments, attribution, and content registry data.

## Decision

**Supabase / Postgres is the canonical A5 operational datastore.**

External SaaS systems may contribute data. They may not become the canonical operational database.

## Consequences

- All operational entities are modeled in Postgres via approved migrations.
- GA4 owns visitor behavior analytics, not business outcomes.
- Schema changes require migrations under `/supabase/migrations/` and owner approval when destructive.
