import type { MetadataRoute } from "next";
import { fetchPublishedPages } from "@/lib/authority/query";
import { buildSitemapEntries } from "@/lib/authority/sitemap";

/** Always derive from live PUBLISHED+indexable records — never a stale build snapshot. */
export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const pages = await fetchPublishedPages();
  // Problem pages need problem slug for path — use page.slug for PROBLEM type.
  return buildSitemapEntries(
    pages.map((page) => ({
      ...page,
      problem_slug:
        page.page_type === "PROBLEM" ? page.slug : undefined,
    })),
  );
}
