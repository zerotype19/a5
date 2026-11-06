import Link from "next/link";
import {PageIntro} from "@/components/templates/PageIntro";
import {ArrowIcon} from "@/components/ArrowIcon";
import {buildCostLibraryGroups} from "@/lib/authority/cost-library";
import {buildContentPathFromRecord} from "@/lib/authority/urls";
import type {ContentPageRecord} from "@/lib/authority/types";
import styles from "@/components/templates/templates.module.css";
import library from "./CostLibrary.module.css";

export function CostLibrary({pages}: {pages: ContentPageRecord[]}) {
  const groups = buildCostLibraryGroups(pages);
  const planning = pages.filter(p => p.status === "PUBLISHED" && p.indexable &&
    ((p.page_type === "COST_GUIDE" && p.slug === "home-service-estimates-faq") ||
    (p.page_type === "GUIDE" && ["compare-home-service-estimates", "home-maintenance-budget-priorities"].includes(p.slug))));
  return <main className={styles.page}>
    <PageIntro eyebrow="Costs & planning" title="Plan the job. Understand the price."
      description="Start with your service, then explore the job you have in mind. Find price references, estimate checklists and practical ways to prepare." />
    <p className={library.note}>Published national ranges are planning references, not local quotes. Your independent professional confirms the scope and price for your home.</p>
    <nav className={library.jump} aria-label="Choose a service cost category">{groups.map(({service}) => <Link key={service.id} href={`#${service.id}`}>{service.name}</Link>)}</nav>
    {planning.length > 0 && <section className={library.section} aria-labelledby="estimate-help"><h2 id="estimate-help">Make a confident plan</h2><ul className={styles.collection}>{planning.map(page => <li key={page.id}><Link className={styles.card} href={buildContentPathFromRecord(page)!}><h3>{page.h1}</h3><p>{page.meta_description}</p><span>Read the guide <ArrowIcon /></span></Link></li>)}</ul></section>}
    {groups.map(({service, pages: guides}) => <section key={service.id} className={library.section} aria-labelledby={service.id}>
      <h2 id={service.id}>{service.name}</h2>
      <ul className={styles.collection}>{guides.map(page => <li key={page.id}><Link href={`/cost-guides/${page.slug}`} className={styles.card}>
        <h3>{page.h1}</h3>{page.meta_description && <p>{page.meta_description}</p>}
        <span>{page.slug === `${service.slug}-cost` ? "See price references" : "Plan this project"} <ArrowIcon /></span>
      </Link></li>)}</ul>
      <p className={library.service}><Link href={`/services/${service.slug}`}>Explore {service.name.toLowerCase()} <ArrowIcon /></Link></p>
    </section>)}
  </main>;
}
