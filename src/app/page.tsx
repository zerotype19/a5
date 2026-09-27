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

const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Tell us what you need",
    body: "Describe the project and optionally share photos.",
  },
  {
    step: "2",
    title: "We coordinate the right professional",
    body: "A5 reviews the request and connects with an appropriate local professional.",
  },
  {
    step: "3",
    title: "Get your project moving",
    body: "The professional contacts the homeowner to discuss next steps.",
  },
] as const;

const WHY_A5 = [
  {
    title: "One place to start",
    body: "Bring the project to A5 instead of chasing multiple contractors on your own.",
  },
  {
    title: "Local professionals",
    body: "A5 works with local service professionals serving our approved Northern New Jersey communities.",
  },
  {
    title: "Projects of all sizes",
    body: "From smaller repairs to larger home improvements across our approved services.",
  },
  {
    title: "Simple coordination",
    body: "A5 handles the handoff so homeowners have a clear next step.",
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
            One call. Any project. Done right.
          </h1>
          <p className={styles.heroLede}>
            Tell us what your home needs. A5 coordinates the right local
            professional to get it done.
          </p>
          <div className={styles.heroActions}>
            <Button
              href="/request-service"
              variant="onHero"
              dataCta="hero-get-help"
            >
              Get Help With a Project
            </Button>
            <Button
              href={tel}
              variant="onHeroSecondary"
              dataCta="hero-call"
              external
            >
              Call A5 · {SITE.phone}
            </Button>
          </div>
          <p className={styles.heroLocal}>
            Serving homeowners across Morris County and surrounding Northern New
            Jersey communities.
          </p>
        </div>
      </section>

      <Section
        id="services"
        eyebrow="Services"
        title="What do you need help with?"
        description="Choose an approved service, or tell us what is happening if you are not sure which trade fits."
      >
        <div className={styles.serviceGrid}>
          {SERVICES.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
          <Link
            className={styles.unsureCard}
            href="/request-service"
            data-cta="service-unsure"
          >
            <span className={styles.unsureTitle}>Not sure what you need?</span>
            <span className={styles.unsureBody}>
              Tell us what is happening at your home and A5 will help from there.
            </span>
          </Link>
        </div>
      </Section>

      <Section
        id="how-it-works"
        tone="muted"
        eyebrow="How A5 works"
        title="A clear path from request to professional"
        description="Simple coordination — without promises about timing, pricing, or guaranteed matching."
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
        id="popular-services"
        eyebrow="Popular services"
        title="Start with the work your home needs"
        description="Each option below comes from the approved A5 service registry."
      >
        <div className={styles.popularRow}>
          {SERVICES.map((service) => (
            <Link
              key={service.id}
              className={styles.popularLink}
              href="/request-service"
              data-cta={`popular-${service.id}`}
            >
              {service.name}
            </Link>
          ))}
        </div>
      </Section>

      <Section
        id="areas"
        tone="muted"
        eyebrow="Local coverage"
        title="Serving a focused Northern New Jersey cluster"
        description="A5 starts with geographic density — these approved communities only."
      >
        <ul className={styles.locationList}>
          {LOCATIONS.map((location) => (
            <li key={location.id} className={styles.locationItem}>
              {location.name}, {location.state}
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="why-a5"
        eyebrow="Why A5"
        title="Built around one trusted starting point"
        description="A5 is designed to feel like one home-services company — not a contractor marketplace."
      >
        <div className={styles.whyGrid}>
          {WHY_A5.map((item) => (
            <article key={item.title} className={styles.whyItem}>
              <h3 className={styles.whyTitle}>{item.title}</h3>
              <p className={styles.whyBody}>{item.body}</p>
            </article>
          ))}
        </div>
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
            description="Tell A5 what you need. Call or start a project request — intake is coming online soon."
          />
        </div>
      </section>
    </main>
  );
}
