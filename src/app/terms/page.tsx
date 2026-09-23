import type { Metadata } from "next";
import { SITE } from "@config/site";
import styles from "../request-service/placeholder.module.css";

export const metadata: Metadata = {
  title: "Terms",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>Legal</p>
      <h1 className={styles.title}>Terms</h1>
      <p className={styles.body}>
        Terms of use for {SITE.name} will be published here. Contact{" "}
        {SITE.email} with questions in the meantime.
      </p>
    </main>
  );
}
