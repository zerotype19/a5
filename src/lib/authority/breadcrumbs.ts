/**
 * Breadcrumb engine (A5-G001) — visible trail + schema inputs.
 */

import { getLocationById, type LocationId } from "../../../config/locations.ts";
import { getServiceById, type ServiceId } from "../../../config/services.ts";
import { SITE } from "../../../config/site.ts";
import type { BreadcrumbItem, ContentPageRecord } from "./types.ts";
import { buildContentPathFromRecord } from "./urls.ts";

export function buildBreadcrumbs(
  page: Pick<
    ContentPageRecord,
    | "page_type"
    | "title"
    | "slug"
    | "primary_service_id"
    | "primary_location_id"
    | "primary_problem_id"
  >,
  options?: { problemSlug?: string | null; problemName?: string | null },
): BreadcrumbItem[] {
  const crumbs: BreadcrumbItem[] = [{ name: "Home", path: "/" }];
  const service = page.primary_service_id
    ? getServiceById(page.primary_service_id as ServiceId)
    : undefined;
  const location = page.primary_location_id
    ? getLocationById(page.primary_location_id as LocationId)
    : undefined;
  const selfPath =
    buildContentPathFromRecord(page, options?.problemSlug) ?? `/${page.slug}`;

  switch (page.page_type) {
    case "SERVICE":
      crumbs.push({ name: "Services", path: "/#services" });
      crumbs.push({ name: page.title, path: selfPath });
      break;
    case "LOCATION":
      crumbs.push({ name: "Areas", path: "/#areas" });
      crumbs.push({ name: page.title, path: selfPath });
      break;
    case "SERVICE_LOCATION":
      if (location) {
        crumbs.push({
          name: `${location.name}, ${location.state}`,
          path: `/home-services/${location.slug}`,
        });
      }
      crumbs.push({ name: page.title, path: selfPath });
      break;
    case "PROBLEM":
      if (service) {
        crumbs.push({
          name: service.name,
          path: `/services/${service.slug}`,
        });
      }
      crumbs.push({
        name: options?.problemName ?? page.title,
        path: selfPath,
      });
      break;
    case "GUIDE":
      crumbs.push({ name: "Guides", path: "/guides" });
      crumbs.push({ name: page.title, path: selfPath });
      break;
    case "COST_GUIDE":
      crumbs.push({ name: "Cost guides", path: "/cost-guides" });
      crumbs.push({ name: page.title, path: selfPath });
      break;
    case "COMPARISON":
      crumbs.push({ name: "Compare", path: "/compare" });
      crumbs.push({ name: page.title, path: selfPath });
      break;
    case "PROJECT":
      crumbs.push({ name: "Projects", path: "/projects" });
      crumbs.push({ name: page.title, path: selfPath });
      break;
    default:
      crumbs.push({ name: page.title, path: selfPath });
  }

  return crumbs;
}

export function absoluteBreadcrumbList(items: BreadcrumbItem[]) {
  const origin = SITE.url.replace(/\/$/, "");
  return items.map((item) => ({
    name: item.name,
    item: item.path === "/" ? `${origin}/` : `${origin}${item.path}`,
  }));
}
