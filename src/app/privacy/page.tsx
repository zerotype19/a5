import type { Metadata } from "next";
import { SITE } from "@config/site";
import styles from "@/components/templates/templates.module.css";

export const metadata: Metadata = {
  title: "Privacy",
  alternates: {canonical:"/privacy"},
  description: `How ${SITE.name} uses the information homeowners provide with a project request.`,
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <main className={`${styles.page} ${styles.reading} ${styles.prose}`}>
      <p className={styles.eyebrow}>Legal</p>
      <h1 className={styles.legalTitle}>Privacy</h1>
      <p className={styles.body}>
        This page describes how {SITE.name} handles information submitted
        through {SITE.domain}. It was last updated on October 7, 2026.
      </p>

      <h2 className={styles.sectionTitle}>What you can send us</h2>
      <p className={styles.body}>
        A project request can include your first and last name, phone number,
        email address, preferred way to be contacted, ZIP code, the service you
        select or a note that you are not sure, project timing, a description
        of the work, and optional photos. You can also call or email A5
        directly.
      </p>

      <h2 className={styles.sectionTitle}>How we use it</h2>
      <p className={styles.body}>
        A5 uses this information to respond to your project request and to
        coordinate an appropriate local service provider. Contact details are
        used to reach you about that request. Photos are used to understand the
        project. Submitting a request is not a marketing signup.
      </p>
      <p className={styles.body}>
        A5 does not sell homeowner information through this website, does not
        take payments on this website, and does not use project requests to
        build an automated profile of you.
      </p>

      <h2 className={styles.sectionTitle}>Who else may see it</h2>
      <p className={styles.body}>
        A5 may share the details needed to fulfill your request with a service
        provider who is being asked to look at that project. A5 operations can
        see the request in a private admin tool. We do not publish your
        contact details or photos on the public site.
      </p>

      <h2 className={styles.sectionTitle}>Where it is stored</h2>
      <p className={styles.body}>
        The site is hosted on Cloudflare. Project requests and account data for
        A5 operations are stored in Supabase. Photos go to a private storage
        bucket. Cloudflare Turnstile is used to check that a submission is not
        an automated abuse attempt. Those providers process the information
        only so A5 can operate the site and the request.
      </p>
      <p className={styles.body}>
        When optional analytics is enabled, you can choose whether to allow it.
        Analytics measures page visits, call clicks and request steps; names,
        contact details, photos and project descriptions are not sent to analytics.
        You can change your choice using Analytics preferences. The site also
        keeps limited first- and last-visit attribution in session storage,
        including the page path, referring site and campaign identifiers when
        available. This context may be stored
        with a submitted request to understand which marketing is useful.
        Hosting and security tools may record technical data to deliver the site
        and limit abuse.
      </p>

      <h2 className={styles.sectionTitle}>How long we keep it</h2>
      <p className={styles.body}>
        A5 keeps a request for as long as needed to respond, coordinate the
        work, and keep an ordinary record of that request. You can ask us to
        review or delete information you submitted by contacting A5. We may
        retain what we still need for a pending request or for a legal
        obligation.
      </p>

      <h2 className={styles.sectionTitle}>Questions</h2>
      <p className={styles.body}>
        Email{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or call {SITE.phone}.
      </p>
      <ul className={styles.list}>
        <li>Ask what we have from your request.</li>
        <li>Ask us to correct it.</li>
        <li>Ask us to delete it, subject to the limits above.</li>
      </ul>
    </main>
  );
}
