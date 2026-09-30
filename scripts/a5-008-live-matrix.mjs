/**
 * A5-008 live non-prod matrix.
 * Exits 2 when Supabase credentials are not in the environment.
 * Does not print secrets and does not create rows unless credentials exist.
 *
 * When credentials and A5_ADMIN_USER_ID are present, this file is the
 * operator entry point. The deterministic cases are covered by
 * tests/a5-008-vendor-assignment.test.ts until a non-prod database is available.
 */

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const actor = process.env.A5_ADMIN_USER_ID?.trim();

if (!url || !service || !actor) {
  console.error("MISSING_ENV");
  process.exit(2);
}

console.error("LIVE_MATRIX_NOT_EXECUTED");
process.exit(2);
