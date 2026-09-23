/**
 * Canonical path + absolute URL builders (A5-G001).
 * Canonical domain always derives from SITE — never from content records.
 */

import { getLocationById, type LocationId } from "../../../config/locations.ts";
import { getServiceById, type ServiceId } from "../../../config/services.ts";
import { SITE } from "../../../config/site.ts";
import type { ContentPageRecord, ContentPageType } from "./types.ts";

/** Reserved first path segments that must never be treated as location slugs. */
export const RESERVED_ROOT_SEGMENTS = new Set([
  "admin",
  "api",
  "request-service",
  "privacy",
  "terms",
  "services",
  "home-services",
  "guides",
  "cost-guides",
  "compare",
  "projects",
  "favicon.ico",
  "_next",
]);

export function buildContentPath(input: {
  page_type: ContentPageType;
  slug: string;
  primary_service_id?: string | null;
  primary_location_id?: string | null;
  primary_problem_id?: string | null;
  problem_slug?: string | null;
}): string | null {
  const service = input.primary_service_id
    ? getServiceById(input.primary_service_id as ServiceId)
    : undefined;
  const location = input.primary_location_id
    ? getLocationById(input.primary_location_id as LocationId)
    : undefined;

  switch (input.page_type) {
    case "SERVICE":
      if (!service) return null;
      return `/services/${service.slug}`;
    case "LOCATION":
      if (!location) return null;
      return `/home-services/${location.slug}`;
    case "SERVICE_LOCATION":
      if (!service || !location) return null;
      return `/${location.slug}/${service.slug}`;
    case "PROBLEM": {
      if (!service) return null;
      const problemSlug = input.problem_slug ?? input.slug;
      if (!problemSlug) return null;
      return `/services/${service.slug}/${problemSlug}`;
    }
    case "GUIDE":
      return `/guides/${input.slug}`;
    case "COST_GUIDE":
      return `/cost-guides/${input.slug}`;
    case "COMPARISON":
      return `/compare/${input.slug}`;
    case "PROJECT":
      return `/projects/${input.slug}`;
    case "CORE":
      return `/${input.slug}`;
    default:
      return null;
  }
}

export function buildContentPathFromRecord(
  page: Pick<
    ContentPageRecord,
    | "page_type"
    | "slug"
    | "primary_service_id"
    | "primary_location_id"
    | "primary_problem_id"
  >,
  problemSlug?: string | null,
): string | null {
  return buildContentPath({
    page_type: page.page_type,
    slug: page.slug,
    primary_service_id: page.primary_service_id,
    primary_location_id: page.primary_location_id,
    primary_problem_id: page.primary_problem_id,
    problem_slug: problemSlug,
  });
}

/**
 * Absolute canonical URL. Tracking query params are stripped — path only.
 * Domain always comes from SITE.url.
 */
export function buildCanonicalUrl(path: string): string {
  const origin = SITE.url.replace(/\/$/, "");
  const normalized = path.startsWith("/") ? path : `/${path}`;
  // Strip query/hash if a caller accidentally passes them.
  const clean = normalized.split("?")[0]?.split("#")[0] ?? normalized;
  return `${origin}${clean}`;
}

export function isReservedRootSegment(segment: string): boolean {
  return RESERVED_ROOT_SEGMENTS.has(segment.toLowerCase());
}
