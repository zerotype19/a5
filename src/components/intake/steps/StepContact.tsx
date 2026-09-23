"use client";

import styles from "../intake.module.css";
import type { FieldErrors } from "../validation";
import { contactMethodLabel } from "../validation";
import type { IntakeContactMethod, ProjectIntakeState } from "../types";
import { INTAKE_CONTACT_METHODS } from "../types";

type Props = {
  state: ProjectIntakeState;
  errors: FieldErrors;
  onPatch: (patch: Partial<ProjectIntakeState>) => void;
};

export function StepContact({ state, errors, onPatch }: Props) {
  return (
    <div className={styles.panel}>
      <h2 className={styles.stepTitle}>How should we reach you?</h2>
      <p className={styles.stepHint}>
        We will use this to respond about your project — not for marketing.
      </p>

      <div className={styles.fieldRow}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="intake-first-name">
            First name
          </label>
          <input
            id="intake-first-name"
            className={styles.input}
            name="firstName"
            autoComplete="given-name"
            value={state.firstName}
            aria-invalid={Boolean(errors.firstName)}
            aria-describedby={errors.firstName ? "first-name-error" : undefined}
            onChange={(event) => onPatch({ firstName: event.target.value })}
          />
          {errors.firstName ? (
            <p id="first-name-error" className={styles.error} role="alert">
              {errors.firstName}
            </p>
          ) : null}
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="intake-last-name">
            Last name
          </label>
          <input
            id="intake-last-name"
            className={styles.input}
            name="lastName"
            autoComplete="family-name"
            value={state.lastName}
            aria-invalid={Boolean(errors.lastName)}
            aria-describedby={errors.lastName ? "last-name-error" : undefined}
            onChange={(event) => onPatch({ lastName: event.target.value })}
          />
          {errors.lastName ? (
            <p id="last-name-error" className={styles.error} role="alert">
              {errors.lastName}
            </p>
          ) : null}
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="intake-phone">
          Phone
        </label>
        <input
          id="intake-phone"
          className={styles.input}
          name="phone"
          type="tel"
          autoComplete="tel"
          value={state.phone}
          aria-invalid={Boolean(errors.phone)}
          aria-describedby={errors.phone ? "phone-error" : undefined}
          onChange={(event) => onPatch({ phone: event.target.value })}
        />
        {errors.phone ? (
          <p id="phone-error" className={styles.error} role="alert">
            {errors.phone}
          </p>
        ) : null}
      </div>

      <div className={styles.field}>
        <label className={styles.label} htmlFor="intake-email">
          Email
        </label>
        <input
          id="intake-email"
          className={styles.input}
          name="email"
          type="email"
          autoComplete="email"
          value={state.email}
          aria-invalid={Boolean(errors.email)}
          aria-describedby={errors.email ? "email-error" : undefined}
          onChange={(event) => onPatch({ email: event.target.value })}
        />
        {errors.email ? (
          <p id="email-error" className={styles.error} role="alert">
            {errors.email}
          </p>
        ) : null}
      </div>

      <fieldset
        className={styles.panel}
        aria-describedby={errors.preferredContact ? "pref-error" : undefined}
      >
        <legend className={styles.label}>Preferred contact method</legend>
        {errors.preferredContact ? (
          <p id="pref-error" className={styles.error} role="alert">
            {errors.preferredContact}
          </p>
        ) : null}
        <div className={styles.choiceGrid}>
          {INTAKE_CONTACT_METHODS.map((method) => {
            const selected = state.preferredContact === method;
            return (
              <button
                key={method}
                type="button"
                className={selected ? styles.choiceSelected : styles.choice}
                aria-pressed={selected}
                data-cta={`intake-pref-${method}`}
                onClick={() =>
                  onPatch({ preferredContact: method as IntakeContactMethod })
                }
              >
                <span className={styles.choiceTitle}>
                  {contactMethodLabel(method)}
                </span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <p className={styles.privacy}>
        We&apos;ll use this information to respond to your project request and
        coordinate next steps.
      </p>
    </div>
  );
}
