"use client";

import Link from "next/link";
import { SITE } from "@config/site";
import { phoneTelHref } from "@/lib/phone";
import styles from "./intake.module.css";
import { FormButton } from "./FormButton";

export type PhotoAttachStatus = "none" | "all" | "partial" | "failed";

type SuccessProps = {
  publicReference: string;
  photoStatus?: PhotoAttachStatus;
  attachedCount?: number;
  failedCount?: number;
  onRetryPhotos?: () => void;
  photoRetrying?: boolean;
};

export function SubmissionSuccess({
  publicReference,
  photoStatus = "none",
  attachedCount = 0,
  failedCount = 0,
  onRetryPhotos,
  photoRetrying,
}: SuccessProps) {
  let photoMessage: string | null = null;
  if (photoStatus === "all") {
    photoMessage = "Your photos were attached successfully.";
  } else if (photoStatus === "partial") {
    photoMessage = `We received your project request, but ${failedCount} of ${attachedCount + failedCount} photos couldn't be attached.`;
  } else if (photoStatus === "failed") {
    photoMessage =
      "We received your project request, but one or more photos couldn't be attached.";
  }

  return (
    <div className={styles.panel} data-intake="submission-success" role="status">
      <h2 className={styles.stepTitle}>We received your project request</h2>
      <p className={styles.stepHint}>
        {photoStatus === "all"
          ? "A5 will review the details and your photos, then coordinate next steps."
          : "A5 will review the details and coordinate next steps."}
      </p>
      {photoMessage ? <p className={styles.stepHint}>{photoMessage}</p> : null}
      <p className={styles.referenceLine}>
        Reference: <strong>{publicReference}</strong>
      </p>
      {(photoStatus === "partial" || photoStatus === "failed") &&
      onRetryPhotos ? (
        <div className={styles.resultActions}>
          <FormButton
            type="button"
            variant="secondary"
            disabled={photoRetrying}
            onClick={onRetryPhotos}
            dataCta="intake-retry-photos"
          >
            {photoRetrying ? "Retrying photos…" : "Retry photo upload"}
          </FormButton>
        </div>
      ) : null}
      <div className={styles.resultActions}>
        <a
          className={styles.resultLinkPrimary}
          href={phoneTelHref(SITE.phone)}
          data-cta="intake-success-call"
        >
          Call A5
        </a>
        <Link
          className={styles.resultLinkSecondary}
          href="/"
          data-cta="intake-success-home"
        >
          Return home
        </Link>
      </div>
    </div>
  );
}

type FailureProps = {
  onRetry: () => void;
};

export function SubmissionFailureBanner({ onRetry }: FailureProps) {
  return (
    <div
      className={styles.submitError}
      role="alert"
      data-intake="submission-failure"
    >
      <p>
        We couldn&apos;t send your request. Your information is still here —
        please try again.
      </p>
      <p className={styles.submitErrorAlt}>
        Prefer to talk?{" "}
        <a href={phoneTelHref(SITE.phone)} data-cta="intake-failure-call">
          Call {SITE.phone}
        </a>
      </p>
      <button
        type="button"
        className={styles.editLink}
        onClick={onRetry}
        data-cta="intake-submit-retry"
      >
        Dismiss
      </button>
    </div>
  );
}

type Props = {
  children: React.ReactNode;
};

/** Keeps FormButton available for callers that need a retry primary CTA. */
export function SubmissionFailureActions({ children }: Props) {
  return <div className={styles.resultActions}>{children}</div>;
}

export function SubmissionRetryButton({ onClick }: { onClick: () => void }) {
  return (
    <FormButton
      type="button"
      variant="primary"
      onClick={onClick}
      dataCta="intake-submit-try-again"
    >
      Try again
    </FormButton>
  );
}
