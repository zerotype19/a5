import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { featureFlags } from "../src/lib/feature-flags.ts";
import { buildSitemapEntries } from "../src/lib/authority/sitemap.ts";
import { G001_BRICK_STEP_PAGE_ID } from "../src/lib/authority/drafts/types.ts";
import {
  APPROVED_SOURCES,
  buildTranchePublicationPlan,
} from "../src/lib/authority/tranche-publication.ts";
import { problemCanonicalRedirect } from "../src/lib/authority/urls.ts";
import { validateForPublication } from "../src/lib/authority/validate.ts";

const plan = buildTranchePublicationPlan();

describe("approved authority tranche", () => {
  it("publishes exactly the 22 approved pages and no extra problem entities", () => {
    assert.equal(plan.pages.length, 22);
    assert.equal(plan.pages.filter((page) => page.page_type === "SERVICE").length, 8);
    assert.equal(plan.pages.filter((page) => page.page_type === "PROBLEM").length, 14);
    assert.equal(plan.pages.filter((page) => page.action === "insert").length, 13);
    const brick = plan.pages.filter((page) => page.slug === "brick-step-repair");
    assert.equal(brick.length, 1);
    assert.equal(brick[0]?.id, G001_BRICK_STEP_PAGE_ID);
    assert.equal(brick[0]?.action, "update-existing");
    assert.equal(brick[0]?.primary_service_id, "masonry");
    for (const page of plan.pages) {
      assert.equal(page.status, "PUBLISHED");
      assert.equal(page.indexable, true);
      assert.ok(page.primary_question.length > 0);
      assert.ok(page.direct_answer.length > 0);
      const result = validateForPublication({
        page: {
          ...page,
          cost_methodology: null,
          public_project_approved: false,
        },
        relatedServiceIds:
          page.page_type === "PROBLEM" ? [page.primary_service_id] : undefined,
        sources: [...APPROVED_SOURCES],
      });
      assert.equal(result.valid, true, JSON.stringify(result));
    }
  });

  it("keeps water-damaged-ceiling on drywall and links plumbing and painting as relationships", () => {
    const page = plan.pages.find((item) => item.slug === "water-damaged-ceiling");
    assert.ok(page);
    assert.equal(page.primary_service_id, "drywall");
    assert.equal(page.action, "insert");
    const outbound = plan.relationships.filter((rel) => rel.from_page_id === page.id);
    const targets = new Set(outbound.map((rel) => rel.to_page_id));
    assert.equal(targets.has("20000000-0000-4000-8000-000000000004"), true);
    assert.equal(targets.has("20000000-0000-4000-8000-000000000006"), true);
    assert.equal(targets.has("20000000-0000-4000-8000-000000000003"), true);
    assert.equal(
      plan.pages.filter((item) => item.slug === "water-damaged-ceiling").length,
      1,
    );
  });

  it("links only published tranche targets", () => {
    const ids = new Set(plan.pages.map((page) => page.id));
    for (const rel of plan.relationships) {
      assert.equal(ids.has(rel.from_page_id), true);
      assert.equal(ids.has(rel.to_page_id), true);
      assert.notEqual(rel.from_page_id, rel.to_page_id);
    }
    const serialized = JSON.stringify(plan.relationships);
    assert.equal(serialized.includes("damaged-brick-walkway"), false);
    assert.equal(serialized.includes("why-brick-steps-crack"), false);
  });

  it("attaches only the approved source URLs", () => {
    const urls = new Set(APPROVED_SOURCES.map((source) => source.url));
    assert.equal(plan.sources.length, 8);
    for (const source of plan.sources) {
      assert.equal(urls.has(source.url), true);
    }
    assert.ok(plan.sourceLinks.length > 0);
  });

  it("lists each approved URL once in the sitemap", () => {
    const entries = buildSitemapEntries(
      plan.pages.map((page) => ({
        ...page,
        problem_slug: page.page_type === "PROBLEM" ? page.slug : null,
      })),
    );
    const paths = entries.map((entry) => new URL(entry.url).pathname);
    const content = paths.filter((path) => path.startsWith("/services/"));
    assert.equal(content.length, 22);
    assert.equal(content.filter((path) => path.endsWith("/brick-step-repair")).length, 1);
    assert.deepEqual(
      content.filter((path) => path.includes("water-damaged-ceiling")),
      ["/services/drywall/water-damaged-ceiling"],
    );
  });

  it("redirects a non-primary problem URL to the drywall canonical", () => {
    assert.equal(
      problemCanonicalRedirect({
        requestedService: "plumbing",
        primaryServiceId: "drywall",
        canonicalPath: "/services/drywall/water-damaged-ceiling",
      }),
      "/services/drywall/water-damaged-ceiling",
    );
    assert.equal(
      problemCanonicalRedirect({
        requestedService: "drywall",
        primaryServiceId: "drywall",
        canonicalPath: "/services/drywall/water-damaged-ceiling",
      }),
      null,
    );
  });

  it("does not turn on programmatic publishing", () => {
    assert.equal(featureFlags.programmaticPublishing, false);
  });
});
