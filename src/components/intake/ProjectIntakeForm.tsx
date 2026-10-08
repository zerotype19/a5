"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { ServiceId } from "@config/services";
import { SITE } from "@config/site";
import { phoneTelHref } from "@/lib/phone";
import { uploadPhotoToSignedUrl } from "@/lib/photos/browser-upload";
import { readAttribution } from "@/lib/marketing/attribution";
import { trackEvent } from "@/lib/marketing/analytics";
import { readFirstLandingPage } from "@/lib/intake/landing-page";
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
import { NETWORK_CONSENT_VERSION } from "@/lib/network/policy";
import { StepReview } from "./steps/StepReview";
import { StepService } from "./steps/StepService";
import { StepTiming } from "./steps/StepTiming";
import {
  SubmissionFailureBanner,
  SubmissionSuccess,
  type PhotoAttachStatus,
} from "./SubmissionResult";
import type { IntakeStep, IntakeTiming, ProjectIntakeState } from "./types";
import { INITIAL_INTAKE_STATE } from "./types";
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

export function ProjectIntakeForm({ initialService, contextLabel, availabilityReview }: {initialService?: ServiceId; contextLabel?: string; availabilityReview?: boolean}) {
  const [step, setStep] = useState<IntakeStep>("service");
  const [state, setState] = useState<ProjectIntakeState>({...INITIAL_INTAKE_STATE, ...(initialService ? {serviceId: initialService, serviceSelectionStatus: "SELECTED" as const} : {})});
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

  useEffect(() => { trackEvent("request_started"); }, []);

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
    setStep(next === "location" ? "service" : next === "timing" ? "details" : next === "review" ? "contact" : next);
  }

  function handleContinue() {
    if (step === "review" || phase === "sending") return;
    const currentErrors = {...validateStep(step, state), ...validateStep(step === "service" ? "location" : step === "details" ? "timing" : "contact", state)};
    if (Object.keys(currentErrors).length > 0) {
      trackEvent("request_validation_error", step === "service" ? "project" : "details");
      setErrors(currentErrors);
      return;
    }
    setErrors({});
    trackEvent("request_step_completed", step === "service" ? "project" : "details");
    setStep(step === "service" ? "details" : "contact");
  }

  function handleBack() {
    if (phase === "sending") return;
    setErrors({});
    setStep(step === "contact" ? "details" : "service");
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

  async function handleSubmit(acknowledged: boolean) {
    if (!acknowledged) return;
    if (phase === "sending" || phase === "success") return;
    const groups = [["service", "location"], ["details", "timing"], ["contact"]] as const;
    for (const group of groups) {
      const issues = Object.assign({}, ...group.map(item => validateStep(item, state)));
      if (Object.keys(issues).length) { setErrors(issues); setStep(group[0]); return; }
    }
    if (turnstileRequired && !turnstileToken) return;

    if (!idempotencyKeyRef.current) {
      idempotencyKeyRef.current =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : null;
      if (!idempotencyKeyRef.current) {
        trackEvent("request_failed");
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
          networkConsentVersion: NETWORK_CONSENT_VERSION,
          networkAcknowledged: acknowledged,
          firstLandingPage: readFirstLandingPage(),
          attribution: readAttribution(),
        }),
      });

      let result: SubmitProjectResult;
      try {
        result = (await response.json()) as SubmitProjectResult;
      } catch {
        setTurnstileToken(null);
        setTurnstileNonce((n) => n + 1);
        trackEvent("request_failed");
        setPhase("failure");
        return;
      }

      if (result.success) {
        trackEvent("request_submitted");
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
      trackEvent("request_failed");
        setPhase("failure");

      if (result.error === "validation" && result.stepHint) {
        setStep(result.stepHint === "location" ? "service" : result.stepHint === "timing" ? "details" : result.stepHint === "review" ? "contact" : result.stepHint);
      }
    } catch {
      setTurnstileToken(null);
      setTurnstileNonce((n) => n + 1);
      trackEvent("request_failed");
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
          Request a home service.
        </h1>
        <p className={styles.lede}>
          Share a few details about the work. A5 will review your request and offer an introduction to a relevant professional in the network.
        </p>
        <p className={styles.phoneAlt}>
          Prefer to talk?{" "}
          <a href={phoneTelHref(SITE.phone)} data-cta="intake-phone-alt">
            Call {SITE.phone}
          </a>
        </p>
      </div>

      {availabilityReview ? <p className={styles.contextHint}>A5 reviews and forwards your request to a local vendor. The vendor discusses the work and scheduling with you; this request is not a booking.</p> : null}
      {contextLabel ? <p className={styles.contextHint}>Your starting point: {contextLabel}. You can change any details below.</p> : null}
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

      <div className={styles.stepSections} data-intake-step={step}>
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

        {step === "service" ? (
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

        {step === "details" ? (
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

        {step === "contact" ? (
          <StepReview
            state={state}
            photoCount={photos.length}
            onEdit={goTo}
            onSubmit={(acknowledged) => {
              void handleSubmit(acknowledged);
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

      {step !== "contact" ? (
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
