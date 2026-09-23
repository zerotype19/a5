/**
 * Related-content / internal linking helpers (A5-G001).
 * Links derive from explicit relationships — only to publicly readable targets.
 */

import type {
  ContentPageRecord,
  ContentRelationship,
  ContentRelationshipType,
} from "./types.ts";
import { buildContentPathFromRecord } from "./urls.ts";
import { isPubliclyReadable } from "./validate.ts";

export type RelatedContentLink = {
  id: string;
  slug: string;
  page_type: ContentPageRecord["page_type"];
  title: string;
  path: string;
  relationship_type: ContentRelationshipType;
};

export function resolveRelatedContent(input: {
  fromPageId: string;
  relationships: ContentRelationship[];
  pagesById: Map<string, ContentPageRecord>;
  problemSlugById?: Map<string, string>;
  /** When true, only include PUBLISHED targets (public rendering). */
  publicOnly?: boolean;
}): RelatedContentLink[] {
  const publicOnly = input.publicOnly ?? true;
  const links: RelatedContentLink[] = [];

  for (const rel of input.relationships) {
    if (rel.from_page_id !== input.fromPageId) continue;
    const target = input.pagesById.get(rel.to_page_id);
    if (!target) continue;
    if (publicOnly && !isPubliclyReadable(target)) continue;
    const problemSlug = target.primary_problem_id
      ? input.problemSlugById?.get(target.primary_problem_id)
      : undefined;
    const path = buildContentPathFromRecord(target, problemSlug);
    if (!path) continue;
    links.push({
      id: target.id,
      slug: target.slug,
      page_type: target.page_type,
      title: target.title,
      path,
      relationship_type: rel.relationship_type,
    });
  }

  return links;
}

/**
 * Orphan detection: PUBLISHED + indexable pages with no inbound relationship
 * from another eligible page. Does not auto-publish or auto-link.
 */
export function findOrphanIndexablePages(input: {
  pages: ContentPageRecord[];
  relationships: ContentRelationship[];
}): ContentPageRecord[] {
  const eligible = input.pages.filter(
    (p) => p.status === "PUBLISHED" && p.indexable,
  );
  const eligibleIds = new Set(eligible.map((p) => p.id));
  const inbound = new Set<string>();
  for (const rel of input.relationships) {
    if (eligibleIds.has(rel.from_page_id) && eligibleIds.has(rel.to_page_id)) {
      inbound.add(rel.to_page_id);
    }
  }
  return eligible.filter((p) => !inbound.has(p.id));
}
