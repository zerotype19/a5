import styles from "./intake.module.css";
import type { IntakeStep } from "./types";
import { INTAKE_STEPS } from "./types";

const STEP_LABELS: Record<IntakeStep, string> = {
  service: "Service",
  location: "Location",
  details: "Details",
  timing: "Timing",
  contact: "Contact",
  review: "Review",
};

type Props = {
  step: IntakeStep;
};

export function IntakeProgress({ step }: Props) {
  const index = INTAKE_STEPS.indexOf(step);
  const current = index + 1;
  const total = INTAKE_STEPS.length;

  return (
    <div className={styles.progress} aria-live="polite">
      <p className={styles.progressLabel}>
        Step {current} of {total}
        <span className={styles.progressMuted}> · {STEP_LABELS[step]}</span>
      </p>
      <ol className={styles.progressTrack} aria-hidden="true">
        {INTAKE_STEPS.map((id, i) => (
          <li
            key={id}
            className={
              i < index
                ? styles.progressDotDone
                : i === index
                  ? styles.progressDotCurrent
                  : styles.progressDot
            }
          />
        ))}
      </ol>
    </div>
  );
}
