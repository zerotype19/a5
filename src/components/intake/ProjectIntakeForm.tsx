"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ServiceId } from "@config/services";
import { SITE } from "@config/site";
import { phoneTelHref } from "@/lib/phone";
import { FormButton } from "./FormButton";
import { IntakeProgress } from "./IntakeProgress";
import styles from "./intake.module.css";
import { StepContact } from "./steps/StepContact";
import { StepDetails } from "./steps/StepDetails";
import { StepLocation } from "./steps/StepLocation";
import { StepReview } from "./steps/StepReview";
import { StepService } from "./steps/StepService";
import { StepTiming } from "./steps/StepTiming";
import type { IntakeStep, IntakeTiming, ProjectIntakeState } from "./types";
import { INITIAL_INTAKE_STATE, INTAKE_STEPS } from "./types";
import type { FieldErrors } from "./validation";
import { validateStep } from "./validation";

export function ProjectIntakeForm() {
  const [step, setStep] = useState<IntakeStep>("service");
  const [state, setState] = useState<ProjectIntakeState>(INITIAL_INTAKE_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const summaryId = useId();

  useEffect(() => {
    headingRef.current?.focus();
  }, [step]);

  function patch(partial: Partial<ProjectIntakeState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function goTo(next: IntakeStep) {
    setErrors({});
    setStep(next);
  }

  function handleContinue() {
    if (step === "review") return;
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
    const index = INTAKE_STEPS.indexOf(step);
    if (index <= 0) return;
    setErrors({});
    setStep(INTAKE_STEPS[index - 1]);
  }

  const errorCount = Object.keys(errors).length;

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
          <StepReview state={state} onEdit={goTo} />
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
            dataCta="intake-back"
          >
            Back
          </FormButton>
        </div>
      )}
    </div>
  );
}
