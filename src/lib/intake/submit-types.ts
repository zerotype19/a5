import type { ServiceId } from "../../../config/services.ts";
import type {
  IntakeContactMethod,
  IntakeTiming,
} from "../../components/intake/types.ts";
import type { ServiceSelectionStatus } from "../db/schema.ts";

/** Client → server project submission payload (A5-004). */
export type SubmitProjectRequestPayload = {
  serviceId: ServiceId | null;
  serviceSelectionStatus: ServiceSelectionStatus;
  zip: string;
  description: string;
  timing: IntakeTiming;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  preferredContact: IntakeContactMethod;
  turnstileToken: string | null;
};

export type SubmitValidationIssue = {
  field?: string;
  code: string;
  message: string;
};

export type SubmitProjectSuccess = {
  success: true;
  publicReference: string;
};

export type SubmitProjectFailure = {
  success: false;
  error:
    | "validation"
    | "turnstile"
    | "configuration"
    | "persistence"
    | "conflict";
  issues?: SubmitValidationIssue[];
  /** Safe step hint for validation UX — never internal DB details. */
  stepHint?: "service" | "location" | "details" | "timing" | "contact" | "review";
};

export type SubmitProjectResult = SubmitProjectSuccess | SubmitProjectFailure;
