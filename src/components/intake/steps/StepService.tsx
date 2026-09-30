"use client";

import { SERVICES } from "@config/services";
import type { ServiceId } from "@config/services";
import styles from "../intake.module.css";
import type { FieldErrors } from "../validation";
import type { ProjectIntakeState } from "../types";

type Props = {
  state: ProjectIntakeState;
  errors: FieldErrors;
  onSelectService: (serviceId: ServiceId) => void;
  onSelectNotSure: () => void;
};

export function StepService({
  state,
  errors,
  onSelectService,
  onSelectNotSure,
}: Props) {
  const errorId = "service-error";

  return (
    <fieldset className={styles.panel} aria-describedby={errors.serviceSelectionStatus || errors.serviceId ? errorId : undefined}>
      <legend className={styles.stepTitle}>What can we help with?</legend>
      <p className={styles.stepHint}>
        You don&apos;t need to know the right trade. Pick a service, or choose
        Not sure and describe what is happening.
      </p>

      {(errors.serviceSelectionStatus || errors.serviceId) && (
        <p id={errorId} className={styles.error} role="alert">
          {errors.serviceSelectionStatus || errors.serviceId}
        </p>
      )}

      <div className={styles.choiceGrid}>
        <button
          type="button"
          className={`${state.serviceSelectionStatus === "NOT_SURE" ? styles.choiceSelected : styles.choice} ${styles.unsureFull}`}
          aria-pressed={state.serviceSelectionStatus === "NOT_SURE"}
          data-cta="intake-service-not-sure"
          onClick={onSelectNotSure}
        >
          <span>
            <span className={styles.choiceTitle}>Not sure</span>
            <span className={styles.choiceBody}>
              Just tell us what is happening — we will help from there.
            </span>
          </span>
        </button>
        {SERVICES.map((service) => {
          const selected =
            state.serviceSelectionStatus === "SELECTED" &&
            state.serviceId === service.id;
          return (
            <button
              key={service.id}
              type="button"
              className={selected ? styles.choiceSelected : styles.choice}
              aria-pressed={selected}
              data-cta={`intake-service-${service.id}`}
              onClick={() => onSelectService(service.id)}
            >
              <span className={styles.choiceTitle}>{service.name}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
