import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { SERVICES } from "../config/services.ts";
import { SITE } from "../config/site.ts";
import {
  INTAKE_CONTACT_METHODS,
  INTAKE_TIMINGS,
  toDbPreferredContact,
} from "../src/components/intake/types.ts";
import {
  validateContact,
  validateDetails,
  validateLocation,
  validateService,
  validateTiming,
} from "../src/components/intake/validation.ts";
import { phoneTelHref } from "../src/lib/phone.ts";
import type { ProjectIntakeState } from "../src/components/intake/types.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

const baseState = (): ProjectIntakeState => ({
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
});

describe("A5-003 project intake UI", () => {
  const form = read("src/components/intake/ProjectIntakeForm.tsx");
  const serviceStep = read("src/components/intake/steps/StepService.tsx");
  const review = read("src/components/intake/steps/StepReview.tsx");
  const page = read("src/app/request-service/page.tsx");

  it("starts on Step 1 (service) and mounts the intake form", () => {
    assert.match(form, /useState<IntakeStep>\("service"\)/);
    assert.match(page, /ProjectIntakeForm/);
    assert.doesNotMatch(page, /Project intake is coming online/);
  });

  it("lists all approved services and Not Sure, with no unapproved services", () => {
    assert.match(serviceStep, /SERVICES\.map/);
    assert.match(serviceStep, /Not sure/i);
    assert.match(serviceStep, /NOT_SURE/);
    for (const service of SERVICES) {
      assert.ok(SERVICES.some((s) => s.id === service.id));
    }
    assert.doesNotMatch(serviceStep, /\bHVAC\b/);
    assert.equal(SERVICES.length, 8);
  });

  it("blocks continue without service selection", () => {
    const errors = validateService(baseState());
    assert.ok(errors.serviceSelectionStatus);
  });

  it("maps Not Sure to NOT_SURE + null serviceId (no UNKNOWN service)", () => {
    const state = {
      ...baseState(),
      serviceId: null,
      serviceSelectionStatus: "NOT_SURE" as const,
    };
    assert.deepEqual(validateService(state), {});
    assert.equal(state.serviceId, null);
    assert.doesNotMatch(form, /UNKNOWN/);
  });

  it("validates ZIP as 5 digits", () => {
    assert.ok(validateLocation({ ...baseState(), zip: "079" }).zip);
    assert.deepEqual(validateLocation({ ...baseState(), zip: "07940" }), {});
  });

  it("validates description length", () => {
    assert.ok(validateDetails({ ...baseState(), description: "Too short" }).description);
    assert.deepEqual(
      validateDetails({
        ...baseState(),
        description: "The brick steps at the front door are cracking.",
      }),
      {},
    );
  });

  it("uses canonical timing options only", () => {
    assert.deepEqual([...INTAKE_TIMINGS], [
      "ASAP",
      "WITHIN_30_DAYS",
      "ONE_TO_THREE_MONTHS",
      "EXPLORING",
    ]);
    assert.ok(validateTiming(baseState()).timing);
    assert.doesNotMatch(read("src/components/intake/steps/StepTiming.tsx"), /Emergency/i);
  });

  it("validates contact fields and preferred methods including TEXT", () => {
    assert.ok(Object.keys(validateContact(baseState())).length > 0);
    assert.deepEqual([...INTAKE_CONTACT_METHODS], ["PHONE", "TEXT", "EMAIL"]);
    assert.equal(toDbPreferredContact("TEXT"), "text");
    assert.deepEqual(
      validateContact({
        ...baseState(),
        firstName: "Alex",
        lastName: "Lee",
        phone: "(973) 555-1212",
        email: "alex@example.com",
        preferredContact: "TEXT",
      }),
      {},
    );
  });

  it("preserves back navigation and review edit hooks in the wizard", () => {
    assert.match(form, /handleBack/);
    assert.match(form, /INTAKE_STEPS\[index - 1\]/);
    assert.match(review, /onEdit/);
    assert.match(review, /Edit/);
  });

  it("keeps final submit disabled without fake success copy", () => {
    assert.match(review, /disabled/);
    assert.match(review, /Send Project Request/);
    assert.doesNotMatch(review, /your request was submitted/i);
    assert.match(review, /not enabled yet/i);
  });

  it("keeps a valid phone alternative from the site registry", () => {
    assert.equal(phoneTelHref(SITE.phone), "tel:+19734375517");
    assert.match(form, /phoneTelHref\(SITE\.phone\)/);
  });

  it("does not add unexpected intake packages under components/intake", () => {
    const files = readdirSync(join(root, "src/components/intake"), {
      recursive: true,
    }).map(String);
    assert.ok(files.some((f) => f.includes("ProjectIntakeForm")));
  });
});
