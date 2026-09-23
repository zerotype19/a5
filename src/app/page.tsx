import { SITE } from "@config/site";
import styles from "./page.module.css";

/**
 * Day 0 placeholder only — not production marketing/SEO content.
 */
export default function Home() {
  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>Foundation</p>
      <h1 className={styles.title}>{SITE.name}</h1>
      <p className={styles.lede}>
        Day 0 application skeleton. Product features ship only through
        owner-approved tasks.
      </p>
      <p className={styles.meta}>
        Canonical site:{" "}
        <a href={SITE.url} rel="noopener noreferrer">
          {SITE.domain}
        </a>
      </p>
    </main>
  );
}
