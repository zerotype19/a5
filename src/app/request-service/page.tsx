import type { Metadata } from "next";
import { SITE } from "@config/site";
import { Button } from "@/components/Button";
import { phoneTelHref } from "@/lib/phone";
import styles from "./placeholder.module.css";

export const metadata: Metadata = {
  title: "Request Service",
  description:
    "Project intake is coming online. Call or email A5 Home Services in the meantime.",
  robots: { index: false, follow: false },
};

export default function RequestServicePage() {
  return (
    <main className={styles.main}>
      <p className={styles.eyebrow}>Request service</p>
      <h1 className={styles.title}>Project intake is coming online.</h1>
      <p className={styles.body}>
        The guided project request flow is not available yet. Reach A5 directly
        and we will help from there.
      </p>
      <div className={styles.actions}>
        <Button
          href={phoneTelHref(SITE.phone)}
          variant="primary"
          dataCta="request-call"
          external
        >
          Call {SITE.phone}
        </Button>
        <Button
          href={`mailto:${SITE.email}`}
          variant="secondary"
          dataCta="request-email"
          external
        >
          Email {SITE.email}
        </Button>
      </div>
    </main>
  );
}
