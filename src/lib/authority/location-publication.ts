/**
 * Owner-approved publication plan for the six location hubs.
 * Updates the live Madison page. Inserts one LOCATION page for each
 * other registry town. Does not create service × location pages.
 */

import { LIVE_SERVICE_PAGE_IDS, NEW_PROBLEM_PAGE_IDS } from "./tranche-publication.ts";
import { LOCATION_HUB_DRAFTS } from "./drafts/locations.ts";
import type { ClaimToVerify } from "./drafts/types.ts";
import { G001_BRICK_STEP_PAGE_ID, LIVE_MADISON_LOCATION_PAGE_ID } from "./drafts/types.ts";
import type {
  ContentSection,
  ContentSourceRelationshipType,
  SourceType,
} from "./types.ts";

export const LOCATION_REVIEWED_AT = "2026-09-30T12:45:00.000Z";

export const LIVE_MADISON_MASONRY_PAGE_ID = "10000000-0000-4000-8000-000000000003";
export const LIVE_BRICK_GUIDE_PAGE_ID = "10000000-0000-4000-8000-000000000005";

/** New LOCATION rows. Madison keeps its existing id. */
export const NEW_LOCATION_PAGE_IDS: Record<string, string> = {
  "florham-park": "50000000-0000-4000-8000-000000000001",
  chatham: "50000000-0000-4000-8000-000000000002",
  "morris-township": "50000000-0000-4000-8000-000000000003",
  morristown: "50000000-0000-4000-8000-000000000004",
  "east-hanover": "50000000-0000-4000-8000-000000000005",
};

type MunicipalSource = {
  id: string;
  title: string;
  url: string;
  publisher: string;
  source_type: SourceType;
  relationship_type: ContentSourceRelationshipType;
};

export const MUNICIPAL_SOURCES: readonly MunicipalSource[] = [
  {
    id: "40000000-0000-4000-8000-000000000009",
    title: "Borough of Florham Park, Mayor and Council",
    url: "https://www.florhamparknj.gov/departments/mayorandcouncil",
    publisher: "Borough of Florham Park",
    source_type: "GOVERNMENT",
    relationship_type: "SUPPORTS",
  },
  {
    id: "40000000-0000-4000-8000-00000000000a",
    title: "Borough of Madison official site",
    url: "https://www.rosenet.org/",
    publisher: "Borough of Madison",
    source_type: "GOVERNMENT",
    relationship_type: "SUPPORTS",
  },
  {
    id: "40000000-0000-4000-8000-00000000000b",
    title: "Chatham Borough official site",
    url: "https://www.chathamborough.org/",
    publisher: "Chatham Borough",
    source_type: "GOVERNMENT",
    relationship_type: "SUPPORTS",
  },
  {
    id: "40000000-0000-4000-8000-00000000000c",
    title: "Township of Chatham official site",
    url: "https://chathamtownship.org/",
    publisher: "Township of Chatham",
    source_type: "GOVERNMENT",
    relationship_type: "SUPPORTS",
  },
  {
    id: "40000000-0000-4000-8000-00000000000d",
    title: "Morris Township official site",
    url: "https://morristwp.com/",
    publisher: "Morris Township",
    source_type: "GOVERNMENT",
    relationship_type: "SUPPORTS",
  },
  {
    id: "40000000-0000-4000-8000-00000000000e",
    title: "Town of Morristown, local government",
    url: "https://www.townofmorristown.org/government",
    publisher: "Town of Morristown",
    source_type: "GOVERNMENT",
    relationship_type: "SUPPORTS",
  },
  {
    id: "40000000-0000-4000-8000-00000000000f",
    title: "Township of East Hanover, About East Hanover",
    url: "https://www.easthanovertownship.com/pages/about-east-hanover",
    publisher: "Township of East Hanover",
    source_type: "GOVERNMENT",
    relationship_type: "SUPPORTS",
  },
];

const SOURCE_BY_URL = new Map(MUNICIPAL_SOURCES.map((source) => [source.url, source]));

export type LocationPageRow = {
  id: string;
  slug: string;
  page_type: "LOCATION";
  title: string;
  meta_title: string;
  meta_description: string;
  h1: string;
  primary_service_id: null;
  primary_location_id: string;
  primary_problem_id: null;
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
  public_project_approved: false;
  action: "update-existing" | "insert";
};

export type LocationSourceLink = {
  content_page_id: string;
  source_id: string;
  relationship_type: ContentSourceRelationshipType;
};

