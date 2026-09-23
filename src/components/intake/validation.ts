import type {
  IntakeContactMethod,
  IntakeTiming,
  ProjectIntakeState,
} from "./types.ts";
import { INTAKE_CONTACT_METHODS, INTAKE_TIMINGS } from "./types.ts";

export type FieldErrors = Partial<Record<keyof ProjectIntakeState, string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function phoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidUsPhone(value: string): boolean {
  const digits = phoneDigits(value);
  if (digits.length === 10) return true;
  if (digits.length === 11 && digits.startsWith("1")) return true;
  return false;
}

export function isValidZip(value: string): boolean {
  return /^\d{5}$/.test(value.trim());
}

export function validateService(state: ProjectIntakeState): FieldErrors {
  if (!state.serviceSelectionStatus) {
    return { serviceSelectionStatus: "Choose a service, or select Not sure." };
  }
  if (
    state.serviceSelectionStatus === "SELECTED" &&
    state.serviceId === null
  ) {
    return { serviceId: "Choose a service, or select Not sure." };
  }
  return {};
}

export function validateLocation(state: ProjectIntakeState): FieldErrors {
  if (!isValidZip(state.zip)) {
    return { zip: "Enter a valid 5-digit ZIP code." };
  }
  return {};
}

export function validateDetails(state: ProjectIntakeState): FieldErrors {
  const text = state.description.trim();
  if (text.length < 10) {
    return {
      description: "Please add a bit more detail (at least 10 characters).",
    };
  }
  if (text.length > 2000) {
    return { description: "Please keep your description under 2,000 characters." };
  }
  return {};
}

export function validateTiming(state: ProjectIntakeState): FieldErrors {
  if (!state.timing || !INTAKE_TIMINGS.includes(state.timing)) {
    return { timing: "Choose when you would like to get started." };
  }
  return {};
}

export function validateContact(state: ProjectIntakeState): FieldErrors {
  const errors: FieldErrors = {};
  if (!state.firstName.trim()) {
    errors.firstName = "Enter your first name.";
  }
  if (!state.lastName.trim()) {
    errors.lastName = "Enter your last name.";
  }
  if (!isValidUsPhone(state.phone)) {
    errors.phone = "Enter a valid phone number.";
  }
  if (!EMAIL_RE.test(state.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (
    !state.preferredContact ||
    !INTAKE_CONTACT_METHODS.includes(state.preferredContact)
  ) {
    errors.preferredContact = "Choose how we should reach you.";
  }
  return errors;
}

export function validateStep(
  step: "service" | "location" | "details" | "timing" | "contact",
  state: ProjectIntakeState,
): FieldErrors {
  switch (step) {
    case "service":
      return validateService(state);
    case "location":
      return validateLocation(state);
    case "details":
      return validateDetails(state);
    case "timing":
      return validateTiming(state);
    case "contact":
      return validateContact(state);
  }
}

export function timingLabel(timing: IntakeTiming): string {
  switch (timing) {
    case "ASAP":
      return "As soon as possible";
    case "WITHIN_30_DAYS":
      return "Within 30 days";
    case "ONE_TO_THREE_MONTHS":
      return "1–3 months";
    case "EXPLORING":
      return "Just exploring";
  }
}

export function contactMethodLabel(method: IntakeContactMethod): string {
  switch (method) {
    case "PHONE":
      return "Phone";
    case "TEXT":
      return "Text";
    case "EMAIL":
      return "Email";
  }
}
