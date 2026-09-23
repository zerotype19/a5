/**
 * Content page resolver — page_type → route match (A5-G001).
 * One controlled resolver; routes only resolve valid combinations.
 */

import { getLocationBySlug } from "../../../config/locations.ts";
import { getServiceBySlug } from "../../../config/services.ts";
import type { ContentPageRecord, ContentPageType } from "./types.ts";
import { isReservedRootSegment } from "./urls.ts";

export type RouteResolution =
  | {
      ok: true;
      page_type: ContentPageType;
      serviceSlug?: string;
      locationSlug?: string;
      problemSlug?: string;
      slug?: string;
    }
  | { ok: false; reason: string };

export function resolveServiceRoute(serviceSlug: string): RouteResolution {
  const service = getServiceBySlug(serviceSlug);
  if (!service) {
    return { ok: false, reason: "unknown_service" };
  }
  return { ok: true, page_type: "SERVICE", serviceSlug: service.slug };
}

export function resolveLocationRoute(locationSlug: string): RouteResolution {
  const location = getLocationBySlug(locationSlug);
  if (!location) {
    return { ok: false, reason: "unknown_location" };
  }
  return { ok: true, page_type: "LOCATION", locationSlug: location.slug };
}

export function resolveServiceLocationRoute(
  locationSlug: string,
  serviceSlug: string,
): RouteResolution {
  if (isReservedRootSegment(locationSlug)) {
    return { ok: false, reason: "reserved_segment" };
  }
  const location = getLocationBySlug(locationSlug);
  const service = getServiceBySlug(serviceSlug);
  if (!location || !service) {
    return { ok: false, reason: "invalid_entity_combination" };
  }
  return {
    ok: true,
    page_type: "SERVICE_LOCATION",
    locationSlug: location.slug,
    serviceSlug: service.slug,
  };
}

export function resolveProblemRoute(
  serviceSlug: string,
  problemSlug: string,
): RouteResolution {
  const service = getServiceBySlug(serviceSlug);
  if (!service) {
    return { ok: false, reason: "unknown_service" };
  }
  return {
    ok: true,
    page_type: "PROBLEM",
    serviceSlug: service.slug,
    problemSlug,
  };
}

export function resolveSlugTypeRoute(
  pageType: Extract<
    ContentPageType,
    "GUIDE" | "COST_GUIDE" | "COMPARISON" | "PROJECT"
  >,
  slug: string,
): RouteResolution {
  if (!slug) {
    return { ok: false, reason: "missing_slug" };
  }
  return { ok: true, page_type: pageType, slug };
}

/** Match a content record to a resolved route (entity/slug equality). */
export function pageMatchesRoute(
  page: ContentPageRecord,
  route: Extract<RouteResolution, { ok: true }>,
  options?: { problemServiceIds?: string[] },
): boolean {
  if (page.page_type !== route.page_type) return false;

  switch (route.page_type) {
    case "SERVICE":
      return page.primary_service_id === route.serviceSlug;
    case "LOCATION":
      return page.primary_location_id === route.locationSlug;
    case "SERVICE_LOCATION":
      return (
        page.primary_service_id === route.serviceSlug &&
        page.primary_location_id === route.locationSlug
      );
    case "PROBLEM": {
      if (page.slug !== route.problemSlug) return false;
      if (page.primary_service_id !== route.serviceSlug) {
        // Allow if problem relates to service via problem_services
        const related = options?.problemServiceIds ?? [];
        if (!related.includes(route.serviceSlug!)) return false;
      }
      return true;
    }
    case "GUIDE":
    case "COST_GUIDE":
    case "COMPARISON":
    case "PROJECT":
      return page.slug === route.slug;
    default:
      return false;
  }
}
