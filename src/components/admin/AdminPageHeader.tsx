import type { ReactNode } from "react";
import styles from "./admin.module.css";
export function AdminPageHeader({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return <header className={styles.pageHeader}><div><p className={styles.kicker}>A5 Operations</p><h1 className={styles.title}>{title}</h1><p className={styles.lede}>{description}</p></div>{actions && <div className={styles.buttonRow}>{actions}</div>}</header>;
}
