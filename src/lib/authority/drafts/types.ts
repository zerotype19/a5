/**
 * Authority draft corpus — content only.
 * Nothing in src/lib/authority/drafts/ is imported by a route, the sitemap,
 * or a seed. Publishing requires an owner-approved content_pages record.
 */

import type { LocationId } from "../../../../config/locations.ts";
import type { ServiceId } from "../../../../config/services.ts";
import type { ContentPageType, ContentSection } from "../types.ts";

export const DRAFT_STATUS = "DRAFT" as const;
export const DRAFT_AUTHOR = "cursor-authority-draft" as const;
export const DRAFT_DATE = "2026-09-29" as const;

/** The request form accepts at most this many photos (src/lib/photos/constants.ts). */
export const PHOTO_SHOT_LIMIT = 5;

/**
 * Problem entity slugs defined by A5-G002 (feature/a5-g002-service-authority).
 * Drafts may only target these; adding a problem entity needs owner approval.
 */
export const G002_PROBLEM_SERVICE_LINKS: Readonly<
  Record<string, readonly ServiceId[]>
> = {
  "sticking-interior-door": ["handyman"],
  "loose-or-damaged-trim": ["handyman"],
  "wall-mounting": ["handyman"],
  "worn-door-hardware": ["handyman"],
  "punch-list-repairs": ["handyman"],
  "small-carpentry-repair": ["handyman"],
  "brick-step-repair": ["masonry"],
  "sunken-pavers": ["masonry"],
  "loose-mortar": ["masonry"],
  "damaged-brick-walkway": ["masonry"],
  "uneven-stone-patio": ["masonry"],
  "shifting-retaining-wall": ["masonry"],
  "overgrown-planting-beds": ["landscaping"],
  "landscape-cleanup": ["landscaping"],
  "new-planting-beds": ["landscaping"],
  "yard-surface-grading": ["landscaping"],
  "seasonal-yard-cleanup": ["landscaping"],
  "worn-interior-paint": ["painting"],
  "peeling-exterior-paint": ["painting"],
  "trim-paint-failure": ["painting"],
  "paint-after-patching": ["painting"],
  "hole-in-drywall": ["drywall"],
  "drywall-crack": ["drywall"],
  "ceiling-drywall-damage": ["drywall"],
  "water-damaged-ceiling": ["plumbing", "drywall", "painting"],
  "unfinished-drywall-repair": ["drywall"],
  "cracked-floor-tile": ["tile"],
  "loose-backsplash-tile": ["tile"],
  "bathroom-floor-tile-repair": ["tile"],
  "crumbling-grout": ["tile"],
  "cracked-shower-tile": ["tile"],
  "dripping-faucet": ["plumbing"],
  "running-toilet": ["plumbing"],
  "visible-pipe-leak": ["plumbing"],
  "fixture-replacement": ["plumbing"],
  "water-heater-replacement-project": ["plumbing"],
  "failed-light-fixture": ["electrical"],
  "dead-outlet": ["electrical"],
  "faulty-switch": ["electrical"],
  "ceiling-fan-project": ["electrical"],
  "lighting-update": ["electrical"],
  "recurring-electrical-issue": ["electrical"],
};

/**
 * A factual statement on a draft, tied to the primary source that supports it.
 * `exactSupportedClaim` is what the source says. Page copy must stay inside it.
 */
export type ClaimToVerify = {
  claim: string;
  sourceTitle: string;
  sourceUrl: string;
  exactSupportedClaim: string;
};

/** G001 fixture page for brick-step-repair. Update this row; do not insert another. */
export const G001_BRICK_STEP_PAGE_ID = "10000000-0000-4000-8000-000000000004";

export type ProblemPageDisposition = {
  action: "update-in-place" | "create-page-for-existing-problem";
  canonicalPath: string;
  existingContentPageId: string | null;
  /** G002 seed uses the slug as the problems.id. This draft does not insert that row. */
  problemEntityId: string;
  problemEntitySource: "g001-fixture-kept-by-g002" | "g002-seed";
};

