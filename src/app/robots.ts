import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { SITE } from "@config/site";

/**
 * Do not intentionally block legitimate search/AI crawlers on the canonical host (G001).
 * Admin remains disallowed. Any other host, including a workers.dev hostname, is disallowed
 * so it cannot become a second indexable copy of the site.
 */
export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const origin = SITE.url.replace(/\/$/, "");
  const headerList = await headers();
  const host =
    headerList.get("x-forwarded-host") ?? headerList.get("host") ?? "";
  const hostname = host.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
  const canonicalHost = new URL(SITE.url).hostname.toLowerCase();

  if (hostname !== canonicalHost) {
    return {
      rules: [{ userAgent: "*", disallow: "/" }],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/admin/", "/api/", "/api"],
      },
    ],
    sitemap: `${origin}/sitemap.xml`,
    host: origin,
  };
}
