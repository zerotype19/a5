# Connection network release

## Scope

Network positioning throughout the public site, intake, notifications and metadata; accepted-only descriptions/photos/contact; configurable acceptance deadlines and manual fallback; operator-triggered homeowner/vendor check-ins; private completed-work ratings and explainable manual provider suggestions. Supabase remains the database and Cloudflare/Vinext remains hosting. No dependencies added.

This branch includes unreleased vendor-signup PR #36 as its base. Merge/release signup first, then this change, or review the combined ancestry explicitly. Do not enable signup without its migration.

## Engineering evidence

- 288 unit/regression tests pass: negative opportunity reads, check-in data minimization, star eligibility, conflict exclusion, unknown responses, queue aging and delivery states.
- `node scripts/test-network-migration.mjs`: disposable PostgreSQL with all actual migrations. Operator/provider/homeowner fixtures exercise intake permission, acceptance, private reports, completion eligibility, recovery and auditing. Concurrent assignment, acceptance, expiry/release, resend/accept and check-in preparation are tested. No real email delivery.
- Mobile browser component checks at 320 and 390 pixels: no horizontal overflow; homeowner stars require Yes/completed; provider form has no stars; recovery requires reason and permission. Intake acknowledgement visible and required. Development-only preview removed before builds.
- Next and Vinext/Cloudflare builds, lint and typecheck pass. Stale generated development route types must be removed after deleting a temporary preview route before typechecking.
- Content read-only preflight passes against 288 published records, including 78 indexable. Exact before/after text and checksum checked in. IDs, paths, publication/indexing settings, relationship tables and source citations remain unchanged.

These are local integration/component tests, not a production browser/mailbox trial. No production migration, content write, email or deployment was performed during implementation.

## Release sequence

1. Review the exact commit and both PRs. Preserve existing environment variables, secrets and scheduled operations alerts.
2. Apply `20261008030000_vendor_signup.sql` if not already applied, then `20261008050000_network_outcomes.sql`. Both are additive. Use migration tracking; the network migration deliberately fails if reapplied outside tracking.
3. Review the actual intake/privacy/terms disclosure and project-email workflow before enabling communications. No professional legal review is represented by engineering tests or Chat feedback.
4. Build and deploy the reviewed source. Run read-only `scripts/release-network-copy.ts` preflight with the existing production environment. Its `--apply` mode requires release authorization and writes only audited text fields with per-row compare-and-swap checks. Failed/stale writes stop and preserve a receipt; inspect before resuming.
5. Enable `ENABLE_VENDOR_SIGNUP=true` for signup. Enable `ENABLE_NETWORK_FOLLOWUP=true` after migration and communications review. `A5_ACCEPTANCE_HOURS=24` is the initial default (valid integers 1–72). Network defaults off; protected descriptions/photos improve regardless of this flag.
6. Run a controlled production smoke test using consenting operator, homeowner and provider test identities: actual delivery, accept/pass POSTs, privacy boundaries, check-in/opt-out, admin queue and mobile rendering. Do not use actual customer requests as test data.
7. Inspect delivery errors and unresolved assignments. Keep decisions manual. No additional services, towns, public stars or automatic routing are included.

## Operator workflow

Review → qualify → choose and notify a provider → connection and feedback → record outcome. One open assignment per lead. Release expired unaccepted offers with a reason. Accepted recovery requires an actual homeowner request for another introduction and an audit note. Release revokes the old opportunity capability and returns the lead to Qualified; choose the next provider manually.

Aging accepted leads remain in the queue. After one day, a check-in can be suggested; repeat suggestions are spaced seven days apart. The database prevents repeat sends within 24 hours. Future scheduled follow-up suppresses routine suggestions; delivery failures and failed/conflicting connections remain urgent. Historical leads without permission require a real recorded conversation; do not backfill permission.

Separate links bind reports to assignment and party. Homeowner reported completed work can carry private stars; vendor reports never create homeowner stars or overwrite feedback. No response is unknown. Conflicting/disputed evidence is excluded from suggestions. Inspect original requests and review audits before changing exclusion status. Suggestions describe all recorded services and are not proof of competence in another trade; stars do not drive assignment.

## Delivery and security limits

Only token hashes are stored. Check-in links expire in 14 days; replacements revoke predecessors. Resend uses invitation-specific idempotency keys. Unknown/5xx delivery remains UNCERTAIN and requires operator inspection before replacement. No automatic retry/check-in job. Opt-out stops further check-ins for that request; an in-flight delivery cannot always be recalled.

Acceptance deadline is distinct from 72-hour capability lifetime. Expired, revoked, passed or cancelled access cannot request protected data or new signed photos. Photos remain private; an already-issued signed URL can remain usable for ten minutes. Viewed/downloaded information cannot be recalled. Revocation preserves historical reports. Capability routes are noindex, private/no-store and no-referrer, excluded from analytics/attribution. Do not paste capability URLs into logs or unrelated tools.

## Rollback

Keep additive data and audit history. Disable network follow-up to stop new check-ins and admin network actions. A blind rollback to older routing code ignores the new acceptance deadline: revoke outstanding affected capabilities through an audited process before reverting. Do not drop tables or erase reports. Restore content from manifest `before` values only after checking current rows and the write receipt for intervening edits.
