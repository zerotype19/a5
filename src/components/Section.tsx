import styles from "./Section.module.css";

type Props = {
  id?: string;
  eyebrow?: string;
  title: string;
  description?: string;
  children: React.ReactNode;
  tone?: "default" | "muted" | "ink";
};

export function Section({
  id,
  eyebrow,
  title,
  description,
  children,
  tone = "default",
}: Props) {
  return (
    <section
      id={id}
      className={`${styles.section} ${styles[tone]}`}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          {eyebrow ? <p className={styles.eyebrow}>{eyebrow}</p> : null}
          <h2 className={styles.title} id={id ? `${id}-title` : undefined}>
            {title}
          </h2>
          {description ? (
            <p className={styles.description}>{description}</p>
          ) : null}
        </header>
        <div className={styles.body}>{children}</div>
      </div>
    </section>
  );
}
