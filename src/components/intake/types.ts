import type { ServiceId } from "../../../config/services.ts";
import type { ServiceSelectionStatus } from "../../lib/db/schema.ts";

/** Canonical timing values (A5-003). Maps later to leads.urgency text. */
export const INTAKE_TIMINGS = [
  "ASAP",
  "WITHIN_30_DAYS",
  "ONE_TO_THREE_MONTHS",
  "EXPLORING",
] as const;

export type IntakeTiming = (typeof INTAKE_TIMINGS)[number];

/** Canonical preferred contact (A5-003). Maps to DB phone|text|email. */
export const INTAKE_CONTACT_METHODS = ["PHONE", "TEXT", "EMAIL"] as const;

export type IntakeContactMethod = (typeof INTAKE_CONTACT_METHODS)[number];

export const INTAKE_STEPS = [
  "service",
  "location",
  "details",
  "timing",
  "contact",
  "review",
] as const;

export type IntakeStep = (typeof INTAKE_STEPS)[number];

/**
 * Explicit client-side ProjectIntakeState (A5-003 / A5-004).
 * Persisted via server `/api/submit-project-request` → submit_project_request RPC.
 */
export type ProjectIntakeState = {
  /** Set when homeowner picks a registry service; null when Not Sure. */
  serviceId: ServiceId | null;
  /** SELECTED | NOT_SURE — distinguishes deliberate unclassified from unset. */
  serviceSelectionStatus: ServiceSelectionStatus | null;
  /** Raw ZIP → leads.postal_code; location_id left null for later classification. */
  zip: string;
  description: string;
  timing: IntakeTiming | null;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  preferredContact: IntakeContactMethod | null;
};

export const INITIAL_INTAKE_STATE: ProjectIntakeState = {
  serviceId: null,
  serviceSelectionStatus: null,
  zip: "",
  description: "",
  timing: null,
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  preferredContact: null,
};

/** Map intake preferred contact to A5-003A DB enum (lowercase). */
export function toDbPreferredContact(
  method: IntakeContactMethod,
): "phone" | "text" | "email" {
  switch (method) {
    case "PHONE":
      return "phone";
    case "TEXT":
      return "text";
    case "EMAIL":
      return "email";
  }
}
