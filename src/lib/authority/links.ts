import type { ContentLink } from "./types.ts";

export function isInternalContentHref(href: unknown): href is string {
  return (
    typeof href === "string" &&
    href.startsWith("/") &&
    !href.startsWith("//") &&
    !href.includes("\\")
  );
}

export function renderableContentLinks(
  links: ContentLink[] | undefined,
): ContentLink[] {
  if (!Array.isArray(links)) return [];
  return links.filter(
    (link) =>
      typeof link?.label === "string" &&
      link.label.trim().length > 0 &&
      isInternalContentHref(link.href),
  );
}
