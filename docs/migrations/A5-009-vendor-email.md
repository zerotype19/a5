# A5-009 vendor email and Accept / Pass

Production application of `20260930023000_a5_009_vendor_email.sql` is a separate owner step. This document describes the migration. It does not apply it.

## What it adds

- Notification columns on `lead_assignments`: `notification_status` (`PENDING`, `SENT`, `FAILED`, or null), `notification_attempted_at`, `notification_sent_at`, `notification_error`.
- `assignment_capabilities`: one row per emailed link. `token_hash` is SHA-256 hex. The raw token is not stored.
- `admin_prepare_vendor_notification` and `admin_finish_vendor_notification`, service role only.
- `vendor_respond_to_assignment`, service role only. The public page calls it after hashing the token.
- Generic status changes cannot set `ACCEPTED` or move a lead that is `ASSIGNED`.
- `admin_assign_lead_to_vendor` returns `vendor_previously_passed` when that vendor already passed the lead.

## Delivery

Assignment remains the business record. Email is attempted after the assignment commits, and from the admin actions Send vendor email and Retry email. A provider failure sets `notification_status = FAILED` and leaves the assignment `ASSIGNED`.

A retry revokes unexpired capabilities for that assignment and issues a new hash. The previous email link stops working. A `SENT` assignment is not emailed again.

## Capability

72 hours. Unknown, revoked, and expired tokens render the same public message and no project data. Accept and Pass lock the capability, then the assignment, then the lead. A second Accept or Pass does not insert another `lead_status_events` row.

Accept: assignment `ACCEPTED`, lead `ACCEPTED`, event `VendorAccepted`. Homeowner contact is shown only after that state exists.

Pass: assignment `PASSED`, lead `QUALIFIED`, event `VendorPassed`. The lead can be assigned to a different eligible vendor. The passed vendor is excluded.

## Sender

`A5 Home Services <leads@a5homeservices.com>` through the Resend HTTP API. `RESEND_API_KEY` is a Worker secret. It is not in the repository. The domain must be verified in Resend before a live send succeeds.

## Not included

SMS, vendor login, automatic routing, and storing the rendered email body.
