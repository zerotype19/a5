/**
 * Publication gate — validateForPublication (A5-G001).
 * Returns VALID or explicit blocking issues. Does not auto-fix.
 */

import { getLocationById, type LocationId } from "../../../config/locations.ts";
import { getServiceById, type ServiceId } from "../../../config/services.ts";
import { isValidSlug, isValidSourceUrl } from "./slugs.ts";
import type {
  ContentPageRecord,
  ContentPageType,
  PublicationIssue,
  PublicationValidationResult,
  SourceRecord,
} from "./types.ts";

export type PublicationValidationInput = {
  page: Pick<
    ContentPageRecord,
    | "slug"
    | "page_type"
    | "title"
    | "h1"
    | "primary_service_id"
    | "primary_location_id"
    | "primary_problem_id"
    | "status"
    | "indexable"
    | "cost_methodology"
    | "last_reviewed_at"
    | "public_project_approved"
    | "direct_answer"
  >;
  /** Problem ↔ service links (required for PROBLEM pages). */
  relatedServiceIds?: string[];
  /** Sources attached to the page (required for COST_GUIDE). */
  sources?: Array<Pick<SourceRecord, "url" | "source_type">>;
  /**
   * Other pages' slugs for the same page_type (exclude the page under review).
   * Collision if page.slug appears in this list.
   */
  otherSlugsForType?: string[];
};

function issue(code: string, message: string): PublicationIssue {
  return { code, message };
}

export function validateForPublication(
  input: PublicationValidationInput,
): PublicationValidationResult {
  const issues: PublicationIssue[] = [];
  const { page } = input;

  if (!page.title?.trim()) {
    issues.push(issue("title_required", "Title is required."));
  }
  if (!page.h1?.trim()) {
    issues.push(issue("h1_required", "Exactly one H1 value is required."));
  }
  if (!isValidSlug(page.slug)) {
    issues.push(
      issue(
        "slug_invalid",
        "Slug must be lowercase, hyphenated, URL-safe, and stable.",
      ),
    );
  }

  if (input.otherSlugsForType?.includes(page.slug)) {
    issues.push(
      issue(
        "slug_collision",
        `Slug "${page.slug}" collides with an existing ${page.page_type} page.`,
      ),
    );
  }

  validatePageTypeRequirements(page, input, issues);

  if (input.sources) {
    for (const source of input.sources) {
      if (!isValidSourceUrl(source.url)) {
        issues.push(
          issue(
            "source_url_invalid",
            `Source URL is invalid or uses a blocked scheme: ${source.url}`,
          ),
        );
      }
    }
  }

  if (page.indexable && page.status !== "PUBLISHED") {
    issues.push(
      issue(
        "indexable_requires_published",
        "indexable=true is only valid when status is PUBLISHED.",
      ),
    );
  }

  if (issues.length === 0) {
    return { valid: true };
  }
  return { valid: false, issues };
}

function validatePageTypeRequirements(
  page: PublicationValidationInput["page"],
  input: PublicationValidationInput,
  issues: PublicationIssue[],
): void {
  const type: ContentPageType = page.page_type;

  if (type === "SERVICE") {
    if (!page.primary_service_id) {
      issues.push(
        issue("service_required", "SERVICE pages require primary_service_id."),
      );
    } else if (!getServiceById(page.primary_service_id as ServiceId)) {
      issues.push(
        issue(
          "service_unknown",
          `primary_service_id "${page.primary_service_id}" is not in the service registry.`,
        ),
      );
    }
  }

  if (type === "LOCATION") {
    if (!page.primary_location_id) {
      issues.push(
        issue(
          "location_required",
          "LOCATION pages require primary_location_id.",
        ),
      );
    } else if (!getLocationById(page.primary_location_id as LocationId)) {
      issues.push(
        issue(
          "location_unknown",
          `primary_location_id "${page.primary_location_id}" is not in the location registry.`,
        ),
      );
    }
  }

  if (type === "SERVICE_LOCATION") {
    if (!page.primary_service_id) {
      issues.push(
        issue(
          "service_required",
          "SERVICE_LOCATION pages require primary_service_id.",
        ),
      );
    } else if (!getServiceById(page.primary_service_id as ServiceId)) {
      issues.push(
        issue(
          "service_unknown",
          `primary_service_id "${page.primary_service_id}" is not in the service registry.`,
        ),
      );
    }
    if (!page.primary_location_id) {
      issues.push(
        issue(
          "location_required",
          "SERVICE_LOCATION pages require primary_location_id.",
        ),
      );
    } else if (!getLocationById(page.primary_location_id as LocationId)) {
      issues.push(
        issue(
          "location_unknown",
          `primary_location_id "${page.primary_location_id}" is not in the location registry.`,
        ),
      );
    }
  }

  if (type === "PROBLEM") {
    if (!page.primary_problem_id) {
      issues.push(
        issue("problem_required", "PROBLEM pages require primary_problem_id."),
      );
    }
    const related = input.relatedServiceIds ?? [];
    if (related.length === 0) {
      issues.push(
        issue(
          "problem_service_required",
          "PROBLEM pages require at least one related service.",
        ),
      );
    } else {
      for (const serviceId of related) {
        if (!getServiceById(serviceId as ServiceId)) {
          issues.push(
            issue(
              "service_unknown",
              `Related service "${serviceId}" is not in the service registry.`,
            ),
          );
        }
      }
    }
    if (
      page.primary_service_id &&
      !getServiceById(page.primary_service_id as ServiceId)
    ) {
      issues.push(
        issue(
          "service_unknown",
          `primary_service_id "${page.primary_service_id}" is not in the service registry.`,
        ),
      );
    }
  }

  if (type === "COST_GUIDE") {
    if (!page.cost_methodology?.trim()) {
      issues.push(
        issue(
          "cost_methodology_required",
          "COST_GUIDE pages require cost methodology / provenance.",
        ),
      );
    }
    if (!page.last_reviewed_at) {
      issues.push(
        issue(
          "cost_review_date_required",
          "COST_GUIDE pages require last_reviewed_at.",
        ),
      );
    }
    const sources = input.sources ?? [];
    if (sources.length === 0) {
      issues.push(
        issue(
          "cost_source_required",
          "COST_GUIDE pages require at least one source.",
        ),
      );
    }
  }

  if (type === "PROJECT") {
    if (!page.public_project_approved) {
      issues.push(
        issue(
          "public_project_approval_required",
          "PROJECT pages require explicit public_project_approved=true.",
        ),
      );
    }
  }
}

/**
 * Whether a content record is eligible for the public sitemap.
 * Only PUBLISHED + indexable=true.
 */
export function isSitemapEligible(
  page: Pick<ContentPageRecord, "status" | "indexable">,
): boolean {
  return page.status === "PUBLISHED" && page.indexable === true;
}

/**
 * Whether a content record may be served on a public URL.
 * PUBLISHED pages are publicly readable (indexable is separate).
 * Draft/review/etc. are never publicly readable.
 */
export function isPubliclyReadable(
  page: Pick<ContentPageRecord, "status">,
): boolean {
  return page.status === "PUBLISHED";
}

/**
 * Robots directive for a publicly readable page.
 */
export function robotsForPublicPage(
  page: Pick<ContentPageRecord, "status" | "indexable">,
): { index: boolean; follow: boolean } {
  if (page.status !== "PUBLISHED") {
    return { index: false, follow: false };
  }
  if (!page.indexable) {
    return { index: false, follow: true };
  }
  return { index: true, follow: true };
}
