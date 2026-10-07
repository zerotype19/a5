import type { ReactNode } from "react";
import styles from "./templates.module.css";

export function PageIntro({ eyebrow, title, description, children }: {
  eyebrow?: string;
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return <header className={styles.intro}>
    {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
    <h1>{title}</h1>
    {description && <p className={styles.description}>{description}</p>}
    {children}
  </header>;
}
