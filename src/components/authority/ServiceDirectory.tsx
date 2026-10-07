import { ArrowIcon } from "@/components/ArrowIcon";
import Link from "next/link";
import { SERVICES } from "@config/services";
import { LOCATIONS } from "@config/locations";
import { fetchPublishedPages } from "@/lib/authority/query";
import { PageIntro } from "@/components/templates/PageIntro";
import { requestHref } from "@/lib/intake/context";
import type { ContentPageRecord } from "@/lib/authority/types";
import styles from "./ServiceDirectory.module.css";
import template from "@/components/templates/templates.module.css";

export async function ServiceDirectory({by, records}: {by: "service" | "town"; records?: ContentPageRecord[]}) {
  const pages = (records ?? await fetchPublishedPages()).filter(p => p.indexable && p.status === "PUBLISHED");
  const groups = by === "service" ? SERVICES : LOCATIONS;
  return <main className={template.page}>
    <PageIntro eyebrow="A5 home services" title={by === "service" ? "The right help for your home." : "Home services in your community."} description="Browse by service or town, explore common repairs, and send one request to A5. We review the details and help coordinate a preferred local vendor. Availability is confirmed after review." />
    <nav className={styles.switcher} aria-label="Browse home services"><Link aria-current={by === "service" ? "page" : undefined} href="/services">By service</Link><Link aria-current={by === "town" ? "page" : undefined} href="/home-services">By town</Link><Link href="/guides">Planning guides</Link></nav>
    <div className={styles.grid}>{groups.map(group => {
      const hub = pages.find(p => by === "service" ? p.page_type === "SERVICE" && p.primary_service_id === group.id : p.page_type === "LOCATION" && p.primary_location_id === group.id);
      const locals = pages.filter(p => p.page_type === "SERVICE_LOCATION" && (by === "service" ? p.primary_service_id === group.id : p.primary_location_id === group.id));
      const problems = by === "service" ? pages.filter(p => p.page_type === "PROBLEM" && p.primary_service_id === group.id) : [];
      const hubPath = by === "service" ? `/services/${group.slug}` : `/home-services/${group.slug}`;
      return <section className={styles.card} key={group.id}>
        <h2>{hub ? <Link href={hubPath}>{group.name} <span aria-hidden="true"><ArrowIcon /></span></Link> : group.name}</h2>
        {hub?.meta_description && <p>{hub.meta_description}</p>}
        {locals.length > 0 && <><h3>{by === "service" ? "Local service pages" : "Explore local services"}</h3><ul className={styles.chips}>{locals.map(p => <li key={p.id}><Link href={`/${p.primary_location_id}/${p.primary_service_id}`}>{by === "service" ? LOCATIONS.find(l => l.id === p.primary_location_id)?.name : SERVICES.find(s => s.id === p.primary_service_id)?.name}</Link></li>)}</ul></>}
        {problems.length > 0 && <><h3>Common projects and repairs</h3><ul className={styles.problems}>{problems.map(p => <li key={p.id}><Link href={`/services/${p.primary_service_id}/${p.slug}`}>{p.h1}</Link></li>)}</ul></>}
        <Link className={styles.cta} href={requestHref(by === "service" ? {service:group.id} : {location:group.id})}>Request {by === "service" ? group.name.toLowerCase() : "a service"}{by === "town" ? ` in ${group.name}` : ""} <ArrowIcon /></Link>
      </section>;
    })}</div>
  </main>;
}
