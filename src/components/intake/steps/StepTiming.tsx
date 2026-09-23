"use client";

import styles from "../intake.module.css";
import type { FieldErrors } from "../validation";
import { timingLabel } from "../validation";
import type { IntakeTiming, ProjectIntakeState } from "../types";
import { INTAKE_TIMINGS } from "../types";

type Props = {
  state: ProjectIntakeState;
  errors: FieldErrors;
  onSelectTiming: (timing: IntakeTiming) => void;
};

export function StepTiming({ state, errors, onSelectTiming }: Props) {
  const errorId = "timing-error";

  return (
    <fieldset
      className={styles.panel}
      aria-describedby={errors.timing ? errorId : undefined}
    >
      <legend className={styles.stepTitle}>
        When would you like to get started?
      </legend>
      <p className={styles.stepHint}>
        This helps us understand your timing. It is not a promise of
        availability.
      </p>

      {errors.timing ? (
        <p id={errorId} className={styles.error} role="alert">
          {errors.timing}
        </p>
      ) : null}

      <div className={styles.choiceGrid}>
        {INTAKE_TIMINGS.map((timing) => {
          const selected = state.timing === timing;
          return (
            <button
              key={timing}
              type="button"
              className={selected ? styles.choiceSelected : styles.choice}
              aria-pressed={selected}
              data-cta={`intake-timing-${timing}`}
              onClick={() => onSelectTiming(timing)}
            >
              <span className={styles.choiceTitle}>{timingLabel(timing)}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
