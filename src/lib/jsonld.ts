import { SITE } from "@config/site";

/** Truthful Organization JSON-LD only — no LocalBusiness address/reviews. */
export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE.name,
    legalName: SITE.legalName,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phone,
    areaServed: SITE.serviceAreaSummary,
  };
}
