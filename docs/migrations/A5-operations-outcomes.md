# Lead outcome records

CHANGE: `20261007200000_a5_lead_outcomes.sql` adds nullable milestone, close, reason and follow-up fields, a partial follow-up index and a service-role-only transactional RPC. Existing value columns are reused. Existing rows and assignment history are preserved.

REASON: complete the approved post-acceptance operating workflow with atomic audit history, active-admin validation and stale-update rejection. The server authenticates the current administrator before passing their identity to the RPC. Project amounts are not A5 income.

APPLY: run the migration against Supabase only after reviewing tests and the target. Reload the PostgREST schema cache, verify permissions and rollback-only transitions, then enable ENABLE_LEAD_OUTCOMES. Do not enable before the migration exists.

ROLLBACK: set ENABLE_LEAD_OUTCOMES=false and revert the application release if needed. Preserve the additive columns, function and historical records; do not drop data. Internal alert delivery has its separate ENABLE_OPERATIONS_ALERTS flag.

VALIDATION: `node scripts/test-outcomes-migration.mjs`; see `docs/operations/VERIFICATION.md`. Production schema-only dry run passed with ROLLBACK. The production outcome journey passed in a rollback-only transaction. The exact migration was subsequently committed, the API schema refreshed, and new columns verified through PostgREST.
