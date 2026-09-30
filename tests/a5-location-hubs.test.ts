import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LOCATIONS } from "../config/locations.ts";
import { SERVICES } from "../config/services.ts";
import {
  LOCATION_BATCH_PROBLEM_SLUGS,
  LOCATION_HUB_DRAFTS,
} from "../src/lib/authority/drafts/locations.ts";
import {
  LIVE_MADISON_LOCATION_PAGE_ID,
  locationDraftFields,
} from "../src/lib/authority/drafts/types.ts";
import type { ContentSection } from "../src/lib/authority/types.ts";
import { validateForPublication } from "../src/lib/authority/validate.ts";

const PUBLISHED_PROBLEM_SLUGS = new Set<string>(LOCATION_BATCH_PROBLEM_SLUGS);

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

describe("location hub drafts", () => {
  it("covers the six registry towns and no service × location pages", () => {
    assert.deepEqual(
      LOCATION_HUB_DRAFTS.map((draft) => draft.locationId),
      LOCATIONS.map((location) => location.id),
    );
    for (const draft of LOCATION_HUB_DRAFTS) {
      const fields = locationDraftFields(draft);
      assert.equal(fields.page_type, "LOCATION");
      assert.equal(fields.status, "DRAFT");
      assert.equal(fields.indexable, false);
      assert.equal(fields.primary_service_id, null);
      assert.equal(draft.disposition.canonicalPath, `/home-services/${draft.locationId}`);
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

  it("keeps each town's question, answer, and headings distinct", () => {
    for (const field of ["h1", "primaryQuestion", "directAnswer", "metaDescription"] as const) {
      assert.equal(
        new Set(LOCATION_HUB_DRAFTS.map((draft) => draft[field])).size,
        6,
        field,
      );
    }
    const seen = new Map<string, string>();
    for (const draft of LOCATION_HUB_DRAFTS) {
      assert.ok(draft.primaryQuestion.length > 0);
      assert.ok(draft.directAnswer.length > 0);
      assert.ok(draft.metaTitle.length <= 62, draft.metaTitle);
      assert.ok(draft.metaDescription.length <= 170, draft.metaDescription);
      for (const heading of headings(draft.sections)) {
        const owner = seen.get(heading);
        assert.equal(owner, undefined, `"${heading}" is used by ${owner} and ${draft.locationId}`);
        seen.set(heading, draft.locationId);
      }
    }
  });

  it("links only published problems and does not invent town-and-trade URLs", () => {
    for (const draft of LOCATION_HUB_DRAFTS) {
      for (const slug of draft.relatedProblemSlugs) {
        assert.ok(PUBLISHED_PROBLEM_SLUGS.has(slug), slug);
      }
      for (const path of draft.linkPaths) {
        assert.equal(path.includes("damaged-brick-walkway"), false);
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
    assert.ok(madison?.linkPaths.includes("/guides/why-brick-steps-crack"));
    for (const draft of LOCATION_HUB_DRAFTS) {
      if (draft.locationId === "madison") continue;
      assert.equal(
        draft.linkPaths.some((path) => path.startsWith(`/${draft.locationId}/`)),
        false,
      );
    }
  });

  it("separates Chatham's two municipalities and Morristown from Morris Township", () => {
    const chatham = textOf(
      LOCATION_HUB_DRAFTS.find((draft) => draft.locationId === "chatham")!,
    );
    assert.match(chatham, /Chatham Borough/);
    assert.match(chatham, /Chatham Township/);
    assert.match(chatham, /54 Fairmount Avenue/);
    assert.match(chatham, /58 Meyersville Road/);
    const township = textOf(
      LOCATION_HUB_DRAFTS.find((draft) => draft.locationId === "morris-township")!,
    );
    const town = textOf(
      LOCATION_HUB_DRAFTS.find((draft) => draft.locationId === "morristown")!,
    );
    assert.match(township, /50 Woodland Avenue/);
    assert.match(town, /200 South Street/);
    assert.match(town, /not the township/i);
  });

  it("keeps municipal claims inside the cited pages and out of booster copy", () => {
    for (const draft of LOCATION_HUB_DRAFTS) {
      const body = textOf(draft);
      assert.equal(/\bwe\b/i.test(body), false, draft.locationId);
      assert.equal(/best place/i.test(body), false, draft.locationId);
      assert.equal(/\$/.test(body), false, draft.locationId);
      assert.equal(/Novartis|Nabisco/i.test(body), false, draft.locationId);
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
