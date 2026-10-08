/**
 * Owner-approved publication plan for the PR #17 authority tranche.
 * Updates existing service hubs and the brick-step page. Inserts one
 * content page per new problem. Does not insert problem entities.
 */


import { PROBLEM_PAGE_DRAFTS } from "./drafts/problems.ts";
import { SERVICE_HUB_DRAFTS } from "./drafts/service-hubs.ts";
import type { ClaimToVerify } from "./drafts/types.ts";
import { G001_BRICK_STEP_PAGE_ID } from "./drafts/types.ts";
import type { ContentSection, ContentSourceRelationshipType, SourceType } from "./types.ts";

export const TRANCHE_REVIEWED_AT = "2026-09-30T12:00:00.000Z";

/** Original tranche SERVICE content_pages ids. Frozen to its eight services. Do not replace these ids. */
export const LIVE_SERVICE_PAGE_IDS: Record<string, string> = {

  handyman: "20000000-0000-4000-8000-000000000001",
  landscaping: "20000000-0000-4000-8000-000000000002",
  painting: "20000000-0000-4000-8000-000000000003",
  drywall: "20000000-0000-4000-8000-000000000004",
  tile: "20000000-0000-4000-8000-000000000005",
  plumbing: "20000000-0000-4000-8000-000000000006",
  electrical: "20000000-0000-4000-8000-000000000007",
  masonry: "10000000-0000-4000-8000-000000000001",
};

/** New PROBLEM content_pages ids. brick-step-repair is not in this map. */
export const NEW_PROBLEM_PAGE_IDS: Record<string, string> = {
  "loose-mortar": "30000000-0000-4000-8000-000000000001",
  "sunken-pavers": "30000000-0000-4000-8000-000000000002",
  "visible-pipe-leak": "30000000-0000-4000-8000-000000000003",
  "running-toilet": "30000000-0000-4000-8000-000000000004",
  "water-damaged-ceiling": "30000000-0000-4000-8000-000000000005",
  "hole-in-drywall": "30000000-0000-4000-8000-000000000006",
  "drywall-crack": "30000000-0000-4000-8000-000000000007",
  "failed-light-fixture": "30000000-0000-4000-8000-000000000008",
  "dead-outlet": "30000000-0000-4000-8000-000000000009",
  "crumbling-grout": "30000000-0000-4000-8000-00000000000a",
  "peeling-exterior-paint": "30000000-0000-4000-8000-00000000000b",
  "sticking-interior-door": "30000000-0000-4000-8000-00000000000c",
  "yard-surface-grading": "30000000-0000-4000-8000-00000000000d",
};

type ApprovedSource = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  source_type: SourceType;
  relationship_type: ContentSourceRelationshipType;
};

export const APPROVED_SOURCES: readonly ApprovedSource[] = [
  {
    id: "40000000-0000-4000-8000-000000000001",
    title:
      "NOAA NCEI 1991–2020 climate normals, Canoe Brook NJ (USC00281335)",
    url: "https://www.ncei.noaa.gov/access/services/data/v1?dataset=normals-monthly-1991-2020&stations=USC00281335&dataTypes=MLY-TMAX-NORMAL,MLY-TMIN-NORMAL&format=json",
    publisher: "NOAA National Centers for Environmental Information",
    source_type: "GOVERNMENT",
    relationship_type: "SUPPORTS",
  },
  {
    id: "40000000-0000-4000-8000-000000000002",
    title:
      "Brick Industry Association Technical Note 14B, de-icing agents on clay pavers",
    url: "https://www.gobrick.com/media/file/14b-paving-systems-using-clay-pavers-on-a-bituminous-setting-bed.pdf",
    publisher: "Brick Industry Association",
    source_type: "INDUSTRY",
    relationship_type: "SUPPORTS",
  },
  {
    id: "40000000-0000-4000-8000-000000000003",
    title: "Brick Industry Association Technical Note 1, cold-weather masonry",
    url: "https://www.gobrick.com/media/file/1-tn1.pdf",
    publisher: "Brick Industry Association",
    source_type: "INDUSTRY",
    relationship_type: "SUPPORTS",
  },
  {
    id: "40000000-0000-4000-8000-000000000004",
    title: "New Jersey State Board of Examiners of Master Plumbers",
    url: "https://www.njconsumeraffairs.gov/plu/Pages/FAQ.aspx",
    publisher: "New Jersey Division of Consumer Affairs",
    source_type: "GOVERNMENT",
    relationship_type: "REGULATORY",
  },
  {
    id: "40000000-0000-4000-8000-000000000005",
    title: "N.J.S.A. 45:5A-9, electrical contractor license",
    url: "https://law.justia.com/codes/new-jersey/title-45/section-45-5a-9/",
    publisher: "New Jersey Legislature",
    source_type: "GOVERNMENT",
    relationship_type: "REGULATORY",
  },
  {
    id: "40000000-0000-4000-8000-000000000006",
    title: "N.J.A.C. 5:23, Uniform Construction Code administration",
    url: "https://www.nj.gov/dca/codes/codreg/pdf_regs/njac_5_23_2.pdf",
    publisher: "New Jersey Department of Community Affairs",
    source_type: "GOVERNMENT",
    relationship_type: "REGULATORY",
  },
  {
    id: "40000000-0000-4000-8000-000000000007",
    title: "New Jersey One Call, private facilities",
    url: "https://www.nj1-call.org/training-safety/private-facilities/",
    publisher: "New Jersey One Call",
    source_type: "GOVERNMENT",
    relationship_type: "REGULATORY",
  },
  {
    id: "40000000-0000-4000-8000-000000000008",
    title: "40 CFR Part 745 Subpart E, lead renovation rule",
    url: "https://www.ecfr.gov/current/title-40/chapter-I/subchapter-R/part-745/subpart-E",
    publisher: "U.S. Environmental Protection Agency",
    source_type: "GOVERNMENT",
    relationship_type: "REGULATORY",
  },
];

