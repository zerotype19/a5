/**
 * Structured data builders (A5-G001).
 * Truthful schema only — no invented address, ratings, reviews, or hours.
 */

import { getServiceById, type ServiceId } from "../../../config/services.ts";
import { SITE } from "../../../config/site.ts";
import type { BreadcrumbItem } from "./types.ts";
import { absoluteBreadcrumbList } from "./breadcrumbs.ts";
import { buildCanonicalUrl } from "./urls.ts";

export type JsonLd = Record<string, unknown>;

/** Escape/serialize content strings safely for JSON-LD script tags. */
export function serializeJsonLd(data: JsonLd | JsonLd[]): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

export function buildOrganizationSchema(): JsonLd {
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

/**
 * LocalBusiness only with facts A5 can truthfully represent.
 * Does NOT invent street address, ratings, review count, opening hours, or price range.
 */
export function buildLocalBusinessSchema(): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE.name,
    url: SITE.url,
    email: SITE.email,
    telephone: SITE.phone,
    areaServed: SITE.serviceAreaSummary,
  };
}

export function buildServiceSchema(input: {
  serviceId: string;
  path: string;
  description?: string | null;
}): JsonLd | null {
  const service = getServiceById(input.serviceId as ServiceId);
  if (!service) return null;
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.name,
    serviceType: service.name,
    provider: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    areaServed: SITE.serviceAreaSummary,
    url: buildCanonicalUrl(input.path),
    ...(input.description
      ? { description: input.description }
      : {}),
  };
}

export function buildArticleSchema(input: {
  title: string;
  description?: string | null;
  path: string;
  dateModified?: string | null;
  datePublished?: string | null;
}): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    ...(input.description ? { description: input.description } : {}),
    mainEntityOfPage: buildCanonicalUrl(input.path),
    author: {
      "@type": "Organization",
      name: SITE.name,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: SITE.url,
    },
    ...(input.datePublished ? { datePublished: input.datePublished } : {}),
    ...(input.dateModified ? { dateModified: input.dateModified } : {}),
  };
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]): JsonLd {
  const absolute = absoluteBreadcrumbList(items);
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: absolute.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

/** Guard: schema must never invent ratings/reviews/street address. */
export function schemaContainsForbiddenClaims(schema: JsonLd): string[] {
  const forbidden = [
    "aggregateRating",
    "review",
    "streetAddress",
    "postalCode",
    "ratingValue",
    "reviewCount",
    "openingHours",
    "priceRange",
  ];
  const found: string[] = [];
  const raw = JSON.stringify(schema);
  for (const key of forbidden) {
    if (raw.includes(`"${key}"`)) {
      found.push(key);
    }
  }
  return found;
}
