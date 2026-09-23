import { SERVICES, type ServiceId } from "../../../config/services.ts";
import {
  INTAKE_CONTACT_METHODS,
  INTAKE_TIMINGS,
  toDbPreferredContact,
  type IntakeContactMethod,
  type IntakeTiming,
} from "../../components/intake/types.ts";
import {
  isValidUsPhone,
  isValidZip,
  phoneDigits,
} from "../../components/intake/validation.ts";
import {
  SERVICE_SELECTION_STATUSES,
  type PreferredContactMethod,
  type ServiceSelectionStatus,
} from "../db/schema.ts";
import type {
  SubmitProjectRequestPayload,
  SubmitValidationIssue,
} from "./submit-types.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const APPROVED_SERVICE_IDS = new Set<string>(SERVICES.map((s) => s.id));
/** RFC 4122 UUID (versions 1–5); browser crypto.randomUUID() produces v4. */
const SUBMISSION_KEY_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function parseSubmissionKey(
  value: string | null | undefined,
): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!SUBMISSION_KEY_RE.test(trimmed)) return null;
  return trimmed.toLowerCase();
}

export type ValidatedSubmission = {
  fullName: string;
  phone: string;
  email: string;
  preferredContact: PreferredContactMethod;
  serviceSelectionStatus: ServiceSelectionStatus;
  serviceId: string | null;
  postalCode: string;
  projectDescription: string;
  urgency: string;
};

export type StepHint =
  | "service"
  | "location"
  | "details"
  | "timing"
  | "contact"
  | "review";

export type ValidationOutcome =
  | { ok: true; value: ValidatedSubmission }
  | {
      ok: false;
      issues: SubmitValidationIssue[];
      stepHint: StepHint;
    };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | null {
  return typeof value === "string" ? value : null;
}

/**
 * Authoritative server-side validation for project submission.
 * Client validation is convenience only — never trust client IDs alone.
 */
export function validateSubmissionPayload(
  raw: unknown,
): ValidationOutcome {
  if (!isRecord(raw)) {
    return {
      ok: false,
      issues: [{ code: "invalid_body", message: "Invalid request." }],
      stepHint: "review",
    };
  }

  const issues: SubmitValidationIssue[] = [];
  let stepHint: StepHint = "review";

  const statusRaw = asString(raw.serviceSelectionStatus);
  const serviceIdRaw = raw.serviceId === null ? null : asString(raw.serviceId);

  if (
    !statusRaw ||
    !SERVICE_SELECTION_STATUSES.includes(
      statusRaw as ServiceSelectionStatus,
    )
  ) {
    issues.push({
      field: "serviceSelectionStatus",
      code: "invalid_service_selection",
      message: "Choose a service, or select Not sure.",
    });
    stepHint = "service";
  } else if (statusRaw === "SELECTED") {
    if (!serviceIdRaw || !APPROVED_SERVICE_IDS.has(serviceIdRaw)) {
      issues.push({
        field: "serviceId",
        code: "unknown_or_missing_service",
        message: "Choose an approved service, or select Not sure.",
      });
      stepHint = "service";
    }
  } else if (statusRaw === "NOT_SURE") {
    if (serviceIdRaw !== null) {
      issues.push({
        field: "serviceId",
        code: "not_sure_with_service",
        message: "Not sure cannot include a selected service.",
      });
      stepHint = "service";
    }
  }

  const zip = asString(raw.zip)?.trim() ?? "";
  if (!isValidZip(zip)) {
    issues.push({
      field: "zip",
      code: "invalid_zip",
      message: "Enter a valid 5-digit ZIP code.",
    });
    if (stepHint === "review") stepHint = "location";
  }

  const description = asString(raw.description)?.trim() ?? "";
  if (description.length < 10 || description.length > 2000) {
    issues.push({
      field: "description",
      code: "invalid_description",
      message: "Please describe the project (10–2,000 characters).",
    });
    if (stepHint === "review") stepHint = "details";
  }

  const timing = asString(raw.timing);
  if (!timing || !INTAKE_TIMINGS.includes(timing as IntakeTiming)) {
    issues.push({
      field: "timing",
      code: "invalid_timing",
      message: "Choose when you would like to get started.",
    });
    if (stepHint === "review") stepHint = "timing";
  }

  const firstName = asString(raw.firstName)?.trim() ?? "";
  const lastName = asString(raw.lastName)?.trim() ?? "";
  const phoneRaw = asString(raw.phone) ?? "";
  const email = asString(raw.email)?.trim() ?? "";
  const preferred = asString(raw.preferredContact);

  if (!firstName) {
    issues.push({
      field: "firstName",
      code: "missing_first_name",
      message: "Enter your first name.",
    });
    if (stepHint === "review") stepHint = "contact";
  }
  if (!lastName) {
    issues.push({
      field: "lastName",
      code: "missing_last_name",
      message: "Enter your last name.",
    });
    if (stepHint === "review") stepHint = "contact";
  }
  if (!isValidUsPhone(phoneRaw)) {
    issues.push({
      field: "phone",
      code: "invalid_phone",
      message: "Enter a valid phone number.",
    });
    if (stepHint === "review") stepHint = "contact";
  }
  if (!EMAIL_RE.test(email)) {
    issues.push({
      field: "email",
      code: "invalid_email",
      message: "Enter a valid email address.",
    });
    if (stepHint === "review") stepHint = "contact";
  }
  if (
    !preferred ||
    !INTAKE_CONTACT_METHODS.includes(preferred as IntakeContactMethod)
  ) {
    issues.push({
      field: "preferredContact",
      code: "invalid_preferred_contact",
      message: "Choose how we should reach you.",
    });
    if (stepHint === "review") stepHint = "contact";
  }

  if (issues.length > 0) {
    return { ok: false, issues, stepHint };
  }

  const digits = phoneDigits(phoneRaw);
  const normalizedPhone =
    digits.length === 11 && digits.startsWith("1")
      ? digits.slice(1)
      : digits;

  return {
    ok: true,
    value: {
      fullName: `${firstName} ${lastName}`.replace(/\s+/g, " ").trim(),
      phone: normalizedPhone,
      email: email.toLowerCase(),
      preferredContact: toDbPreferredContact(
        preferred as IntakeContactMethod,
      ),
      serviceSelectionStatus: statusRaw as ServiceSelectionStatus,
      serviceId:
        statusRaw === "SELECTED" ? (serviceIdRaw as ServiceId) : null,
      postalCode: zip,
      projectDescription: description,
      urgency: timing as IntakeTiming,
    },
  };
}

/** Narrow unknown JSON into the client payload shape for typing after validation. */
export function asPayloadShape(
  raw: unknown,
): SubmitProjectRequestPayload | null {
  if (!isRecord(raw)) return null;
  return raw as unknown as SubmitProjectRequestPayload;
}
