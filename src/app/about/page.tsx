import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@config/site";
import { LOCATIONS } from "@config/locations";
import { Button } from "@/components/Button";
import { PageIntro } from "@/components/templates/PageIntro";
import { phoneTelHref } from "@/lib/phone";
import styles from "@/components/templates/templates.module.css";
export const metadata: Metadata = { title: "About A5", description: "A5 helps Northern New Jersey homeowners explain a repair and connect with an appropriate local service provider.", alternates: { canonical: "/about" } };
export default function AboutPage() {
  return <main className={styles.page}><div className={styles.reading}>
    <PageIntro eyebrow="Home services, made easier" title="One place for the services your home needs." description="A5 makes it easier to find help for repairs, maintenance and improvements by coordinating introductions to preferred local vendors." />
    <div className={styles.prose}>
      <h2>One request. A clearer next step.</h2>
      <p>Describe the project, share your ZIP code, and add a few photos if they help. You can choose a service or tell us you are not sure. We review the details and check for an appropriate local provider.</p>
      <h2>Know who does what.</h2>
      <p>A5 coordinates the introduction. When there is a match, you discuss the scope, estimate, scheduling and work directly with the provider. Sending a request does not book an appointment or commit you to an estimate.</p>
      <h2>Local starts with your neighborhood.</h2>
      <p>We focus on {LOCATIONS.map(location => location.name).join(", ")} in Northern New Jersey. Availability depends on the service and project; we confirm the fit after reviewing your request.</p>
      <h2>Your home stays your business.</h2>
      <p>Project details and optional photos help us review the request and coordinate next steps. They are not published as a project gallery. <Link href="/privacy">Read how we handle your information.</Link></p>
      <h2>Start wherever you are.</h2>
      <p>You do not need a finished plan. Tell us what is happening, what you would like to change, and when you hope to start. For immediate danger, contact emergency services or the appropriate utility; A5 is not an emergency dispatch service.</p>
      <p>Prefer a conversation? <a href={phoneTelHref(SITE.phone)}>Call {SITE.phone}</a> or <a href={`mailto:${SITE.email}`}>email A5</a>.</p>
    </div>
    <Button href="/request-service">Request service →</Button>
  </div></main>;
}
