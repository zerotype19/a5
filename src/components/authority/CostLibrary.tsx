import Link from "next/link";
import {SERVICE_PRESENTATION} from "@/lib/home-services";
import { SERVICES } from "@config/services";
import { PageIntro } from "@/components/templates/PageIntro";
import { ArrowIcon } from "@/components/ArrowIcon";
import type {ContentPageRecord} from "@/lib/authority/types";
import styles from "@/components/templates/templates.module.css";
export function CostLibrary({pages}: {pages:ContentPageRecord[]}) {
  const faq = pages.find(page => page.slug === "home-service-estimates-faq");
  return <main className={styles.page}>
    <PageIntro eyebrow="Costs & planning" title="Know what goes into the price."
      description="Explore typical costs and learn what to ask before you hire. Choose your service below." />
    <p style={{maxWidth:"70ch", marginBottom:"2rem"}}>Published national ranges help you plan. Your independent professional confirms the scope and price for your home.</p>
    {faq && <p style={{marginBottom:"2rem"}}><Link href={`/cost-guides/${faq.slug}`}>Start here: understand fees, materials and estimates <ArrowIcon /></Link></p>}
    <ul className={styles.collection}>{SERVICES.flatMap(service => {
      const page = pages.find(item => item.primary_service_id === service.id);
      return page ? [<li key={page.id}><Link href={`/cost-guides/${page.slug}`} className={styles.card}>
        <h2>{service.name}</h2><p>{SERVICE_PRESENTATION[service.id].jobs.join(" · ")}</p>
        <span>Explore costs and estimates <ArrowIcon /></span>
      </Link></li>] : [];
    })}</ul>
  </main>;
}
