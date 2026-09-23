# ADR-004: Storage — Supabase Storage

- **Status:** Accepted (locked)
- **Date:** 2026-09-23

## Context

Homeowners may upload project photos. Some project imagery may later be approved for public use. These must not be conflated.

## Decision

**Use Supabase Storage** with at least:

- `lead-uploads` — **private** homeowner-submitted project images
- `project-public` — imagery explicitly approved for public use

## Consequences

- Never make a customer upload public merely because it is stored in Supabase.
- MIME and file-size validation are required on upload paths when implemented.
- Storage policies and RLS are part of feature specifications, not deferred cleanup.