const SOURCE_BY_URL = new Map(APPROVED_SOURCES.map((source) => [source.url, source]));

export type TranchePageRow = {
  id: string;
  slug: string;
  page_type: "SERVICE" | "PROBLEM";
  title: string;
  meta_title: string;
  meta_description: string;
  h1: string;
  primary_service_id: string;
  primary_location_id: null;
  primary_problem_id: string | null;
  primary_question: string;
  direct_answer: string;
  sections: ContentSection[];
  status: "PUBLISHED";
  indexable: true;
  ai_assisted: true;
  created_by: "cursor-authority-draft";
  reviewed_by: "owner";
  reviewed_at: string;
  published_at: string;
  last_reviewed_at: string;
  updated_at: string;
  action: "update-existing" | "insert";
};

export type TrancheSourceLink = {
  content_page_id: string;
  source_id: string;
  relationship_type: ContentSourceRelationshipType;
};

export type TrancheRelationship = {
  from_page_id: string;
  to_page_id: string;
  relationship_type: "RELATED" | "PARENT";
};

export type TranchePublicationPlan = {
  pages: TranchePageRow[];
  sources: typeof APPROVED_SOURCES;
  sourceLinks: TrancheSourceLink[];
  relationships: TrancheRelationship[];
};

function sourceForClaim(claim: ClaimToVerify): ApprovedSource {
  const source = SOURCE_BY_URL.get(claim.sourceUrl);
  if (!source) {
    throw new Error(`No approved source for ${claim.sourceUrl}`);
  }
  return source;
}

function withSourceList(
  sections: readonly ContentSection[],
  hasSources: boolean,
): ContentSection[] {
  const next = sections.map((section) => ({ ...section }));
  if (!hasSources || next.some((section) => section.type === "SOURCE_LIST")) {
    return next;
  }
  const ctaAt = next.findIndex((section) => section.type === "CTA");
  const block: ContentSection = { type: "SOURCE_LIST", heading: "Sources" };
  if (ctaAt === -1) next.push(block);
  else next.splice(ctaAt, 0, block);
  return next;
}

function pageIdForProblem(slug: string): string {
  if (slug === "brick-step-repair") return G001_BRICK_STEP_PAGE_ID;
  const id = NEW_PROBLEM_PAGE_IDS[slug];
  if (!id) throw new Error(`Problem ${slug} is outside the approved tranche`);
  return id;
}

function publishedProblemSlugs(): Set<string> {
  return new Set(PROBLEM_PAGE_DRAFTS.map((draft) => draft.problemSlug));
}

