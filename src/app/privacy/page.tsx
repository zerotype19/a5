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
        through {SITE.domain}. It was last updated on October 8, 2026.
      </p>

      <h2 className={styles.sectionTitle}>What you can send us</h2>
      <p className={styles.body}>
        A project request can include your first and last name, phone number,
        email address, preferred way to be contacted, ZIP code, the service you
        select or a note that you are not sure, project timing, a description
        of the work, and optional photos. You can also call or email A5
        directly.
      </p>

      <h2 className={styles.sectionTitle}>Vendor signups</h2>
      <p className={styles.body}>Businesses can submit a name, contact person, email, optional phone and website, services, operating towns and optional project preferences. We store this information and the submitted permission to receive project emails in our private Supabase operations database. A5 uses it to maintain vendor records and manually forward relevant requests. Signup details are not a public directory listing or a marketing subscription. Contact A5 to correct your information or stop receiving requests.</p>

      <h2 className={styles.sectionTitle}>How we use it</h2>
      <p className={styles.body}>
        A5 uses this information to respond to your project request and to
        offer an introduction to an independent local service professional. Contact details are
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
        Before acceptance, a professional sees only the service, town and broad timing. After accepting the introduction, that professional can see your full description, contact details and photos. A5 operations can
        see the request in a private admin tool. We do not publish your
        contact details or photos on the public site.
      </p>

      <h2 className={styles.sectionTitle}>Request check-ins and private feedback</h2>
      <p className={styles.body}>With your request permission, A5 may email a secure check-in link to ask whether contact happened and how the project went. These are separate questions. You can stop check-in emails for that request using the link. Providers receive their own progress-update links. Feedback is private to A5 operations; it is not posted publicly or shown to the other party. Homeowner reports of completed work can include a private rating. A5 uses valid feedback to inform manual provider selection and follow up on unsuccessful connections. No response is treated as unknown. Contact A5 to correct a report or dispute its accuracy.</p>
      <p className={styles.body}>If an offer expires or is declined, A5 may offer the request to another professional. After acceptance, we confirm with you before another introduction. Revoking access stops future access through that link; information already viewed or saved cannot be recalled. Transactional emails are delivered using Resend.</p>
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
        You can change your choice using Analytics preferences in the footer. The site also
        keeps limited first- and last-visit attribution in session storage,
        including the page path, referring site and campaign identifiers when
        available. This context may be stored
        with a submitted request to understand which marketing is useful.
        Hosting and security tools may record technical data to deliver the site
        and limit abuse.
      </p>

      <h2 className={styles.sectionTitle}>How long we keep it</h2>
      <p className={styles.body}>
        A5 keeps a request for as long as needed to respond, make the introduction, follow up on the connection, and keep an ordinary record of that request. You can ask us to
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
