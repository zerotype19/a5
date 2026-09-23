"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ServiceId } from "@config/services";
import { SITE } from "@config/site";
import { phoneTelHref } from "@/lib/phone";
import type { SubmitProjectResult } from "@/lib/intake/submit-types";
import { FormButton } from "./FormButton";
import { IntakeProgress } from "./IntakeProgress";
import styles from "./intake.module.css";
import { StepContact } from "./steps/StepContact";
import { StepDetails } from "./steps/StepDetails";
import { StepLocation } from "./steps/StepLocation";
import { StepReview } from "./steps/StepReview";
import { StepService } from "./steps/StepService";
import { StepTiming } from "./steps/StepTiming";
import {
  SubmissionFailureBanner,
  SubmissionSuccess,
} from "./SubmissionResult";
import type { IntakeStep, IntakeTiming, ProjectIntakeState } from "./types";
import { INITIAL_INTAKE_STATE, INTAKE_STEPS } from "./types";
import type { FieldErrors } from "./validation";
import { validateStep } from "./validation";

type Phase = "form" | "sending" | "success" | "failure";

function turnstileSiteKeyFromEnv(): string | null {
  const key = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();
  return key ? key : null;
}

export function ProjectIntakeForm() {
  const [step, setStep] = useState<IntakeStep>("service");
  const [state, setState] = useState<ProjectIntakeState>(INITIAL_INTAKE_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [phase, setPhase] = useState<Phase>("form");
  const [publicReference, setPublicReference] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const summaryId = useId();
  const turnstileSiteKey = turnstileSiteKeyFromEnv();
  const turnstileRequired = Boolean(turnstileSiteKey);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step, phase]);

  function patch(partial: Partial<ProjectIntakeState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function goTo(next: IntakeStep) {
    if (phase === "sending") return;
    setErrors({});
    setPhase("form");
    setStep(next);
  }

  function handleContinue() {
    if (step === "review" || phase === "sending") return;
    const currentErrors = validateStep(step, state);
    if (Object.keys(currentErrors).length > 0) {
      setErrors(currentErrors);
      return;
    }
    setErrors({});
    const index = INTAKE_STEPS.indexOf(step);
    const next = INTAKE_STEPS[index + 1];
    if (next) setStep(next);
  }

  function handleBack() {
    if (phase === "sending") return;
    const index = INTAKE_STEPS.indexOf(step);
    if (index <= 0) return;
    setErrors({});
    setPhase("form");
    setStep(INTAKE_STEPS[index - 1]);
  }

  async function handleSubmit() {
    if (phase === "sending" || phase === "success") return;
    if (turnstileRequired && !turnstileToken) return;

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `idem-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    }

    setPhase("sending");

    try {
      const response = await fetch("/api/submit-project-request", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "idempotency-key": idempotencyKeyRef.current,
        },
        body: JSON.stringify({
          serviceId: state.serviceId,
          serviceSelectionStatus: state.serviceSelectionStatus,
          zip: state.zip,
          description: state.description,
          timing: state.timing,
          firstName: state.firstName,
          lastName: state.lastName,
          phone: state.phone,
          email: state.email,
          preferredContact: state.preferredContact,
          turnstileToken,
        }),
      });

      const result = (await response.json()) as SubmitProjectResult;

      if (result.success) {
        setPublicReference(result.publicReference);
        setPhase("success");
        return;
      }

      // Allow a fresh idempotency key on explicit retry after failure.
      idempotencyKeyRef.current = null;
      setTurnstileToken(null);
      setPhase("failure");

      if (result.error === "validation" && result.stepHint) {
        setStep(result.stepHint === "review" ? "contact" : result.stepHint);
      }
    } catch {
      idempotencyKeyRef.current = null;
      setPhase("failure");
    }
  }

  const errorCount = Object.keys(errors).length;

  if (phase === "success" && publicReference) {
    return (
      <div className={styles.shell} data-intake="project-start">
        <div className={styles.intro}>
          <p className={styles.eyebrow}>Request service</p>
          <h1 className={styles.pageTitle} ref={headingRef} tabIndex={-1}>
            Thank you
          </h1>
        </div>
        <SubmissionSuccess publicReference={publicReference} />
      </div>
    );
  }

  return (
    <div className={styles.shell} data-intake="project-start">
      <div className={styles.intro}>
        <p className={styles.eyebrow}>Request service</p>
        <h1 className={styles.pageTitle} ref={headingRef} tabIndex={-1}>
          Tell us what&apos;s going on. We&apos;ll help from there.
        </h1>
        <p className={styles.lede}>
          A short, guided request — no contractor jargon required.
        </p>
        <p className={styles.phoneAlt}>
          Prefer to talk?{" "}
          <a href={phoneTelHref(SITE.phone)} data-cta="intake-phone-alt">
            Call {SITE.phone}
          </a>
        </p>
      </div>

      <IntakeProgress step={step} />

      {phase === "failure" ? (
        <SubmissionFailureBanner onRetry={() => setPhase("form")} />
      ) : null}

      {errorCount > 0 ? (
        <div className={styles.errorSummary} id={summaryId} role="alert">
          Please fix {errorCount === 1 ? "1 item" : `${errorCount} items`} below
          to continue.
        </div>
      ) : null}

      <div data-intake-step={step}>
        {step === "service" ? (
          <StepService
            state={state}
            errors={errors}
            onSelectService={(serviceId: ServiceId) =>
              patch({
                serviceId,
                serviceSelectionStatus: "SELECTED",
              })
            }
            onSelectNotSure={() =>
              patch({
                serviceId: null,
                serviceSelectionStatus: "NOT_SURE",
              })
            }
          />
        ) : null}

        {step === "location" ? (
          <StepLocation
            state={state}
            errors={errors}
            onChangeZip={(zip) => patch({ zip })}
          />
        ) : null}

        {step === "details" ? (
          <StepDetails
            state={state}
            errors={errors}
            onChangeDescription={(description) => patch({ description })}
          />
        ) : null}

        {step === "timing" ? (
          <StepTiming
            state={state}
            errors={errors}
            onSelectTiming={(timing: IntakeTiming) => patch({ timing })}
          />
        ) : null}

        {step === "contact" ? (
          <div data-intake="contact-started">
            <StepContact state={state} errors={errors} onPatch={patch} />
          </div>
        ) : null}

        {step === "review" ? (
          <StepReview
            state={state}
            onEdit={goTo}
            onSubmit={() => {
              void handleSubmit();
            }}
            sending={phase === "sending"}
            turnstileSiteKey={turnstileSiteKey}
            turnstileToken={turnstileToken}
            onTurnstileToken={setTurnstileToken}
            turnstileRequired={turnstileRequired}
          />
        ) : null}
      </div>

      {step !== "review" ? (
        <div className={styles.nav}>
          {step !== "service" ? (
            <FormButton
              type="button"
              variant="secondary"
              onClick={handleBack}
              dataCta="intake-back"
            >
              Back
            </FormButton>
          ) : (
            <span />
          )}
          <div className={styles.navEnd}>
            <FormButton
              type="button"
              variant="primary"
              onClick={handleContinue}
              dataCta="intake-continue"
            >
              Continue
            </FormButton>
          </div>
        </div>
      ) : (
        <div className={styles.nav}>
          <FormButton
            type="button"
            variant="secondary"
            onClick={handleBack}
            disabled={phase === "sending"}
            dataCta="intake-back"
          >
            Back
          </FormButton>
        </div>
      )}
    </div>
  );
}
