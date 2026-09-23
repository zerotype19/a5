# A5-005 — Project photos + private lead-uploads

**Task:** A5-005  
**Migration:** `supabase/migrations/20260923170000_a5_005_project_photos_storage.sql`  
**Date:** 2026-09-23  
**Production apply:** NOT authorized without owner approval

## CHANGE

1. Add `public.project_photos` (lead_id, storage_bucket, storage_path, original_filename, mime_type, file_size, created_at) with RLS deny-all for `anon` / `authenticated`.
2. Ensure private Storage bucket `lead-uploads` (10 MiB limit; JPEG/PNG/WEBP only).
3. Restrictive storage.objects policies so anon/authenticated cannot select/insert/update/delete objects in `lead-uploads` (signed uploads use path-scoped tokens issued by service role).

## REASON

Optional homeowner project photos after a successful A5-004 lead. Binary in Storage only; Postgres holds metadata.

## SECURITY MODEL

| Surface | Rule |
| --- | --- |
| `project_photos` RLS | Deny all for anon/authenticated |
| Bucket `lead-uploads` | `public = false` |
| Browser | Never receives service-role key |
| Upload auth | Server issues path-scoped signed upload URLs after resolving lead via active `submission_key` + short-lived HMAC grant — **not** `lead_id` / `public_reference` alone |
| Read URLs | No permanent public URLs |

## PRIVILEGES / POLICIES

See migration. Do not grant anon/authenticated table or bucket access for customer photos.

## TABLES AFFECTED

- `project_photos` (new)
- `storage.buckets` / `storage.objects` policies

## DESTRUCTIVE?

**NO**

## DATA LOSS RISK

None.

## ROLLBACK

```sql
drop policy if exists lead_uploads_no_select on storage.objects;
drop policy if exists lead_uploads_no_insert on storage.objects;
drop policy if exists lead_uploads_no_update on storage.objects;
drop policy if exists lead_uploads_no_delete on storage.objects;
delete from storage.buckets where id = 'lead-uploads';
drop table if exists public.project_photos;
```

## OWNER APPROVAL

A5-005 task authorization. Production apply remains owner-controlled.
