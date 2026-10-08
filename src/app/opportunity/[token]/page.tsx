import {PROGRESS_LABELS} from "@/lib/opportunity/progress";
import type { Metadata } from "next";
import { SITE } from "@config/site";
import { acceptOpportunity, passOpportunity, reportProgress } from "@/lib/opportunity/actions";
import { loadOpportunity } from "@/lib/opportunity/load";
import styles from "./page.module.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Project opportunity",
  referrer: "no-referrer",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false, noimageindex: true },
  },
};

type Params = Promise<{ token: string }>;
type SearchParams = Promise<{ response?: string;progress?:string }>;

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
      {(view.access === "open" || view.access === "accepted") && <p className={styles.greeting}>Hello {view.project.vendorName},</p>}
      {view.access === "open" ? (
        <Project
          token={token}
          project={view.project}
          heading="A new lead for your business"
          showActions
        />
      ) : null}
      {view.access === "accepted" ? (
        <>
          <h1>
            {fresh
              ? "You accepted this introduction."
              : "You've already accepted this introduction."}
          </h1>
          <p className={styles.note}>
            Save the homeowner contact below. This link expires 72 hours after the email was sent.
          </p>
          {process.env.ENABLE_VENDOR_PROGRESS==='true'&&<section id="progress" className={styles.progress}>
           <h2>What happened next?</h2><p>Keep A5 updated so we know whether the introduction helped. These are your reported updates; A5 will review any lead marked not a fit.</p>
           {query.progress==='saved'&&<p role="status">Thank you—your update was saved.</p>}{query.progress==='error'&&<p role="alert">We could not save that update. Try again or contact A5.</p>}
           <form action={reportProgress}><input type="hidden" name="token" value={token}/><label>Lead progress<select name="status" required><option value="">Choose an update</option>{Object.entries(PROGRESS_LABELS).map(([value,label])=><option key={value} value={value}>{label}</option>)}</select></label><label>Notes (optional)<textarea name="note" maxLength={1000} rows={3}/></label><button type="submit">Send update to A5</button></form>
          </section>}
          <h2>Homeowner</h2>
          <dl className={styles.facts}>
            <dt>Name</dt>
            <dd>{view.contact.name}</dd>
            <dt>Preferred contact</dt>
            <dd>{view.contact.preferredContact}</dd>
            <dt>Phone</dt>
            <dd><a href={`tel:${view.contact.phone.replace(/[^+\d]/g, "")}`}>{view.contact.phone}</a></dd>
            <dt>Email</dt>
            <dd><a href={`mailto:${view.contact.email}`}>{view.contact.email}</a></dd>
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
    acceptanceDueAt: string;
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
      {showActions&&<p className={styles.introduction}>A5 Home Services is a network connecting homeowners with independent local professionals. We’re sending this free lead to your business. Accept it to view all customer contact details, the full project request and photos.</p>}
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
      {showActions && <p>Please accept or pass by {new Date(project.acceptanceDueAt).toLocaleString("en-US",{timeZone:"America/New_York",dateStyle:"medium",timeStyle:"short"})} Eastern time.</p>}
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
        <p>{showActions ? "Any project photos become available after acceptance." : "No project photos were attached."}</p>
      )}
      {showActions ? (
        <div className={styles.actions}>
          <form action={acceptOpportunity}>
            <input type="hidden" name="token" value={token} />
            <button type="submit">Accept lead & view customer details</button>
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
