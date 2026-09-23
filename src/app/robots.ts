import type { MetadataRoute } from "next";
import { SITE } from "@config/site";

/**
 * Do not intentionally block legitimate search/AI crawlers (G001).
 * Admin remains disallowed. Draft/preview are unavailable via app authz, not robots.
 */
export default function robots(): MetadataRoute.Robots {
  const origin = SITE.url.replace(/\/$/, "");
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
