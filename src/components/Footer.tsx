import Link from "next/link";
import { LOCATIONS } from "@config/locations";
import { SERVICES } from "@config/services";
import { SITE } from "@config/site";
import { phoneTelHref } from "@/lib/phone";
import styles from "./Footer.module.css";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brandCol}>
          <p className={styles.brand}>{SITE.name}</p>
          <p className={styles.blurb}>
            Local home-service coordination for homeowners across{" "}
            {SITE.serviceAreaSummary}.
          </p>
          <p>
            <a href={phoneTelHref(SITE.phone)} data-cta="footer-phone">
              {SITE.phone}
            </a>
          </p>
          <p>
            <a href={`mailto:${SITE.email}`} data-cta="footer-email">
              {SITE.email}
            </a>
          </p>
        </div>

        <div>
          <p className={styles.heading}>Explore</p>
          <ul className={styles.list}>
            <li>
              <Link href="/#services">Services</Link>
            </li>
            <li>
              <Link href="/#areas">Areas We Serve</Link>
            </li>
            <li>
              <Link href="/#how-it-works">How It Works</Link>
            </li>
            <li>
              <Link href="/request-service">Request Service</Link>
            </li>
          </ul>
        </div>

        <div>
          <p className={styles.heading}>Services</p>
          <ul className={styles.list}>
            {SERVICES.map((service) => (
              <li key={service.id}>
                <Link href="/#services">{service.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <p className={styles.heading}>Areas</p>
          <ul className={styles.list}>
            {LOCATIONS.map((location) => (
              <li key={location.id}>
                <Link href="/#areas">
                  {location.name}, {location.state}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className={styles.bottom}>
        <p>
          © {year} {SITE.legalName}
        </p>
        <p className={styles.legal}>
          <Link href="/privacy">Privacy</Link>
          <span aria-hidden="true"> · </span>
          <Link href="/terms">Terms</Link>
        </p>
      </div>
    </footer>
  );
}
