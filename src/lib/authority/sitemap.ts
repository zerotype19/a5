/**
 * Sitemap engine (A5-G001).
 * Source of truth: approved core routes + PUBLISHED AND indexable content.
 */

import type { MetadataRoute } from "next";
import { SITE } from "../../../config/site.ts";
import { isSitemapEligible } from "./validate.ts";
import type { ContentPageRecord } from "./types.ts";
import { buildCanonicalUrl, buildContentPathFromRecord } from "./urls.ts";

/** Approved core public routes that belong in the sitemap. */
export const CORE_SITEMAP_ROUTES = [
  { path: "/", changeFrequency: "weekly" as const, priority: 1 },
  {
    path: "/request-service",
    changeFrequency: "monthly" as const,
    priority: 0.9,
  },
] as const;

/** Explicitly excluded from sitemap regardless of status. */
export const SITEMAP_EXCLUSIONS = [
  "/admin",
  "/privacy",
  "/terms",
  "/api",
] as const;

export type SitemapContentInput = Pick<
  ContentPageRecord,
  | "status"
  | "indexable"
  | "page_type"
  | "slug"
  | "primary_service_id"
  | "primary_location_id"
  | "primary_problem_id"
  | "updated_at"
> & { problem_slug?: string | null };

export function buildSitemapEntries(
  contentPages: SitemapContentInput[],
): MetadataRoute.Sitemap {
  const origin = SITE.url.replace(/\/$/, "");
  const entries: MetadataRoute.Sitemap = CORE_SITEMAP_ROUTES.map((route) => ({
    url: route.path === "/" ? `${origin}/` : buildCanonicalUrl(route.path),
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  for (const page of contentPages) {
    if (!isSitemapEligible(page)) continue;
    if (page.page_type === "CORE") continue;
    const path = buildContentPathFromRecord(page, page.problem_slug);
    if (!path) continue;
    if (
      SITEMAP_EXCLUSIONS.some(
        (ex) => path === ex || path.startsWith(`${ex}/`),
      )
    ) {
      continue;
    }
    entries.push({
      url: buildCanonicalUrl(path),
      lastModified: page.updated_at ? new Date(page.updated_at) : undefined,
      changeFrequency: "monthly",
      priority: 0.7,
    });
  }

  return entries;
}
