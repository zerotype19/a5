/**
 * Compile-safe references for A5-001 core operational schema.
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

export const PREFERRED_CONTACT_METHODS = ["phone", "email"] as const;

export type PreferredContactMethod =
  (typeof PREFERRED_CONTACT_METHODS)[number];

/** Example event_type vocabulary from project context §16 (non-exhaustive). */
export const LEAD_STATUS_EVENT_TYPE_EXAMPLES = [
  "LeadCreated",
  "LeadQualified",
  "VendorAssigned",
  "VendorAccepted",
  "CustomerContacted",
  "EstimateCreated",
  "LeadWon",
  "LeadLost",
] as const;

export type LeadStatusEventTypeExample =
  (typeof LEAD_STATUS_EVENT_TYPE_EXAMPLES)[number];

export const CORE_TABLES = [
  "services",
  "locations",
  "customers",
  "leads",
  "lead_status_events",
] as const;

export type CoreTable = (typeof CORE_TABLES)[number];
