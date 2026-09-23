/**
 * Privacy boundary for the public authority layer (A5-G001).
 * Operational tables must never be queried by public content rendering.
 */

/** Tables the public authority layer is forbidden to read. */
export const AUTHORITY_FORBIDDEN_TABLES = [
  "customers",
  "leads",
  "lead_status_events",
  "lead_notes",
  "project_photos",
  "admin_users",
] as const;

/** Columns / concepts that must never appear in public content projections. */
export const AUTHORITY_FORBIDDEN_FIELDS = [
  "submission_key",
  "phone",
  "email",
  "full_name",
  "preferred_contact_method",
  "storage_path",
  "service_role",
] as const;

export function assertNoForbiddenTableAccess(tableName: string): void {
  if (
    (AUTHORITY_FORBIDDEN_TABLES as readonly string[]).includes(tableName)
  ) {
    throw new Error(`authority_forbidden_table:${tableName}`);
  }
}

export function publicProjectionHasForbiddenField(
  projection: Record<string, unknown>,
): string[] {
  const found: string[] = [];
  for (const field of AUTHORITY_FORBIDDEN_FIELDS) {
    if (field in projection) {
      found.push(field);
    }
  }
  return found;
}
