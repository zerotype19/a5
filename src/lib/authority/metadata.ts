/**
 * Metadata engine (A5-G001) — Next.js Metadata from content + SITE.
 */

import type { Metadata } from "next";
import { SITE } from "../../../config/site.ts";
import { buildCanonicalUrl } from "./urls.ts";
import { robotsForPublicPage } from "./validate.ts";
import type { ContentPageRecord } from "./types.ts";

export type ContentMetadataInput = {
  page: Pick<
    ContentPageRecord,
    | "title"
    | "meta_title"
    | "meta_description"
    | "status"
    | "indexable"
    | "h1"
  >;
  path: string;
};

export function buildContentMetadata(input: ContentMetadataInput): Metadata {
  const title = (input.page.meta_title?.trim() || input.page.title).replace(/(?:\s*[|–—-]\s*A5(?: Home Services)?)+$/i, "").trim();
  const service = input.path.match(/^\/services\/([a-z-]+)/)?.[1];
  const image = ["handyman","masonry","landscaping","painting","drywall","tile","plumbing","electrical"].includes(service ?? "") ? `/images/${service}.webp` : "/images/hero.webp";
  const description =
    input.page.meta_description?.trim() ||
    `${input.page.title} — ${SITE.name}`;
  const canonical = buildCanonicalUrl(input.path);
  const robots = robotsForPublicPage(input.page);

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: SITE.name,
      locale: "en_US",
      images: [{url:image,width:1440,height:960}],
    },
    twitter: {card:"summary_large_image",title,description,images:[image]},
    robots: {
      index: robots.index,
      follow: robots.follow,
    },
  };
}
