# First landing page

Production application of `20260930150000_first_landing_page.sql` is a separate owner step. This document describes the migration. It does not apply it.

## What it changes

`submit_project_request` gains `p_first_landing_page text default null`.

On insert, a safe A5 pathname is written to the existing `leads.first_landing_page` column. When a path is stored, `first_touch_at` is set and `first_attribution_confidence` is `KNOWN`. When the path is absent or rejected, the column stays null and confidence stays `UNKNOWN`.

A repeat call for the same `submission_key` returns the existing lead and does not update `first_landing_page`.

The previous 10-argument function is dropped so PostgREST has one signature. The new argument defaults to null, so a worker that has not been updated can still submit after the migration is applied.

## Rejected values

The database stores null when the value is not `/` or a lowercase hyphenated pathname, is longer than 200 characters, or begins with `/request-service`, `/admin`, `/api`, or `/opportunity`. The application normalizes origins before the call and drops external URLs, queries, and hashes.

## Deploy order

Apply this migration before deploying the application change. The server always passes `p_first_landing_page`.
