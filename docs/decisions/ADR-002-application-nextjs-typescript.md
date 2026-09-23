# ADR-002: Application — Next.js + TypeScript

- **Status:** Accepted (locked)
- **Date:** 2026-09-23

## Context

A5 needs a single web application surface for the public site and a lightweight admin CRM, with server-side validation and secure handling of secrets.

## Decision

**The application is built with Next.js and TypeScript (React).**

Public site and admin share one Next.js codebase with clear server/client boundaries.

## Consequences

- TypeScript strictness and lint/build gates are part of Definition of Done.
- Prefer standard Next.js platform capabilities over extra frameworks.
- No separate backend framework without owner approval.
