import type { Metadata } from "next";
import { SITE } from "@config/site";
import { acceptOpportunity, passOpportunity } from "@/lib/opportunity/actions";
import { loadOpportunity } from "@/lib/opportunity/load";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Project opportunity",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

type Params = Promise<{ token: string }>;
type SearchParams = Promise<{ response?: string }>;

export default async function OpportunityPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SearchParams;
}) {
  const { token } = await params;
  const query = await searchParams;
  const view = await loadOpportunity(token);
  const fresh = query.response === "new";

  return (
    <main className={styles.page}>
      <p className={styles.brand}>{SITE.name}</p>
      {view.access === "unavailable" ? (
        <Unavailable />
      ) : null}
      {view.access === "passed" ? (
        <h1>{fresh ? "You passed on this project." : "You've already passed on this project."}</h1>
      ) : null}
      {view.access === "open" ? (
        <Project
          token={token}
          project={view.project}
          heading="Project opportunity"
          showActions
        />
      ) : null}
      {view.access === "accepted" ? (
        <>
          <h1>
            {fresh
              ? "You accepted this project."
              : "You've already accepted this project."}
          </h1>
          <p className={styles.note}>
            Save the homeowner contact below. This link expires 72 hours after the email was sent.
          </p>
          <h2>Homeowner</h2>
          <dl className={styles.facts}>
            <dt>Name</dt>
            <dd>{view.contact.name}</dd>
            <dt>Preferred contact</dt>
            <dd>{view.contact.preferredContact}</dd>
            <dt>Phone</dt>
            <dd>{view.contact.phone}</dd>
            <dt>Email</dt>
            <dd>{view.contact.email}</dd>
          </dl>
          <Project token={token} project={view.project} heading="Project" showActions={false} />
        </>
      ) : null}
    </main>
  );
}

function Unavailable() {
  return (
    <>
      <h1>This project link is no longer available.</h1>
      <p>
        Contact A5 if you are still interested.{" "}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
        {" · "}
        <a href={`tel:${SITE.phone.replace(/[^\d+]/g, "")}`}>{SITE.phone}</a>
      </p>
    </>
  );
}

function Project({
  token,
  project,
  heading,
  showActions,
}: {
  token: string;
  project: {
    serviceLabel: string;
    locationLabel: string;
    timingLabel: string;
    description: string;
    photos: { id: string; url: string }[];
  };
  heading: string;
  showActions: boolean;
}) {
  const Title = showActions ? "h1" : "h2";
  return (
    <>
      <Title>{heading}</Title>
      <dl className={styles.facts}>
        <dt>Service</dt>
        <dd>{project.serviceLabel}</dd>
        <dt>Location</dt>
        <dd>{project.locationLabel}</dd>
        <dt>Timing</dt>
        <dd>{project.timingLabel}</dd>
        <dt>Project</dt>
        <dd>{project.description}</dd>
      </dl>
      {project.photos.length > 0 ? (
        <ul className={styles.photos}>
          {project.photos.map((photo) => (
            <li key={photo.id}>
              {/* Signed private URL. Do not run it through the image optimizer. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photo.url} alt="Project photo" />
            </li>
          ))}
        </ul>
      ) : (
        <p>No project photos were attached.</p>
      )}
      {showActions ? (
        <div className={styles.actions}>
          <form action={acceptOpportunity}>
            <input type="hidden" name="token" value={token} />
            <button type="submit">Accept project</button>
          </form>
          <form action={passOpportunity}>
            <input type="hidden" name="token" value={token} />
            <button className={styles.secondary} type="submit">Pass</button>
          </form>
        </div>
      ) : null}
    </>
  );
}
