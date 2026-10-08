import {AreaDirectory} from "./AreaDirectory";
import { ArrowIcon } from "@/components/ArrowIcon";
import Link from "next/link";
import { SERVICES } from "@config/services";
import { fetchPublishedPages } from "@/lib/authority/query";
import { PageIntro } from "@/components/templates/PageIntro";
import { requestHref } from "@/lib/intake/context";
import type { ContentPageRecord } from "@/lib/authority/types";
import styles from "./ServiceDirectory.module.css";
import template from "@/components/templates/templates.module.css";

export async function ServiceDirectory({by, records}: {by: "service" | "town"; records?: ContentPageRecord[]}) {
  const pages = (records ?? await fetchPublishedPages()).filter(p => p.status === "PUBLISHED");
  if(by === "town") return <AreaDirectory pages={pages}/>;
  return <Services pages={pages.filter(p => p.indexable)}/>;
}
function Services({pages}:{pages:ContentPageRecord[]}){
  const groups = SERVICES;
  return <main className={template.page}>
    <PageIntro eyebrow="A5 home services" title="The right help for your home." description="Browse by service or town, explore common repairs, and send one request to A5. We review the details and forward your request to a local vendor, who discusses the work and scheduling directly with you." />
    <nav className={styles.switcher} aria-label="Browse home services"><Link aria-current="page" href="/services">By service</Link><Link href="/home-services">By town</Link><Link href="/guides">Planning guides</Link></nav>
    <p className={styles.coverage}>Our network serves homeowners across Northern New Jersey. <Link href="/home-services#municipalities">Find your town <ArrowIcon /></Link></p>
    <div className={styles.grid}>{groups.map(group => {
      const hub = pages.find(p => p.page_type === "SERVICE" && p.primary_service_id === group.id);
      const problems = pages.filter(p => p.page_type === "PROBLEM" && p.primary_service_id === group.id);
      const hubPath = `/services/${group.slug}`;
      return <section className={styles.card} key={group.id}>
        <h2>{hub ? <Link href={hubPath}>{group.name} <span aria-hidden="true"><ArrowIcon /></span></Link> : group.name}</h2>
        {hub?.meta_description && <p>{hub.meta_description}</p>}
        {problems.length > 0 && <><h3>Common projects and repairs</h3><ul className={styles.problems}>{problems.map(p => <li key={p.id}><Link href={`/services/${p.primary_service_id}/${p.slug}`}>{p.h1}</Link></li>)}</ul></>}
        <Link className={styles.cta} href={requestHref({service:group.id})}>Request {group.name.toLowerCase()} <ArrowIcon /></Link>
      </section>;
    })}</div>
  </main>;
}
