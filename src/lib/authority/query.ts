/**
 * Public content data access (A5-G001).
 * Uses anon key + RLS — never service-role for public reads.
 * Never queries customers, leads, notes, photos, or admin_users.
 */

import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type {
  ContentPageRecord,
  ContentRelationship,
  ContentSection,
  ContentSourceRelationshipType,
  ProblemRecord,
  PublicContentPage,
  SourceRecord,
  SourceType,
  ContentPageType,
  ContentStatus,
  ContentRelationshipType,
} from "./types.ts";
import { resolveRelatedContent } from "./linking.ts";
import { AUTHORITY_FORBIDDEN_TABLES } from "./privacy.ts";
import { isPubliclyReadable } from "./validate.ts";

/** Tables the public authority query layer may touch. */
export const AUTHORITY_PUBLIC_TABLES = [
  "content_pages",
  "problems",
  "problem_services",
  "sources",
  "content_sources",
  "content_relationships",
] as const;

/** Guard used by tests — public layer must never name operational tables. */
export function isAuthorityPublicTable(table: string): boolean {
  return (AUTHORITY_PUBLIC_TABLES as readonly string[]).includes(table);
}

export function assertAuthorityQueryIsPublic(table: string): void {
  if ((AUTHORITY_FORBIDDEN_TABLES as readonly string[]).includes(table)) {
    throw new Error(`authority_forbidden_table:${table}`);
  }
  if (!isAuthorityPublicTable(table)) {
    throw new Error(`authority_unknown_table:${table}`);
  }
}

function getAnonClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) return null;
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

type ContentPageRow = Omit<ContentPageRecord, "sections"> & {
  sections: unknown;
};

function parseSections(raw: unknown): ContentSection[] {
  if (!Array.isArray(raw)) return [];
  return raw as ContentSection[];
}

function mapPage(row: ContentPageRow): ContentPageRecord {
  return {
    ...row,
    page_type: row.page_type as ContentPageType,
    status: row.status as ContentStatus,
    sections: parseSections(row.sections),
  };
}

export async function fetchPublishedPages(): Promise<ContentPageRecord[]> {
  const client = getAnonClient();
  if (!client) return [];
  const { data, error } = await client
    .from("content_pages")
    .select("*")
    .eq("status", "PUBLISHED");
  if (error || !data) return [];
  return (data as ContentPageRow[]).map(mapPage);
}

export async function fetchPublishedPageByQuery(filter: {
  page_type: ContentPageType;
  slug?: string;
  primary_service_id?: string;
  primary_location_id?: string;
  primary_problem_id?: string;
}): Promise<ContentPageRecord | null> {
  const client = getAnonClient();
  if (!client) return null;

  let query = client
    .from("content_pages")
    .select("*")
    .eq("status", "PUBLISHED")
    .eq("page_type", filter.page_type)
    .limit(1);

  if (filter.slug) query = query.eq("slug", filter.slug);
  if (filter.primary_service_id) {
    query = query.eq("primary_service_id", filter.primary_service_id);
  }
  if (filter.primary_location_id) {
    query = query.eq("primary_location_id", filter.primary_location_id);
  }
  if (filter.primary_problem_id) {
    query = query.eq("primary_problem_id", filter.primary_problem_id);
  }

  const { data, error } = await query.maybeSingle();
  if (error || !data) return null;
  const page = mapPage(data as ContentPageRow);
  if (!isPubliclyReadable(page)) return null;
  return page;
}

export async function fetchProblemBySlug(
  slug: string,
): Promise<ProblemRecord | null> {
  const client = getAnonClient();
  if (!client) return null;
  const { data, error } = await client
    .from("problems")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as ProblemRecord;
}

export async function fetchProblemServiceIds(
  problemId: string,
): Promise<string[]> {
  const client = getAnonClient();
  if (!client) return [];
  const { data, error } = await client
    .from("problem_services")
    .select("service_id")
    .eq("problem_id", problemId);
  if (error || !data) return [];
  return data.map((row: { service_id: string }) => row.service_id);
}

