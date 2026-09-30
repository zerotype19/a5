import Link from "next/link";
import { LOCATIONS } from "@config/locations";
import { SERVICES } from "@config/services";
import { SITE } from "@config/site";
import { Button } from "@/components/Button";
import { CtaBlock } from "@/components/CtaBlock";
import { Section } from "@/components/Section";
import { ServiceCard } from "@/components/ServiceCard";
import { phoneTelHref } from "@/lib/phone";
import styles from "./page.module.css";

const SERVICE_LINES: Record<(typeof SERVICES)[number]["id"], string> = {
  handyman: "Doors, fixtures, and smaller repairs",
  masonry: "Steps, walks, mortar, and pavers",
  landscaping: "Yards, grading, and surface water",
  painting: "Interior and exterior paint",
  drywall: "Ceilings, cracks, and water stains",
  tile: "Floors, showers, and grout",
  plumbing: "Leaks, toilets, and fixtures",
  electrical: "Outlets, switches, and lights",
};

/** Published problem pages only. Paths match the live canonical URLs. */
const PROBLEMS = [
  {
    href: "/services/masonry/brick-step-repair",
    title: "Brick steps cracking",
  },
  {
    href: "/services/drywall/water-damaged-ceiling",
    title: "Water stain on ceiling",
  },
  {
    href: "/services/electrical/dead-outlet",
    title: "Outlet stopped working",
  },
  {
    href: "/services/handyman/sticking-interior-door",
    title: "Door won't close",
  },
  {
    href: "/services/plumbing/running-toilet",
    title: "Toilet keeps running",
  },
  {
    href: "/services/painting/peeling-exterior-paint",
    title: "Paint peeling",
  },
  {
    href: "/services/masonry/sunken-pavers",
    title: "Pavers sinking",
  },
  {
    href: "/services/landscaping/yard-surface-grading",
    title: "Water sitting in yard",
  },
] as const;

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Tell us what's wrong",
    body: "Describe the project in plain language. You do not need to name the trade.",
  },
  {
    step: "2",
    title: "Add photos",
    body: "Up to five photos. Optional, and useful when the problem is visible.",
  },
  {
    step: "3",
    title: "A5 reviews the project",
    body: "A5 reads what you sent and figures out the right kind of help.",
  },
  {
    step: "4",
    title: "We coordinate the appropriate local provider",
    body: "That provider contacts you to discuss next steps.",
  },
] as const;

const FAQ = [
  {
    question: "What kinds of projects can A5 help with?",
    answer:
      "A5 helps with approved home services including handyman work, masonry, landscaping, painting, drywall, tile, plumbing, and electrical.",
  },
  {
    question: "What areas does A5 serve?",
    answer:
      "A5 currently serves Florham Park, Madison, Chatham, Morris Township, Morristown, and East Hanover in New Jersey.",
  },
  {
    question: "What happens after I submit a project?",
    answer:
      "A5 reviews the request, coordinates with an appropriate local professional, and that professional contacts you to discuss next steps.",
  },
  {
    question: "What if I am not sure which type of professional I need?",
    answer:
      "Describe what is happening at your home. A5 can help route the request without requiring you to choose a trade first.",
  },
] as const;

