import type { PublicContentPage, ContentSection } from "./types.ts";

export function sectionHeading(section: ContentSection): string | null {
  switch (section.type) {
    case "RICH_TEXT": return section.heading ?? null;
    case "QUESTION_ANSWER": return section.items.length ? "Questions" : null;
    case "SOURCE_LIST": return section.heading ?? "Sources";
    case "RELATED_CONTENT": return section.heading ?? "Related reading";
    case "COST_FACTORS": return section.heading ?? "What affects cost";
    case "COMPARISON_TABLE": return "How to tell them apart";
    case "PROJECT_EVIDENCE": return section.heading ?? "Project evidence";
    default: return null;
  }
}

export function buildPageOutline(page: Pick<PublicContentPage, "sections" | "sources" | "related_content">) {
  return page.sections.flatMap((section, index) => {
    if (section.type === "SOURCE_LIST" && !page.sources.length) return [];
    if (section.type === "RELATED_CONTENT" && !page.related_content.length) return [];
    const label = sectionHeading(section);
    return label ? [{ id: `section-${index + 1}`, label }] : [];
  });
}