export async function hydratePublicContentPage(
  page: ContentPageRecord,
): Promise<PublicContentPage> {
  const client = getAnonClient();
  const related_service_ids: string[] = [];
  const related_location_ids: string[] = [];
  const related_problem_ids: string[] = [];
  let problem: ProblemRecord | null = null;
  let sources: PublicContentPage["sources"] = [];
  let related_content: PublicContentPage["related_content"] = [];

  if (page.primary_service_id) related_service_ids.push(page.primary_service_id);
  if (page.primary_location_id) {
    related_location_ids.push(page.primary_location_id);
  }
  if (page.primary_problem_id) {
    related_problem_ids.push(page.primary_problem_id);
  }

  if (client) {
    if (page.primary_problem_id) {
      const { data: problemRow } = await client
        .from("problems")
        .select("*")
        .eq("id", page.primary_problem_id)
        .maybeSingle();
      if (problemRow) problem = problemRow as ProblemRecord;

      const serviceIds = await fetchProblemServiceIds(page.primary_problem_id);
      for (const id of serviceIds) {
        if (!related_service_ids.includes(id)) related_service_ids.push(id);
      }
    }

    const { data: sourceLinks } = await client
      .from("content_sources")
      .select("source_id, relationship_type, sources(*)")
      .eq("content_page_id", page.id);

    if (sourceLinks) {
      sources = sourceLinks
        .map(
          (row: {
            source_id: string;
            relationship_type: string;
            sources: SourceRecord | SourceRecord[] | null;
          }) => {
            const src = Array.isArray(row.sources)
              ? row.sources[0]
              : row.sources;
            if (!src) return null;
            return {
              ...src,
              source_type: src.source_type as SourceType,
              relationship_type:
                row.relationship_type as ContentSourceRelationshipType,
            };
          },
        )
        .filter(Boolean) as PublicContentPage["sources"];
    }

    const { data: rels } = await client
      .from("content_relationships")
      .select("*")
      .eq("from_page_id", page.id);

    if (rels && rels.length > 0) {
      const toIds = rels.map((r: ContentRelationship) => r.to_page_id);
      const { data: targets } = await client
        .from("content_pages")
        .select("*")
        .in("id", toIds)
        .eq("status", "PUBLISHED");

      const pagesById = new Map<string, ContentPageRecord>();
      for (const row of (targets ?? []) as ContentPageRow[]) {
        pagesById.set(row.id, mapPage(row));
      }

      const problemIds = [...pagesById.values()]
        .map((p) => p.primary_problem_id)
        .filter(Boolean) as string[];
      const problemSlugById = new Map<string, string>();
      if (problemIds.length > 0) {
        const { data: problems } = await client
          .from("problems")
          .select("id, slug")
          .in("id", problemIds);
        for (const p of problems ?? []) {
          problemSlugById.set(p.id, p.slug);
        }
      }

      related_content = resolveRelatedContent({
        fromPageId: page.id,
        relationships: (rels as ContentRelationship[]).map((r) => ({
          ...r,
          relationship_type: r.relationship_type as ContentRelationshipType,
        })),
        pagesById,
        problemSlugById,
        publicOnly: true,
      });
    }
  }

  return {
    ...page,
    related_service_ids,
    related_location_ids,
    related_problem_ids,
    related_content,
    sources,
    problem,
  };
}

/** Test/helper: hydrate from in-memory graphs without Supabase. */
export function hydrateFromMemory(input: {
  page: ContentPageRecord;
  pages: ContentPageRecord[];
  relationships: ContentRelationship[];
  problems: ProblemRecord[];
  problemServices: Array<{ problem_id: string; service_id: string }>;
  sources: SourceRecord[];
  contentSources: Array<{
    content_page_id: string;
    source_id: string;
    relationship_type: ContentSourceRelationshipType;
  }>;
}): PublicContentPage {
  const pagesById = new Map(input.pages.map((p) => [p.id, p]));
  const problemSlugById = new Map(
    input.problems.map((p) => [p.id, p.slug] as const),
  );
  const related_content = resolveRelatedContent({
    fromPageId: input.page.id,
    relationships: input.relationships,
    pagesById,
    problemSlugById,
    publicOnly: true,
  });

  const related_service_ids: string[] = [];
  if (input.page.primary_service_id) {
    related_service_ids.push(input.page.primary_service_id);
  }
  if (input.page.primary_problem_id) {
    for (const row of input.problemServices) {
      if (
        row.problem_id === input.page.primary_problem_id &&
        !related_service_ids.includes(row.service_id)
      ) {
        related_service_ids.push(row.service_id);
      }
    }
  }

  const sources = input.contentSources
    .filter((cs) => cs.content_page_id === input.page.id)
    .map((cs) => {
      const source = input.sources.find((s) => s.id === cs.source_id);
      if (!source) return null;
      return { ...source, relationship_type: cs.relationship_type };
    })
    .filter(Boolean) as PublicContentPage["sources"];

  const problem =
    input.problems.find((p) => p.id === input.page.primary_problem_id) ?? null;

  return {
    ...input.page,
    related_service_ids,
    related_location_ids: input.page.primary_location_id
      ? [input.page.primary_location_id]
      : [],
    related_problem_ids: input.page.primary_problem_id
      ? [input.page.primary_problem_id]
      : [],
    related_content,
    sources,
    problem,
  };
}