export default function HomePage() {
  const tel = phoneTelHref(SITE.phone);

  return (
    <main>
      <section className={styles.hero} aria-labelledby="hero-heading">
        <div className={styles.heroPlane} aria-hidden="true" />
        <div className={styles.heroInner}>
          <p className={styles.brandSignal}>{SITE.name}</p>
          <h1 id="hero-heading" className={styles.heroTitle}>
            Home repairs, without figuring out the contractor first.
          </h1>
          <p className={styles.heroLede}>
            Tell A5 what&apos;s wrong. Add a few photos. We&apos;ll review the
            project and help coordinate the right local service provider.
          </p>
          <div className={styles.heroActions}>
            <Button
              href="/request-service"
              variant="onHero"
              dataCta="hero-get-help"
            >
              Tell us what needs fixing
            </Button>
            <Button href="/#services" variant="onHeroSecondary" dataCta="hero-browse">
              Browse services
            </Button>
          </div>
          <p className={styles.heroLocal}>Northern New Jersey.</p>
          <p className={styles.heroLocal}>
            <a href={tel} data-cta="hero-call">
              Or call {SITE.phone}
            </a>
          </p>
        </div>
      </section>

      <Section
        id="problems"
        eyebrow="What needs fixing?"
        title="Start with the problem, not the trade."
        description="These are real situations homeowners describe. Each one opens a page that explains what you are seeing."
      >
        <ul className={styles.problemList}>
          {PROBLEMS.map((problem) => (
            <li key={problem.href}>
              <Link className={styles.problemLink} href={problem.href}>
                {problem.title}
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="services"
        tone="muted"
        eyebrow="Services"
        title="Eight kinds of work A5 coordinates."
        description="Choose an approved service, or tell us what is happening if you are not sure which trade fits."
      >
        <div className={styles.serviceGrid}>
          {SERVICES.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              line={SERVICE_LINES[service.id]}
            />
          ))}
        </div>
        <Link
          className={styles.unsureCard}
          href="/request-service"
          data-cta="service-unsure"
        >
          <span className={styles.unsureTitle}>Not sure what you need?</span>
          <span className={styles.unsureBody}>
            You don&apos;t need to know the right trade. Tell us what is
            happening at your home and A5 will help from there.
          </span>
        </Link>
      </Section>

      <Section
        id="how-it-works"
        eyebrow="How A5 works"
        title="A clear path from request to a local provider."
        description="Coordination only. Timing, price, and who is available are not promised here."
      >
        <ol className={styles.steps}>
          {HOW_IT_WORKS.map((item) => (
            <li key={item.step} className={styles.step}>
              <span className={styles.stepNum} aria-hidden="true">
                {item.step}
              </span>
              <div>
                <h3 className={styles.stepTitle}>{item.title}</h3>
                <p className={styles.stepBody}>{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section
        id="areas"
        tone="muted"
        eyebrow="Where"
        title="Serving Northern New Jersey"
        description="A5 currently coordinates work in these six communities."
      >
        <ul className={styles.locationList}>
          {LOCATIONS.map((location) => (
            <li key={location.id}>
              <Link
                className={styles.locationLink}
                href={`/home-services/${location.slug}`}
              >
                {location.name}
                <span className={styles.locationState}>{location.state}</span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="why-a5"
        eyebrow="Why start here"
        title="A clear starting point."
        description="See how A5 works, where it coordinates, and how your project details are handled before you send anything."
      >
        <ul className={styles.trustList}>
          <li>
            <h3>A clear starting point</h3>
            <p>
              You see the steps before you send anything.{" "}
              <a href="#how-it-works">How A5 works</a>
            </p>
          </li>
          <li>
            <h3>Local coverage</h3>
            <p>
              A5 coordinates eight services in six Northern New Jersey towns.
            </p>
          </li>
          <li>
            <h3>Private project details</h3>
            <p>
              Your contact details and photos stay with the project request.{" "}
              <Link href="/privacy">Privacy</Link>
            </p>
          </li>
          <li>
            <h3>Useful homeowner guidance</h3>
            <p>
              <Link href="/guides/why-brick-steps-crack">
                Why brick steps crack
              </Link>
            </p>
          </li>
        </ul>
      </Section>

      <Section
        id="questions"
        tone="muted"
        eyebrow="Homeowner questions"
        title="Straight answers before you reach out"
      >
        <div className={styles.faqList}>
          {FAQ.map((item) => (
            <details key={item.question} className={styles.faqItem}>
              <summary>{item.question}</summary>
              <p>{item.answer}</p>
            </details>
          ))}
        </div>
      </Section>

      <section className={styles.finalCta} aria-label="Final call to action">
        <div className={styles.finalInner}>
          <CtaBlock
            title="Have something around the house that needs attention?"
            description="Tell A5 what you need. Call or start a project request."
          />
        </div>
      </section>
    </main>
  );
}
