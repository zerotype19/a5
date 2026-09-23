# A5-G001 — Authority / content schema

**Task:** A5-G001  
**Migration:** `supabase/migrations/20260923190000_a5_g001_authority_content_schema.sql`  
**Seed (separate):** `supabase/seeds/a5_g001_authority_fixtures.sql`  
**Date:** 2026-09-23  
**Production apply:** NOT authorized

## CHANGE

Create authority/content tables and enums:

| Object | Kind | Public / Private |
| --- | --- | --- |
| `content_page_type` | enum | n/a |
| `content_status` | enum | n/a |
| `source_type` | enum | n/a |
| `content_source_rel_type` | enum | n/a |
| `content_rel_type` | enum | n/a |
| `problems` | table | Public read |
| `problem_services` | table | Public read |
| `sources` | table | Public read |
| `content_pages` | table | Public read **only** `status = PUBLISHED` |
| `content_sources` | table | Public read when parent page PUBLISHED |
| `content_relationships` | table | Public read when from_page PUBLISHED |

## REASON

Build the structured local home-services knowledge corpus foundation (Track B). Not a page farm.

## TABLES AFFECTED

New only (listed above). Does **not** modify `customers`, `leads`, `project_photos`, `admin_users`, or intake RPCs.

## EXISTING RECORDS AFFECTED

None in the schema migration. Seed inserts five DRAFT fixtures + one problem + one source (non-prod only).

## DESTRUCTIVE?

**NO**

## RLS

- Anon/authenticated: SELECT published content only; no writes.
- Draft/review/idea/approved/archived content: not publicly readable (`robots=noindex` is not authorization).
- Service-role bypasses RLS for owner-controlled management/seeds.

## INDEXES

Status, published+indexable partial, service/location/problem FKs, unique SERVICE / LOCATION / SERVICE_LOCATION entity indexes, unique `(page_type, slug)`.

## ROLLBACK (non-prod)

Drop policies, tables, and enums in reverse dependency order. Do not run against production without owner approval.

## OWNER APPROVAL

Authorized as TASK A5-G001. Production migration apply remains owner-controlled.
