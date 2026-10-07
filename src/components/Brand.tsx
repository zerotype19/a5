import Link from "next/link";
import type { MouseEventHandler } from "react";
import { SITE } from "@config/site";
import styles from "./Brand.module.css";

/** One wordmark for the public site, footer and operations workspace. */
export function Brand({ href = "/", inverse = false, context, onClick }: {
  href?: string;
  inverse?: boolean;
  context?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}) {
  return <Link href={href} onClick={onClick} className={`${styles.brand} ${inverse ? styles.inverse : ""}`} aria-label={context ? `${SITE.name} — ${context}` : SITE.name}>
    <span className={styles.mark} aria-hidden="true">A5</span>
    <span className={styles.wordmark} aria-hidden="true"><span>Home</span><span>Services</span></span>
    {context && <span className={styles.context} aria-hidden="true">{context}</span>}
  </Link>;
}
