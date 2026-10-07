"use client";

import { getServiceById } from "@config/services";
import styles from "../intake.module.css";
import { FormButton } from "../FormButton";
import { TurnstileWidget } from "../TurnstileWidget";
import type { IntakeStep, ProjectIntakeState } from "../types";
import { contactMethodLabel, timingLabel } from "../validation";

type Props = {
  state: ProjectIntakeState;
  photoCount?: number;
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
  photoCount = 0,
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
      ? "Not sure"
      : state.serviceId
        ? (getServiceById(state.serviceId)?.name ?? state.serviceId)
        : "—";

  const groups: {
    title: string;
    edit: IntakeStep;
    rows: { label: string; value: string }[];
  }[] = [
    {
      title: "Project",
      edit: "service",
      rows: [
        { label: "Service", value: serviceLabel },
        {
          label: "What's going on",
          value: state.description.trim() || "—",
        },
      ],
    },
    {
      title: "Location",
      edit: "location",
      rows: [{ label: "ZIP", value: state.zip || "—" }],
    },
    {
      title: "Timing",
      edit: "timing",
      rows: [
        {
          label: "Timing",
          value: state.timing ? timingLabel(state.timing) : "—",
        },
      ],
    },
    {
      title: "Contact",
      edit: "contact",
      rows: [
        {
          label: "Name",
          value: `${state.firstName} ${state.lastName}`.trim() || "—",
        },
        { label: "Phone", value: state.phone || "—" },
        { label: "Email", value: state.email || "—" },
        {
          label: "Contact preference",
          value: state.preferredContact
            ? contactMethodLabel(state.preferredContact)
            : "—",
        },
      ],
    },
    {
      title: "Photos",
      edit: "details",
      rows: [
        {
          label: "Attached",
          value:
            photoCount === 0
              ? "None yet — photos are optional"
              : `${photoCount} photo${photoCount === 1 ? "" : "s"}`,
        },
      ],
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
        {groups.map((group) => (
          <section key={group.title} className={styles.reviewItem}>
            <div className={styles.reviewHead}>
              <p className={styles.reviewLabel}>{group.title}</p>
              <button
                type="button"
                className={styles.editLink}
                onClick={() => onEdit(group.edit)}
                disabled={sending}
                data-cta={`intake-edit-${group.edit}`}
              >
                Edit
              </button>
            </div>
            {group.rows.map((row) => (
              <p key={row.label} className={styles.reviewValue}>
                <span className={styles.progressMuted}>{row.label}: </span>
                {row.value}
              </p>
            ))}
          </section>
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
