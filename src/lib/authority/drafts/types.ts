/**
 * Authority draft corpus — content only.
 * Nothing in src/lib/authority/drafts/ is imported by a route, the sitemap,
 * or a seed. Publishing requires an owner-approved content_pages record.
 */

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

/** A statement that must be checked against a source before the page is published. */
export type ClaimToVerify = {
  claim: string;
  suggestedSource: string;
};

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
