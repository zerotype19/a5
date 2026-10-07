import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LOCATIONS } from "../config/locations.ts";
import { SERVICES } from "../config/services.ts";
import {
  LOCATION_BATCH_PROBLEM_SLUGS,
  LOCATION_HUB_DRAFTS,
  LOCATION_SECTION_HEADINGS,
} from "../src/lib/authority/drafts/locations.ts";
import {
  LIVE_MADISON_LOCATION_PAGE_ID,
  locationDraftFields,
} from "../src/lib/authority/drafts/types.ts";
import type { ContentSection } from "../src/lib/authority/types.ts";
import { validateForPublication } from "../src/lib/authority/validate.ts";

const PUBLISHED_PROBLEM_SLUGS = new Set<string>(LOCATION_BATCH_PROBLEM_SLUGS);

const INTERNAL_LANGUAGE = [
  /the registry/i,
  /this batch/i,
  /this draft/i,
  /there is no/i,
  /\bSEO\b/,
  /canonical/i,
  /\/services\//,
  /\/home-services\//,
  /\bwe\b/i,
  /best place/i,
  /\$/,
  /Novartis|Nabisco/i,
];

function headings(sections: ContentSection[]): string[] {
  return sections.flatMap((section) =>
    "heading" in section && section.heading ? [section.heading] : [],
  );
}

function textOf(draft: (typeof LOCATION_HUB_DRAFTS)[number]): string {
  return JSON.stringify({
    title: draft.title,
    h1: draft.h1,
    primaryQuestion: draft.primaryQuestion,
    directAnswer: draft.directAnswer,
    sections: draft.sections,
  });
}

function sectionParagraphs(draft: (typeof LOCATION_HUB_DRAFTS)[number], heading: string): string[] {
  const section = draft.sections.find(
    (item) => item.type === "RICH_TEXT" && item.heading === heading,
  );
  assert.ok(section && section.type === "RICH_TEXT", heading);
  return section.paragraphs;
}

