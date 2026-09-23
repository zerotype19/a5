/**
 * A5 Authority Engine — canonical typed vocabularies (A5-G001).
 * One vocabulary for page types, statuses, relationships, and sources.
 */

export const CONTENT_PAGE_TYPES = [
  "SERVICE",
  "LOCATION",
  "SERVICE_LOCATION",
  "PROBLEM",
  "GUIDE",
  "COST_GUIDE",
  "COMPARISON",
  "PROJECT",
  "CORE",
] as const;

export type ContentPageType = (typeof CONTENT_PAGE_TYPES)[number];

export const CONTENT_STATUSES = [
  "IDEA",
  "DRAFT",
  "REVIEW",
  "APPROVED",
  "PUBLISHED",
  "ARCHIVED",
] as const;

export type ContentStatus = (typeof CONTENT_STATUSES)[number];

export const SOURCE_TYPES = [
  "GOVERNMENT",
  "MANUFACTURER",
  "INDUSTRY",
  "A5_FIRST_PARTY",
  "OTHER",
] as const;

export type SourceType = (typeof SOURCE_TYPES)[number];

export const CONTENT_SOURCE_RELATIONSHIP_TYPES = [
  "SUPPORTS",
  "BACKGROUND",
  "REGULATORY",
  "COST_INPUT",
] as const;

export type ContentSourceRelationshipType =
  (typeof CONTENT_SOURCE_RELATIONSHIP_TYPES)[number];

export const CONTENT_RELATIONSHIP_TYPES = [
  "RELATED",
  "PARENT",
  "SUPPORTING_GUIDE",
  "COMPARISON",
  "COST_GUIDE",
  "LOCAL_VARIANT",
] as const;

export type ContentRelationshipType =
  (typeof CONTENT_RELATIONSHIP_TYPES)[number];

/** Controlled content body sections — not a page builder. */
export const CONTENT_SECTION_TYPES = [
  "INTRO",
  "DIRECT_ANSWER",
  "RICH_TEXT",
  "QUESTION_ANSWER",
  "SOURCE_LIST",
  "RELATED_CONTENT",
  "CTA",
  "COST_FACTORS",
  "COMPARISON_TABLE",
  "PROJECT_EVIDENCE",
] as const;

export type ContentSectionType = (typeof CONTENT_SECTION_TYPES)[number];

export type QuestionAnswerItem = {
  question: string;
  answer: string;
};

export type ComparisonRow = {
  criterion: string;
  optionA: string;
  optionB: string;
};

export type ContentSection =
  | { type: "INTRO"; body: string }
  | { type: "DIRECT_ANSWER"; body: string }
  | { type: "RICH_TEXT"; heading?: string; paragraphs: string[] }
  | { type: "QUESTION_ANSWER"; items: QuestionAnswerItem[] }
  | { type: "SOURCE_LIST"; heading?: string }
  | { type: "RELATED_CONTENT"; heading?: string }
  | { type: "CTA"; title?: string; description?: string }
  | { type: "COST_FACTORS"; heading?: string; factors: string[] }
  | {
      type: "COMPARISON_TABLE";
      optionALabel: string;
      optionBLabel: string;
      rows: ComparisonRow[];
    }
  | { type: "PROJECT_EVIDENCE"; heading?: string; body: string };

export type ContentPageRecord = {
  id: string;
  slug: string;
  page_type: ContentPageType;
  title: string;
  meta_title: string | null;
  meta_description: string | null;
  h1: string;
  primary_service_id: string | null;
  primary_location_id: string | null;
  primary_problem_id: string | null;
  primary_question: string | null;
  direct_answer: string | null;
  sections: ContentSection[];
  status: ContentStatus;
  indexable: boolean;
  ai_assisted: boolean;
  created_by: string | null;
  reviewed_by: string | null;
  created_at: string;
  updated_at: string;
  reviewed_at: string | null;
  published_at: string | null;
  last_reviewed_at: string | null;
  cost_methodology: string | null;
  cost_geography: string | null;
  /** PROJECT pages only — explicit public-project approval flag. */
  public_project_approved: boolean;
};

export type ProblemRecord = {
  id: string;
  slug: string;
  name: string;
  description: string;
  created_at: string;
};

export type SourceRecord = {
  id: string;
  title: string;
  url: string;
  publisher: string | null;
  source_type: SourceType;
  retrieved_at: string | null;
  reviewed_at: string | null;
};

export type ContentSourceLink = {
  content_page_id: string;
  source_id: string;
  relationship_type: ContentSourceRelationshipType;
};

export type ContentRelationship = {
  from_page_id: string;
  to_page_id: string;
  relationship_type: ContentRelationshipType;
};

export type BreadcrumbItem = {
  name: string;
  path: string;
};

export type PublicationIssue = {
  code: string;
  message: string;
};

export type PublicationValidationResult =
  | { valid: true }
  | { valid: false; issues: PublicationIssue[] };

/** Public-safe projection — never includes operational PII fields. */
export type PublicContentPage = ContentPageRecord & {
  related_service_ids: string[];
  related_location_ids: string[];
  related_problem_ids: string[];
  related_content: Array<{
    id: string;
    slug: string;
    page_type: ContentPageType;
    title: string;
    path: string;
    relationship_type: ContentRelationshipType;
  }>;
  sources: Array<SourceRecord & { relationship_type: ContentSourceRelationshipType }>;
  problem?: ProblemRecord | null;
};
