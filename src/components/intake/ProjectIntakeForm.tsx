"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ServiceId } from "@config/services";
import { SITE } from "@config/site";
import { phoneTelHref } from "@/lib/phone";
import { uploadPhotoToSignedUrl } from "@/lib/photos/browser-upload";
import type { SubmitProjectResult } from "@/lib/intake/submit-types";
import { FormButton } from "./FormButton";
import { IntakeProgress } from "./IntakeProgress";
import styles from "./intake.module.css";
import {
  revokePhotoPreviews,
  type SelectedPhoto,
} from "./PhotoPicker";
import { StepContact } from "./steps/StepContact";
import { StepDetails } from "./steps/StepDetails";
import { StepLocation } from "./steps/StepLocation";
import { StepReview } from "./steps/StepReview";
import { StepService } from "./steps/StepService";
import { StepTiming } from "./steps/StepTiming";
import {
  SubmissionFailureBanner,
  SubmissionSuccess,
  type PhotoAttachStatus,
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

type PrepareResponse =
  | {
      success: true;
      grantToken: string;
      uploads: Array<{
        path: string;
        token: string;
        signedUrl: string;
        mimeType: string;
        originalFilename: string;
        fileSize: number;
      }>;
    }
  | { success: false; error?: string; message?: string };

type CompleteResponse =
  | {
      success: true;
      attachedCount: number;
      failedCount: number;
    }
  | { success: false; error?: string; message?: string };

export function ProjectIntakeForm() {
  const [step, setStep] = useState<IntakeStep>("service");
  const [state, setState] = useState<ProjectIntakeState>(INITIAL_INTAKE_STATE);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [phase, setPhase] = useState<Phase>("form");
  const [publicReference, setPublicReference] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileNonce, setTurnstileNonce] = useState(0);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [photoStatus, setPhotoStatus] = useState<PhotoAttachStatus>("none");
  const [attachedCount, setAttachedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [photoRetrying, setPhotoRetrying] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const summaryId = useId();
  const turnstileSiteKey = turnstileSiteKeyFromEnv();
  const turnstileRequired = Boolean(turnstileSiteKey);

  useEffect(() => {
    headingRef.current?.focus();
  }, [step, phase]);

  useEffect(() => {
    return () => {
      revokePhotoPreviews(photos);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- revoke only on unmount
  }, []);

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

  async function attachPhotosForSubmission(
    submissionKey: string,
  ): Promise<{ attached: number; failed: number }> {
    if (photos.length === 0) return { attached: 0, failed: 0 };

    const prepareRes = await fetch("/api/photo-uploads/prepare", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": submissionKey,
      },
      body: JSON.stringify({
        submissionKey,
        files: photos.map((p) => ({
          originalFilename: p.file.name,
          mimeType: p.file.type,
          fileSize: p.file.size,
        })),
      }),
    });

    const prepared = (await prepareRes.json()) as PrepareResponse;
    if (!prepared.success) {
      return { attached: 0, failed: photos.length };
    }

    const uploadResults: Array<{
      path: string;
      originalFilename: string;
      mimeType: string;
      fileSize: number;
      uploaded: boolean;
    }> = [];

    for (let i = 0; i < prepared.uploads.length; i += 1) {
      const slot = prepared.uploads[i];
      const photo = photos[i];
      if (!slot || !photo) {
        continue;
      }
      const uploaded = await uploadPhotoToSignedUrl({
        path: slot.path,
        token: slot.token,
        file: photo.file,
        contentType: slot.mimeType,
      });
      uploadResults.push({
        path: slot.path,
        originalFilename: slot.originalFilename,
        mimeType: slot.mimeType,
        fileSize: slot.fileSize,
        uploaded: uploaded.ok,
      });
    }

    const completeRes = await fetch("/api/photo-uploads/complete", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "idempotency-key": submissionKey,
      },
      body: JSON.stringify({
        submissionKey,
        grantToken: prepared.grantToken,
        uploads: uploadResults,
      }),
    });

    const completed = (await completeRes.json()) as CompleteResponse;
    if (!completed.success) {
      return {
        attached: 0,
        failed: uploadResults.length || photos.length,
      };
    }

    return {
      attached: completed.attachedCount,
      failed: completed.failedCount,
    };
  }

  async function handleSubmit() {
    if (phase === "sending" || phase === "success") return;
    if (turnstileRequired && !turnstileToken) return;

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : null;
      if (!idempotencyKeyRef.current) {
        setPhase("failure");
        return;
      }
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

      let result: SubmitProjectResult;
      try {
        result = (await response.json()) as SubmitProjectResult;
      } catch {
        setTurnstileToken(null);
        setTurnstileNonce((n) => n + 1);
        setPhase("failure");
        return;
      }

      if (result.success) {
        setPublicReference(result.publicReference);

        if (photos.length === 0) {
          setPhotoStatus("none");
          setPhase("success");
          return;
        }

        try {
          const outcome = await attachPhotosForSubmission(
            idempotencyKeyRef.current,
          );
          setAttachedCount(outcome.attached);
          setFailedCount(outcome.failed);
          if (outcome.failed === 0 && outcome.attached > 0) {
            setPhotoStatus("all");
          } else if (outcome.attached > 0) {
            setPhotoStatus("partial");
          } else {
            setPhotoStatus("failed");
          }
        } catch {
          setAttachedCount(0);
          setFailedCount(photos.length);
          setPhotoStatus("failed");
        }

        setPhase("success");
        return;
      }

      setTurnstileToken(null);
      setTurnstileNonce((n) => n + 1);
      setPhase("failure");

      if (result.error === "validation" && result.stepHint) {
        setStep(result.stepHint === "review" ? "contact" : result.stepHint);
      }
    } catch {
      setTurnstileToken(null);
      setTurnstileNonce((n) => n + 1);
      setPhase("failure");
    }
  }

  async function handleRetryPhotos() {
    if (!idempotencyKeyRef.current || !publicReference || photoRetrying) return;
    if (photos.length === 0) return;
    setPhotoRetrying(true);
    try {
      const outcome = await attachPhotosForSubmission(idempotencyKeyRef.current);
      setAttachedCount(outcome.attached);
      setFailedCount(outcome.failed);
      if (outcome.failed === 0 && outcome.attached > 0) setPhotoStatus("all");
      else if (outcome.attached > 0) setPhotoStatus("partial");
      else setPhotoStatus("failed");
    } catch {
      setPhotoStatus("failed");
    } finally {
      setPhotoRetrying(false);
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
        <SubmissionSuccess
          publicReference={publicReference}
          photoStatus={photoStatus}
          attachedCount={attachedCount}
          failedCount={failedCount}
          onRetryPhotos={
            photoStatus === "partial" || photoStatus === "failed"
              ? () => {
                  void handleRetryPhotos();
                }
              : undefined
          }
          photoRetrying={photoRetrying}
        />
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
            photos={photos}
            photoError={photoError ?? undefined}
            onChangeDescription={(description) => patch({ description })}
            onChangePhotos={setPhotos}
            onPhotoClientError={setPhotoError}
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
            turnstileNonce={turnstileNonce}
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