describe("location hub drafts", () => {
  it("covers the six registry towns and no service × location pages", () => {
    assert.deepEqual(
      LOCATION_HUB_DRAFTS.map((draft) => draft.locationId),
      LOCATIONS.slice(0, 6).map((location) => location.id),
    );
    for (const draft of LOCATION_HUB_DRAFTS) {
      const fields = locationDraftFields(draft);
      assert.equal(fields.page_type, "LOCATION");
      assert.equal(fields.status, "DRAFT");
      assert.equal(fields.indexable, false);
      assert.equal(fields.primary_service_id, null);
      assert.equal(draft.disposition.canonicalPath, `/home-services/${draft.locationId}`);
      assert.match(draft.h1, /^Home services in .+, NJ$/);
      assert.match(
        draft.primaryQuestion,
        /^What kinds of projects can A5 help coordinate in /,
      );
    }
  });

  it("updates Madison in place and creates the other five", () => {
    const madison = LOCATION_HUB_DRAFTS.find((draft) => draft.locationId === "madison");
    assert.ok(madison);
    assert.equal(madison.disposition.action, "update-in-place");
    assert.equal(madison.disposition.existingContentPageId, LIVE_MADISON_LOCATION_PAGE_ID);
    assert.equal(madison.disposition.canonicalPath, "/home-services/madison");
    const created = LOCATION_HUB_DRAFTS.filter((draft) => draft.disposition.action === "create");
    assert.equal(created.length, 5);
    assert.ok(created.every((draft) => draft.disposition.existingContentPageId === null));
  });

  it("uses one homeowner structure and keeps the towns distinct", () => {
    const answers = new Set<string>();
    const localContext = new Set<string>();
    const problemSets = new Set<string>();
    for (const draft of LOCATION_HUB_DRAFTS) {
      assert.ok(draft.directAnswer.length > 0);
      assert.ok(draft.metaTitle.length <= 62, draft.metaTitle);
      assert.ok(draft.metaDescription.length <= 170, draft.metaDescription);
      for (const heading of LOCATION_SECTION_HEADINGS) {
        assert.ok(headings(draft.sections).includes(heading), `${draft.locationId} ${heading}`);
      }
      answers.add(draft.directAnswer);
      localContext.add(sectionParagraphs(draft, "Local context").join("\n"));
      problemSets.add(draft.relatedProblemSlugs.join(","));
      const nearby = sectionParagraphs(draft, "Nearby areas A5 serves").join(" ");
      assert.match(nearby, /also coordinates/);
    }
    assert.equal(answers.size, 6);
    assert.equal(localContext.size, 6);
    assert.equal(problemSets.size, 6);
    const florham = LOCATION_HUB_DRAFTS.find((draft) => draft.locationId === "florham-park");
    assert.ok(florham);
    assert.equal(florham.directAnswer.includes("1899"), false);
    assert.match(sectionParagraphs(florham, "Local context").join(" "), /1899/);
  });

  it("links services and published problems, and keeps other towns secondary", () => {
    for (const draft of LOCATION_HUB_DRAFTS) {
      for (const slug of draft.relatedProblemSlugs) {
        assert.ok(PUBLISHED_PROBLEM_SLUGS.has(slug), slug);
        assert.ok(slug.length > 0);
      }
      assert.ok(draft.relatedProblemSlugs.length >= 3);
      assert.ok(draft.relatedProblemSlugs.length <= 5);
      for (const service of SERVICES) {
        assert.ok(draft.linkPaths.includes(`/services/${service.slug}`));
      }
      assert.equal(
        draft.linkPaths.some((path) => path.startsWith("/home-services/")),
        false,
      );
      assert.equal(draft.nearbyLocationPaths.length, 5);
      assert.equal(
        draft.nearbyLocationPaths.includes(`/home-services/${draft.locationId}`),
        false,
      );
      for (const path of draft.linkPaths) {
        const serviceLocation = path.match(/^\/([^/]+)\/([^/]+)$/);
        if (!serviceLocation) continue;
        const [, first, second] = serviceLocation;
        const isService = SERVICES.some((service) => service.slug === second);
        const isTown = LOCATIONS.some((location) => location.slug === first);
        if (isTown && isService) {
          assert.equal(path, "/madison/masonry");
        }
      }
    }
    const madison = LOCATION_HUB_DRAFTS.find((draft) => draft.locationId === "madison");
    assert.ok(madison?.linkPaths.includes("/madison/masonry"));
    assert.match(textOf(madison!), /\/madison\/masonry/);
    for (const draft of LOCATION_HUB_DRAFTS) {
      if (draft.locationId === "madison") continue;
      assert.equal(textOf(draft).includes(`/${draft.locationId}/`), false);
    }
  });

  it("keeps the municipal distinctions in homeowner language", () => {
    const chatham = textOf(LOCATION_HUB_DRAFTS.find((draft) => draft.locationId === "chatham")!);
    assert.match(chatham, /Chatham Borough/);
    assert.match(chatham, /Chatham Township/);
    assert.match(chatham, /54 Fairmount Avenue/);
    assert.match(chatham, /58 Meyersville Road/);
    const township = textOf(
      LOCATION_HUB_DRAFTS.find((draft) => draft.locationId === "morris-township")!,
    );
    const town = textOf(LOCATION_HUB_DRAFTS.find((draft) => draft.locationId === "morristown")!);
    assert.match(township, /50 Woodland Avenue/);
    assert.match(township, /not the Town of Morristown/);
    assert.match(town, /200 South Street/);
    assert.match(town, /Town of Morristown/);
    assert.match(town, /Morris Township/);
    const east = textOf(LOCATION_HUB_DRAFTS.find((draft) => draft.locationId === "east-hanover")!);
    assert.match(east, /does not mean a particular property floods/);
  });

  it("keeps municipal claims inside the cited pages and out of internal commentary", () => {
    for (const draft of LOCATION_HUB_DRAFTS) {
      const body = textOf(draft);
      for (const pattern of INTERNAL_LANGUAGE) {
        assert.equal(pattern.test(body), false, `${draft.locationId} ${pattern}`);
      }
      assert.ok(draft.claimsToVerify.length > 0);
      for (const claim of draft.claimsToVerify) {
        assert.match(claim.sourceUrl, /^https:\/\//);
        assert.ok(claim.exactSupportedClaim.length > 40);
        assert.ok(body.includes(claim.claim.slice(0, 40)));
      }
      const result = validateForPublication({
        page: {
          ...locationDraftFields(draft),
          cost_methodology: null,
          public_project_approved: false,
        },
        sources: draft.claimsToVerify.map((claim) => ({
          url: claim.sourceUrl,
          source_type: "GOVERNMENT" as const,
        })),
      });
      assert.equal(result.valid, true, JSON.stringify(result));
    }
  });
});