export type LocationRelationship = {
  from_page_id: string;
  to_page_id: string;
  relationship_type: "RELATED" | "LOCAL_VARIANT";
};

export type LocationPublicationPlan = {
  pages: LocationPageRow[];
  sources: typeof MUNICIPAL_SOURCES;
  sourceLinks: LocationSourceLink[];
  relationships: LocationRelationship[];
};

function sourceForClaim(claim: ClaimToVerify): MunicipalSource {
  const source = SOURCE_BY_URL.get(claim.sourceUrl);
  if (!source) throw new Error(`No municipal source for ${claim.sourceUrl}`);
  return source;
}

function locationPageId(locationId: string): string {
  if (locationId === "madison") return LIVE_MADISON_LOCATION_PAGE_ID;
  const id = NEW_LOCATION_PAGE_IDS[locationId];
  if (!id) throw new Error(`Location ${locationId} is outside the approved six`);
  return id;
}

function problemPageId(slug: string): string {
  if (slug === "brick-step-repair") return G001_BRICK_STEP_PAGE_ID;
  const id = NEW_PROBLEM_PAGE_IDS[slug];
  if (!id) throw new Error(`Problem ${slug} is not a published page`);
  return id;
}

export function buildLocationPublicationPlan(): LocationPublicationPlan {
  const pages: LocationPageRow[] = [];
  const sourceLinks: LocationSourceLink[] = [];
  const relationships: LocationRelationship[] = [];
  const pageIdByLocation = new Map(
    LOCATION_HUB_DRAFTS.map((draft) => [draft.locationId, locationPageId(draft.locationId)]),
  );

  for (const draft of LOCATION_HUB_DRAFTS) {
    const id = locationPageId(draft.locationId);
    pages.push({
      id,
      slug: draft.locationId,
      page_type: "LOCATION",
      title: draft.title,
      meta_title: draft.metaTitle,
      meta_description: draft.metaDescription,
      h1: draft.h1,
      primary_service_id: null,
      primary_location_id: draft.locationId,
      primary_problem_id: null,
      primary_question: draft.primaryQuestion,
      direct_answer: draft.directAnswer,
      sections: draft.sections.map((section) => ({ ...section })),
      status: "PUBLISHED",
      indexable: true,
      ai_assisted: true,
      created_by: "cursor-authority-draft",
      reviewed_by: "owner",
      reviewed_at: LOCATION_REVIEWED_AT,
      published_at: LOCATION_REVIEWED_AT,
      last_reviewed_at: LOCATION_REVIEWED_AT,
      updated_at: LOCATION_REVIEWED_AT,
      public_project_approved: false,
      action: draft.disposition.action === "update-in-place" ? "update-existing" : "insert",
    });
    for (const claim of draft.claimsToVerify) {
      const source = sourceForClaim(claim);
      sourceLinks.push({
        content_page_id: id,
        source_id: source.id,
        relationship_type: source.relationship_type,
      });
    }
    for (const serviceId of Object.keys(LIVE_SERVICE_PAGE_IDS) as Array<
      keyof typeof LIVE_SERVICE_PAGE_IDS
    >) {
      relationships.push({
        from_page_id: id,
        to_page_id: LIVE_SERVICE_PAGE_IDS[serviceId],
        relationship_type: "RELATED",
      });
    }
    for (const slug of draft.relatedProblemSlugs) {
      relationships.push({
        from_page_id: id,
        to_page_id: problemPageId(slug),
        relationship_type: "RELATED",
      });
    }
    for (const path of draft.nearbyLocationPaths) {
      const locationId = path.replace("/home-services/", "");
      const target = pageIdByLocation.get(locationId as typeof draft.locationId);
      if (!target) throw new Error(`Nearby town ${path} is not in this batch`);
      relationships.push({
        from_page_id: id,
        to_page_id: target,
        relationship_type: "RELATED",
      });
    }
  }

  relationships.push({
    from_page_id: LIVE_MADISON_LOCATION_PAGE_ID,
    to_page_id: LIVE_MADISON_MASONRY_PAGE_ID,
    relationship_type: "LOCAL_VARIANT",
  });
  relationships.push({
    from_page_id: LIVE_MADISON_LOCATION_PAGE_ID,
    to_page_id: LIVE_BRICK_GUIDE_PAGE_ID,
    relationship_type: "RELATED",
  });

  return { pages, sources: MUNICIPAL_SOURCES, sourceLinks, relationships };
}
