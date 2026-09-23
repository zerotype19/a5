"use client";

import { getServiceById } from "@config/services";
import styles from "../intake.module.css";
import { FormButton } from "../FormButton";
import { TurnstileWidget } from "../TurnstileWidget";
import type { IntakeStep, ProjectIntakeState } from "../types";
import { contactMethodLabel, timingLabel } from "../validation";

type Props = {
  state: ProjectIntakeState;
  onEdit: (step: IntakeStep) => void;
  onSubmit: () => void;
  sending: boolean;
  turnstileSiteKey: string | null;
  turnstileToken: string | null;
  turnstileNonce: number;
  onTurnstileToken: (token: string | null) => void;
  turnstileRequired: boolean;
};

export function StepReview({
  state,
  onEdit,
  onSubmit,
  sending,
  turnstileSiteKey,
  turnstileToken,
  turnstileNonce,
  onTurnstileToken,
  turnstileRequired,
}: Props) {
  const serviceLabel =
    state.serviceSelectionStatus === "NOT_SURE"
      ? "Not sure — will describe the project"
      : state.serviceId
        ? (getServiceById(state.serviceId)?.name ?? state.serviceId)
        : "—";

  const rows: { key: IntakeStep; label: string; value: string }[] = [
    { key: "service", label: "Service", value: serviceLabel },
    { key: "location", label: "ZIP", value: state.zip || "—" },
    {
      key: "details",
      label: "Project description",
      value: state.description.trim() || "—",
    },
    {
      key: "timing",
      label: "Timing",
      value: state.timing ? timingLabel(state.timing) : "—",
    },
    {
      key: "contact",
      label: "Name",
      value: `${state.firstName} ${state.lastName}`.trim() || "—",
    },
    { key: "contact", label: "Phone", value: state.phone || "—" },
    { key: "contact", label: "Email", value: state.email || "—" },
    {
      key: "contact",
      label: "Contact preference",
      value: state.preferredContact
        ? contactMethodLabel(state.preferredContact)
        : "—",
    },
  ];

  const canSubmit =
    !sending && (!turnstileRequired || Boolean(turnstileToken));

  return (
    <div className={styles.panel}>
      <h2 className={styles.stepTitle}>Does everything look right?</h2>
      <p className={styles.stepHint}>
        Review your details. You can edit any section before sending.
      </p>

      <div className={styles.reviewList}>
        {rows.map((row) => (
          <div key={`${row.key}-${row.label}`} className={styles.reviewItem}>
            <div className={styles.reviewHead}>
              <p className={styles.reviewLabel}>{row.label}</p>
              <button
                type="button"
                className={styles.editLink}
                onClick={() => onEdit(row.key)}
                disabled={sending}
                data-cta={`intake-edit-${row.key}`}
              >
                Edit
              </button>
            </div>
            <p className={styles.reviewValue}>{row.value}</p>
          </div>
        ))}
      </div>

      <p className={styles.privacy}>
        We&apos;ll use this information to respond to your project request and
        coordinate next steps.
      </p>

      {turnstileSiteKey ? (
        <div className={styles.turnstileBlock}>
          <TurnstileWidget
            key={turnstileNonce}
            siteKey={turnstileSiteKey}
            onToken={onTurnstileToken}
          />
        </div>
      ) : null}

      <div>
        <FormButton
          type="button"
          variant="primary"
          disabled={!canSubmit}
          onClick={onSubmit}
          dataCta={sending ? "intake-submit-sending" : "intake-submit"}
        >
          {sending ? "Sending…" : "Send Project Request"}
        </FormButton>
      </div>
    </div>
  );
}
