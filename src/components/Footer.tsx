import { Brand } from "./Brand";
import Link from "next/link";
import {COUNTIES, countyPath} from "@config/counties";
import { SERVICES } from "@config/services";
import { SITE } from "@config/site";
import { phoneTelHref } from "@/lib/phone";
import styles from "./Footer.module.css";

export function Footer() {
  return <footer className={styles.footer}>
    <div className={styles.inner}>
      <div className={styles.brandCol}>
        <Brand inverse />
        <p className={styles.blurb}>Home services, made easier.</p>
        <p className={styles.description}>One place to request the home services you need, with preferred vendors across {SITE.serviceAreaSummary}.</p>
        <a className={styles.phone} href={phoneTelHref(SITE.phone)} data-cta="footer-phone">{SITE.phone}</a>
        <a className={styles.email} href={`mailto:${SITE.email}`} data-cta="footer-email">{SITE.email}</a>
      </div>
      <nav aria-label="Footer services"><h2 className={styles.heading}>Services</h2><ul className={styles.list}>
        {SERVICES.map(service => <li key={service.id}><Link href={`/services/${service.slug}`}>{service.name}</Link></li>)}
      </ul></nav>
      <nav aria-label="Footer service areas"><h2 className={styles.heading}>Service areas</h2><ul className={styles.list}>
        {COUNTIES.map(location => <li key={location.id}><Link href={countyPath(location)}>{location.name}</Link></li>)}
        <li><Link href="/home-services">Find your town</Link></li>
      </ul></nav>
      <nav aria-label="Footer resources"><h2 className={styles.heading}>About A5</h2><ul className={styles.list}>
        <li><Link href="/services">All services</Link></li><li><Link href="/home-services">All service areas</Link></li><li><Link href="/about">About A5</Link></li>
        <li><Link href="/#how-it-works">How it works</Link></li>
        <li><Link href="/guides">Homeowner guides</Link></li>
        <li><Link href="/request-service">Request service</Link></li>
      </ul></nav>
    </div>
    <div className={styles.bottom}>
      <p className={styles.role}>A5 coordinates introductions. Providers discuss estimates and carry out the work. Availability is confirmed after review.</p>
      <div className={styles.legalRow}><p>© {new Date().getFullYear()} {SITE.legalName}</p><nav aria-label="Legal"><Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link></nav></div>
    </div>
  </footer>;
}
