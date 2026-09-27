/**
 * Authority page engine entry — resolve route → load PUBLISHED page → hydrate.
 */

import {
  fetchProblemBySlug,
  fetchProblemServiceIds,
  fetchPublishedPageByQuery,
  hydratePublicContentPage,
} from "./query.ts";
import {
  pageMatchesRoute,
  resolveLocationRoute,
  resolveProblemRoute,
  resolveServiceLocationRoute,
  resolveServiceRoute,
  resolveSlugTypeRoute,
} from "./resolve.ts";
import type { PublicContentPage } from "./types.ts";

export type EngineResult =
  | { status: "ok"; page: PublicContentPage }
  | { status: "not_found"; reason: string };

async function loadPublished(
  filter: Parameters<typeof fetchPublishedPageByQuery>[0],
): Promise<EngineResult> {
  const page = await fetchPublishedPageByQuery(filter);
  if (!page) {
    return { status: "not_found", reason: "no_published_content" };
  }
  const hydrated = await hydratePublicContentPage(page);
  return { status: "ok", page: hydrated };
}

export async function loadServicePage(
  serviceSlug: string,
): Promise<EngineResult> {
  const route = resolveServiceRoute(serviceSlug);
  if (!route.ok) return { status: "not_found", reason: route.reason };
  return loadPublished({
    page_type: "SERVICE",
    primary_service_id: route.serviceSlug,
  });
}

export async function loadLocationPage(
  locationSlug: string,
): Promise<EngineResult> {
  const route = resolveLocationRoute(locationSlug);
  if (!route.ok) return { status: "not_found", reason: route.reason };
  return loadPublished({
    page_type: "LOCATION",
    primary_location_id: route.locationSlug,
  });
}

export async function loadServiceLocationPage(
  locationSlug: string,
  serviceSlug: string,
): Promise<EngineResult> {
  const route = resolveServiceLocationRoute(locationSlug, serviceSlug);
  if (!route.ok) return { status: "not_found", reason: route.reason };
  return loadPublished({
    page_type: "SERVICE_LOCATION",
    primary_service_id: route.serviceSlug,
    primary_location_id: route.locationSlug,
  });
}

export async function loadProblemPage(
  serviceSlug: string,
  problemSlug: string,
): Promise<EngineResult> {
  const route = resolveProblemRoute(serviceSlug, problemSlug);
  if (!route.ok) return { status: "not_found", reason: route.reason };

  const problem = await fetchProblemBySlug(problemSlug);
  if (!problem) {
    return { status: "not_found", reason: "unknown_problem" };
  }

  const relatedServices = await fetchProblemServiceIds(problem.id);
  if (!relatedServices.includes(serviceSlug)) {
    return { status: "not_found", reason: "invalid_service_problem_combination" };
  }

  const page = await fetchPublishedPageByQuery({
    page_type: "PROBLEM",
    slug: problemSlug,
    primary_problem_id: problem.id,
  });
  if (!page) {
    return { status: "not_found", reason: "no_published_content" };
  }

  if (
    !pageMatchesRoute(page, route, { problemServiceIds: relatedServices })
  ) {
    return { status: "not_found", reason: "route_mismatch" };
  }

  const hydrated = await hydratePublicContentPage(page);
  return { status: "ok", page: hydrated };
}

export async function loadGuidePage(slug: string): Promise<EngineResult> {
  const route = resolveSlugTypeRoute("GUIDE", slug);
  if (!route.ok) return { status: "not_found", reason: route.reason };
  return loadPublished({ page_type: "GUIDE", slug });
}

export async function loadCostGuidePage(slug: string): Promise<EngineResult> {
  const route = resolveSlugTypeRoute("COST_GUIDE", slug);
  if (!route.ok) return { status: "not_found", reason: route.reason };
  return loadPublished({ page_type: "COST_GUIDE", slug });
}

export async function loadComparisonPage(slug: string): Promise<EngineResult> {
  const route = resolveSlugTypeRoute("COMPARISON", slug);
  if (!route.ok) return { status: "not_found", reason: route.reason };
  return loadPublished({ page_type: "COMPARISON", slug });
}

export async function loadProjectPage(slug: string): Promise<EngineResult> {
  const route = resolveSlugTypeRoute("PROJECT", slug);
  if (!route.ok) return { status: "not_found", reason: route.reason };
  const result = await loadPublished({ page_type: "PROJECT", slug });
  if (result.status !== "ok") return result;
  if (!result.page.public_project_approved) {
    return { status: "not_found", reason: "public_project_not_approved" };
  }
  return result;
}
