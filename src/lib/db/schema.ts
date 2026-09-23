/**
 * Compile-safe references for A5 operational schema (A5-001 + A5-003A).
 * Mirror of approved migrations — not a runtime Supabase client.
 */

export const LEAD_STATUSES = [
  "NEW",
  "QUALIFIED",
  "ASSIGNED",
  "ACCEPTED",
  "CONTACTED",
  "ESTIMATE",
  "WON",
  "LOST",
  "INVALID",
  "DUPLICATE",
  "UNSERVICEABLE",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

export const ATTRIBUTION_CONFIDENCE_VALUES = [
  "KNOWN",
  "PLATFORM_REPORTED",
  "INFERRED",
  "UNKNOWN",
] as const;

export type AttributionConfidence =
  (typeof ATTRIBUTION_CONFIDENCE_VALUES)[number];

/** A5-001 + A5-003A: phone | email | text */
export const PREFERRED_CONTACT_METHODS = ["phone", "email", "text"] as const;

export type PreferredContactMethod =
  (typeof PREFERRED_CONTACT_METHODS)[number];

/**
 * A5-003A — homeowner service choice signal.
 * SELECTED ⇒ service_id set; NOT_SURE ⇒ service_id null (deliberate).
 */
export const SERVICE_SELECTION_STATUSES = ["SELECTED", "NOT_SURE"] as const;

export type ServiceSelectionStatus =
  (typeof SERVICE_SELECTION_STATUSES)[number];

/** Example event_type vocabulary from project context §16 (non-exhaustive). */
export const LEAD_STATUS_EVENT_TYPE_EXAMPLES = [
  "LeadCreated",
  "LeadQualified",
  "LeadMarkedUnserviceable",
  "LeadMarkedInvalid",
  "LeadMarkedDuplicate",
  "ServiceClassified",
  "LocationClassified",
  "VendorAssigned",
  "VendorAccepted",
  "CustomerContacted",
  "EstimateCreated",
  "LeadWon",
  "LeadLost",
] as const;

export type LeadStatusEventTypeExample =
  (typeof LEAD_STATUS_EVENT_TYPE_EXAMPLES)[number];

/**
 * A5-004 — durable browser submission idempotency on leads.
 * Technical identity only; not customer id / attribution / auth credential.
 */
export const LEAD_SUBMISSION_KEY_COLUMN = "submission_key" as const;

/** A5-005 — private homeowner project photo metadata. */
export const PROJECT_PHOTOS_TABLE = "project_photos" as const;

/** A5-006 — Supabase Auth allowlist for A5 Operations. */
export const ADMIN_USERS_TABLE = "admin_users" as const;

/** A5-007 — private internal OWNER notes. */
export const LEAD_NOTES_TABLE = "lead_notes" as const;

export const CORE_TABLES = [
  "services",
  "locations",
  "customers",
  "leads",
  "lead_status_events",
  "project_photos",
  "lead_notes",
] as const;

export type CoreTable = (typeof CORE_TABLES)[number];
