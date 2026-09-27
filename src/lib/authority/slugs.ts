/**
 * Slug + source URL validation (A5-G001).
 * Reject collisions — never silently append random suffixes.
 */

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function isValidSlug(slug: string): boolean {
  if (!slug || slug.length > 120) return false;
  return SLUG_PATTERN.test(slug);
}

export function assertValidSlug(slug: string): void {
  if (!isValidSlug(slug)) {
    throw new Error(`invalid_slug:${slug}`);
  }
}

/** Detect duplicate slug within a set of candidate identifiers. */
export function findSlugCollisions(slugs: readonly string[]): string[] {
  const seen = new Map<string, number>();
  for (const slug of slugs) {
    seen.set(slug, (seen.get(slug) ?? 0) + 1);
  }
  return [...seen.entries()]
    .filter(([, count]) => count > 1)
    .map(([slug]) => slug)
    .sort();
}

const BLOCKED_URL_SCHEMES = /^(javascript|data|vbscript|file):/i;

export function isValidSourceUrl(url: string): boolean {
  if (!url || url.length > 2048) return false;
  if (BLOCKED_URL_SCHEMES.test(url.trim())) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
