"use client";

import styles from "../intake.module.css";
import type { FieldErrors } from "../validation";
import type { ProjectIntakeState } from "../types";

type Props = {
  state: ProjectIntakeState;
  errors: FieldErrors;
  onChangeZip: (zip: string) => void;
};

export function StepLocation({ state, errors, onChangeZip }: Props) {
  const errorId = "zip-error";

  return (
    <div className={styles.panel}>
      <h2 className={styles.stepTitle}>Where is the project?</h2>
      <p className={styles.stepHint}>
        Enter the ZIP code for the home. We accept any ZIP — coverage
        classification happens later.
      </p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="intake-zip">
          ZIP code
        </label>
        <input
          id="intake-zip"
          className={styles.input}
          name="zip"
          inputMode="numeric"
          autoComplete="postal-code"
          maxLength={5}
          value={state.zip}
          aria-invalid={Boolean(errors.zip)}
          aria-describedby={errors.zip ? errorId : undefined}
          data-cta="intake-zip"
          onChange={(event) =>
            onChangeZip(event.target.value.replace(/\D/g, "").slice(0, 5))
          }
        />
        {errors.zip ? (
          <p id={errorId} className={styles.error} role="alert">
            {errors.zip}
          </p>
        ) : null}
      </div>
    </div>
  );
}
