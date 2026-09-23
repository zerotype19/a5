"use client";

import styles from "../intake.module.css";
import type { FieldErrors } from "../validation";
import type { ProjectIntakeState } from "../types";

type Props = {
  state: ProjectIntakeState;
  errors: FieldErrors;
  onChangeDescription: (value: string) => void;
};

export function StepDetails({ state, errors, onChangeDescription }: Props) {
  const errorId = "description-error";
  const count = state.description.length;

  return (
    <div className={styles.panel}>
      <h2 className={styles.stepTitle}>Tell us what&apos;s going on.</h2>
      <p className={styles.stepHint}>
        Use everyday language. You do not need contractor terminology.
      </p>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="intake-description">
          Project description
        </label>
        <textarea
          id="intake-description"
          className={styles.textarea}
          name="description"
          maxLength={2000}
          value={state.description}
          placeholder="The brick steps at our front door are cracking and a few bricks are loose..."
          aria-invalid={Boolean(errors.description)}
          aria-describedby={errors.description ? errorId : "description-count"}
          data-cta="intake-description"
          onChange={(event) => onChangeDescription(event.target.value)}
        />
        <span id="description-count" className={styles.charCount}>
          {count} / 2000
        </span>
        {errors.description ? (
          <p id={errorId} className={styles.error} role="alert">
            {errors.description}
          </p>
        ) : null}
      </div>

      <div className={styles.photoNote}>
        <p className={styles.photoNoteTitle}>
          Have photos? They can help us understand the project.
        </p>
        <p className={styles.photoNoteBody}>
          Secure photo upload is coming in a later step. For now, a clear
          written description is enough to continue.
        </p>
        <p className={styles.photoBadge}>Coming in next step</p>
      </div>
    </div>
  );
}
