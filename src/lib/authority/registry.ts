/**
 * Machine-readable authority registries (A5-G001).
 */

import {
  CONTENT_PAGE_TYPES,
  CONTENT_RELATIONSHIP_TYPES,
  CONTENT_SECTION_TYPES,
  CONTENT_SOURCE_RELATIONSHIP_TYPES,
  CONTENT_STATUSES,
  SOURCE_TYPES,
} from "./types.ts";

export const AUTHORITY_REGISTRIES = {
  pageTypes: CONTENT_PAGE_TYPES,
  contentStatuses: CONTENT_STATUSES,
  relationshipTypes: CONTENT_RELATIONSHIP_TYPES,
  sourceTypes: SOURCE_TYPES,
  contentSourceRelationshipTypes: CONTENT_SOURCE_RELATIONSHIP_TYPES,
  sectionTypes: CONTENT_SECTION_TYPES,
} as const;

export function isContentPageType(value: string): boolean {
  return (CONTENT_PAGE_TYPES as readonly string[]).includes(value);
}

export function isContentStatus(value: string): boolean {
  return (CONTENT_STATUSES as readonly string[]).includes(value);
}

export function isContentRelationshipType(value: string): boolean {
  return (CONTENT_RELATIONSHIP_TYPES as readonly string[]).includes(value);
}

export function isSourceType(value: string): boolean {
  return (SOURCE_TYPES as readonly string[]).includes(value);
}