export function problemPageDisposition(
  problemSlug: string,
  primaryServiceId: string,
): ProblemPageDisposition {
  const canonicalPath = `/services/${primaryServiceId}/${problemSlug}`;
  if (problemSlug === "brick-step-repair") {
    return {
      action: "update-in-place",
      canonicalPath: "/services/masonry/brick-step-repair",
      existingContentPageId: G001_BRICK_STEP_PAGE_ID,
      problemEntityId: "brick-step-repair",
      problemEntitySource: "g001-fixture-kept-by-g002",
    };
  }
  return {
    action: "create-page-for-existing-problem",
    canonicalPath,
    existingContentPageId: null,
    problemEntityId: problemSlug,
    problemEntitySource: "g002-seed",
  };
}

type DraftBase = {
  title: string;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  primaryQuestion: string;
  directAnswer: string;
  sections: ContentSection[];
  relatedProblemSlugs: readonly string[];
  claimsToVerify: readonly ClaimToVerify[];
};

export type ServiceHubDraft = DraftBase & {
  serviceId: ServiceId;
  /** Described only — the repo has no project imagery. Label: "Typical projects". */
  typicalProjectVisuals: readonly string[];
};

export type ProblemPageDraft = DraftBase & {
  problemSlug: string;
  primaryServiceId: ServiceId;
  relatedServiceIds: readonly ServiceId[];
  disposition: ProblemPageDisposition;
};

export type DraftPageFields = {
  slug: string;
  page_type: ContentPageType;
  title: string;
  h1: string;
  primary_service_id: string | null;
  primary_location_id: string | null;
  primary_problem_id: string | null;
  status: typeof DRAFT_STATUS;
  indexable: false;
  cost_methodology: null;
  last_reviewed_at: null;
  public_project_approved: false;
  direct_answer: string;
};

export function hubDraftFields(draft: ServiceHubDraft): DraftPageFields {
  return {
    slug: draft.serviceId,
    page_type: "SERVICE",
    title: draft.title,
    h1: draft.h1,
    primary_service_id: draft.serviceId,
    primary_location_id: null,
    primary_problem_id: null,
    status: DRAFT_STATUS,
    indexable: false,
    cost_methodology: null,
    last_reviewed_at: null,
    public_project_approved: false,
    direct_answer: draft.directAnswer,
  };
}

/** Live Madison LOCATION row. Update it; do not insert a second town page. */
export const LIVE_MADISON_LOCATION_PAGE_ID =
  "10000000-0000-4000-8000-000000000002";

export type LocationHubDisposition = {
  action: "update-in-place" | "create";
  canonicalPath: string;
  existingContentPageId: string | null;
};

export type LocationHubDraft = DraftBase & {
  locationId: LocationId;
  disposition: LocationHubDisposition;
  /** Only paths that are already published, or the other hubs in this same batch. */
  linkPaths: readonly string[];
};

export function problemDraftFields(draft: ProblemPageDraft): DraftPageFields {
  return {
    slug: draft.problemSlug,
    page_type: "PROBLEM",
    title: draft.title,
    h1: draft.h1,
    primary_service_id: draft.primaryServiceId,
    primary_location_id: null,
    primary_problem_id: draft.problemSlug,
    status: DRAFT_STATUS,
    indexable: false,
    cost_methodology: null,
    last_reviewed_at: null,
    public_project_approved: false,
    direct_answer: draft.directAnswer,
  };
}

export function locationDraftFields(draft: LocationHubDraft): DraftPageFields {
  return {
    slug: draft.locationId,
    page_type: "LOCATION",
    title: draft.title,
    h1: draft.h1,
    primary_service_id: null,
    primary_location_id: draft.locationId,
    primary_problem_id: null,
    status: DRAFT_STATUS,
    indexable: false,
    cost_methodology: null,
    last_reviewed_at: null,
    public_project_approved: false,
    direct_answer: draft.directAnswer,
  };
}
