import { ArrowIcon } from "@/components/ArrowIcon";
import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@config/site";
import { COUNTIES } from "@config/counties";
import { Button } from "@/components/Button";
import { PageIntro } from "@/components/templates/PageIntro";
import { phoneTelHref } from "@/lib/phone";
import styles from "@/components/templates/templates.module.css";
export const metadata: Metadata = { title: "About A5", description: "A5 helps Northern New Jersey homeowners explain a repair and connect with an appropriate local service provider.", alternates: { canonical: "/about" } };
export default function AboutPage() {
  return <main className={styles.page}><div className={styles.reading}>
    <PageIntro eyebrow="Your home services network" title="A simpler way to get things fixed." description="A5 connects homeowners with local service professionals for repairs, maintenance and improvements. One request gives us a place to start." />
    <div className={styles.prose}>
      <h2>One request. A clearer next step.</h2>
      <p>Describe the project, share your ZIP code, and add a few photos if they help. You can choose a service or tell us you are not sure. We review the service and location, then offer the opportunity to a relevant independent professional in the network.</p>
      <h2>Know who does what.</h2>
      <p>A5 makes the introduction; we do not perform or manage the work. When a professional accepts, you discuss the scope, estimate, scheduling and work directly with the provider. Sending a request does not book an appointment or commit you to an estimate.</p>
      <h2>Local starts with your neighborhood.</h2>
      <p>Our Northern New Jersey directory covers {COUNTIES.map(county => county.name).join(", ")}. A professional’s acceptance means they intend to contact you; availability and scheduling are discussed directly. <Link href="/home-services">Find your town.</Link></p>
      <h2>Your home stays your business.</h2>
      <p>Your full request, contact details and optional photos are shared with a professional after they accept the opportunity. They are not published as a project gallery. <Link href="/privacy">Read how we handle your information.</Link></p>
      <h2>A connection we can learn from.</h2>
      <p>We may ask whether you heard from the professional and how the project went. Your updates help A5 follow up on unsuccessful connections. If you report completed work, you can leave private feedback for A5. Nothing is rated automatically.</p>
      <h2>Start wherever you are.</h2>
      <p>You do not need a finished plan. Tell us what is happening, what you would like to change, and when you hope to start. For immediate danger, contact emergency services or the appropriate utility; A5 is not an emergency dispatch service.</p>
      <p>Prefer a conversation? <a href={phoneTelHref(SITE.phone)}>Call {SITE.phone}</a> or <a href={`mailto:${SITE.email}`}>email A5</a>.</p>
    </div>
    <Button href="/request-service">Request service <ArrowIcon /></Button>
  </div></main>;
}
