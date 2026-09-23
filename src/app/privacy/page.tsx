import type { Metadata } from "next";
import { SITE } from "@config/site";
import styles from "../request-service/placeholder.module.css";

export const metadata: Metadata = {
  title: "Privacy",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>Legal</p>
      <h1 className={styles.title}>Privacy</h1>
      <p className={styles.body}>
        A detailed privacy policy for {SITE.name} will be published here. Until
        then, contact {SITE.email} with privacy questions.
      </p>
    </main>
  );
}