export function buildTranchePublicationPlan(): TranchePublicationPlan {
  const published = publishedProblemSlugs();
  const pages: TranchePageRow[] = [];
  const sourceLinks: TrancheSourceLink[] = [];

  for (const hub of SERVICE_HUB_DRAFTS) {
    const id = LIVE_SERVICE_PAGE_IDS[hub.serviceId];
    const claims = hub.claimsToVerify;
    pages.push({
      id,
      slug: hub.serviceId,
      page_type: "SERVICE",
      title: hub.title,
      meta_title: hub.metaTitle,
      meta_description: hub.metaDescription,
      h1: hub.h1,
      primary_service_id: hub.serviceId,
      primary_location_id: null,
      primary_problem_id: null,
      primary_question: hub.primaryQuestion,
      direct_answer: hub.directAnswer,
      sections: withSourceList(hub.sections, claims.length > 0),
      status: "PUBLISHED",
      indexable: true,
      ai_assisted: true,
      created_by: "cursor-authority-draft",
      reviewed_by: "owner",
      reviewed_at: TRANCHE_REVIEWED_AT,
      published_at: TRANCHE_REVIEWED_AT,
      last_reviewed_at: TRANCHE_REVIEWED_AT,
      updated_at: TRANCHE_REVIEWED_AT,
      action: "update-existing",
    });
    for (const claim of claims) {
      const source = sourceForClaim(claim);
      sourceLinks.push({
        content_page_id: id,
        source_id: source.id,
        relationship_type: source.relationship_type,
      });
    }
  }

  for (const draft of PROBLEM_PAGE_DRAFTS) {
    const id = pageIdForProblem(draft.problemSlug);
    const claims = draft.claimsToVerify;
    pages.push({
      id,
      slug: draft.problemSlug,
      page_type: "PROBLEM",
      title: draft.title,
      meta_title: draft.metaTitle,
      meta_description: draft.metaDescription,
      h1: draft.h1,
      primary_service_id: draft.primaryServiceId,
      primary_location_id: null,
      primary_problem_id: draft.problemSlug,
      primary_question: draft.primaryQuestion,
      direct_answer: draft.directAnswer,
      sections: withSourceList(draft.sections, claims.length > 0),
      status: "PUBLISHED",
      indexable: true,
      ai_assisted: true,
      created_by: "cursor-authority-draft",
      reviewed_by: "owner",
      reviewed_at: TRANCHE_REVIEWED_AT,
      published_at: TRANCHE_REVIEWED_AT,
      last_reviewed_at: TRANCHE_REVIEWED_AT,
      updated_at: TRANCHE_REVIEWED_AT,
      action: draft.problemSlug === "brick-step-repair" ? "update-existing" : "insert",
    });
    for (const claim of claims) {
      const source = sourceForClaim(claim);
      sourceLinks.push({
        content_page_id: id,
        source_id: source.id,
        relationship_type: source.relationship_type,
      });
    }
  }

  const relationships: TrancheRelationship[] = [];
  const seen = new Set<string>();
  function add(
    from: string,
    to: string,
    relationship_type: TrancheRelationship["relationship_type"],
  ) {
    if (from === to) return;
    const key = `${from}|${to}|${relationship_type}`;
    if (seen.has(key)) return;
    seen.add(key);
    relationships.push({ from_page_id: from, to_page_id: to, relationship_type });
  }

  for (const draft of PROBLEM_PAGE_DRAFTS) {
    const problemId = pageIdForProblem(draft.problemSlug);
    add(problemId, LIVE_SERVICE_PAGE_IDS[draft.primaryServiceId], "PARENT");
    for (const serviceId of draft.relatedServiceIds) {
      if (serviceId === draft.primaryServiceId) continue;
      add(problemId, LIVE_SERVICE_PAGE_IDS[serviceId], "RELATED");
    }
    for (const related of draft.relatedProblemSlugs) {
      if (!published.has(related)) continue;
      add(problemId, pageIdForProblem(related), "RELATED");
    }
  }

  for (const hub of SERVICE_HUB_DRAFTS) {
    const hubId = LIVE_SERVICE_PAGE_IDS[hub.serviceId];
    for (const draft of PROBLEM_PAGE_DRAFTS) {
      const involved =
        draft.primaryServiceId === hub.serviceId ||
        draft.relatedServiceIds.includes(hub.serviceId);
      if (!involved) continue;
      add(hubId, pageIdForProblem(draft.problemSlug), "RELATED");
    }
  }

  return {
    pages,
    sources: APPROVED_SOURCES,
    sourceLinks: dedupeLinks(sourceLinks),
    relationships,
  };
}

function dedupeLinks(links: TrancheSourceLink[]): TrancheSourceLink[] {
  const seen = new Set<string>();
  const out: TrancheSourceLink[] = [];
  for (const link of links) {
    const key = `${link.content_page_id}|${link.source_id}|${link.relationship_type}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(link);
  }
  return out;
}
