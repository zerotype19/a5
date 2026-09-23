/**
 * Canonical A5 business / site identity.
 * Fill owner-confirmed fields only — do not invent phone, address, or legal details.
 */

export const SITE = {
  name: "A5 Home Services",
  legalName: "A5 Home Services",
  domain: "www.a5homeservices.com",
  url: "https://www.a5homeservices.com/",
  /** Owner-confirmed 2026-09-23. */
  phone: "(973) 437-5517",
  /** Owner-confirmed 2026-09-23. */
  email: "hello@a5homeservices.com",
  /** Service area summary derived from approved location registry. */
  serviceAreaSummary: "Northern New Jersey",
  locale: "en-US",
  defaultOgImage: "",
} as const;

export type SiteConfig = typeof SITE;
