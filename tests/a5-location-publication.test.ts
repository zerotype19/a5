import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { LOCATIONS } from "../config/locations.ts";
import { SERVICES } from "../config/services.ts";
import { LOCATION_BATCH_PROBLEM_SLUGS } from "../src/lib/authority/drafts/locations.ts";
import { LIVE_MADISON_LOCATION_PAGE_ID } from "../src/lib/authority/drafts/types.ts";
import {
  LIVE_BRICK_GUIDE_PAGE_ID,
  LIVE_MADISON_MASONRY_PAGE_ID,
  MUNICIPAL_SOURCES,
  NEW_LOCATION_PAGE_IDS,
  buildLocationPublicationPlan,
} from "../src/lib/authority/location-publication.ts";
import { buildSitemapEntries } from "../src/lib/authority/sitemap.ts";
import { LIVE_SERVICE_PAGE_IDS, NEW_PROBLEM_PAGE_IDS } from "../src/lib/authority/tranche-publication.ts";
import { validateForPublication } from "../src/lib/authority/validate.ts";

const PUBLISHED_PROBLEM_IDS = new Set([
  ...Object.values(NEW_PROBLEM_PAGE_IDS),
  "10000000-0000-4000-8000-000000000004",
]);

describe("location hub publication", () => {
  it("publishes exactly six location pages and no service × location rows", () => {
    const plan = buildLocationPublicationPlan();
    assert.equal(plan.pages.length, 6);
    assert.deepEqual(
      plan.pages.map((page) => page.primary_location_id),
      LOCATIONS.slice(0, 6).map((location) => location.id),
    );
    const madison = plan.pages.find((page) => page.slug === "madison");
    assert.equal(madison?.id, LIVE_MADISON_LOCATION_PAGE_ID);
    assert.equal(madison?.action, "update-existing");
    const inserts = plan.pages.filter((page) => page.action === "insert");
    assert.equal(inserts.length, 5);
    assert.deepEqual(
      inserts.map((page) => page.id).sort(),
      Object.values(NEW_LOCATION_PAGE_IDS).sort(),
    );
    for (const page of plan.pages) {
      assert.equal(page.page_type, "LOCATION");
      assert.equal(page.status, "PUBLISHED");
      assert.equal(page.indexable, true);
      assert.equal(page.primary_service_id, null);
      const result = validateForPublication({
        page: { ...page, cost_methodology: null },
        sources: [...MUNICIPAL_SOURCES],
      });
      assert.equal(result.valid, true, JSON.stringify(result));
    }
  });

  it("links only service hubs, published problems, the six towns, Madison masonry, and the brick guide", () => {
    const plan = buildLocationPublicationPlan();
    const allowed = new Set<string>([
      ...plan.pages.map((page) => page.id),
      ...Object.values(LIVE_SERVICE_PAGE_IDS),
      ...PUBLISHED_PROBLEM_IDS,
      LIVE_MADISON_MASONRY_PAGE_ID,
      LIVE_BRICK_GUIDE_PAGE_ID,
    ]);
    const keys = new Set<string>();
    for (const rel of plan.relationships) {
      assert.ok(allowed.has(rel.to_page_id), rel.to_page_id);
      assert.ok(plan.pages.some((page) => page.id === rel.from_page_id));
      keys.add(`${rel.from_page_id}:${rel.to_page_id}:${rel.relationship_type}`);
    }
    assert.equal(keys.size, plan.relationships.length);
    const serviceTargets = new Set(Object.values(LIVE_SERVICE_PAGE_IDS));
    for (const page of plan.pages) {
      const targets = plan.relationships
        .filter((rel) => rel.from_page_id === page.id && serviceTargets.has(rel.to_page_id))
        .map((rel) => rel.to_page_id);
      assert.equal(new Set(targets).size, SERVICES.length);
    }
    assert.equal(
      plan.relationships.filter((rel) => rel.to_page_id === LIVE_MADISON_MASONRY_PAGE_ID).length,
      1,
    );
    assert.equal(
      plan.relationships.some(
        (rel) =>
          rel.to_page_id === LIVE_MADISON_MASONRY_PAGE_ID &&
          rel.relationship_type !== "LOCAL_VARIANT",
      ),
      false,
    );
    for (const slug of LOCATION_BATCH_PROBLEM_SLUGS) {
      assert.ok(PUBLISHED_PROBLEM_IDS.has(NEW_PROBLEM_PAGE_IDS[slug] ?? "10000000-0000-4000-8000-000000000004") || slug === "brick-step-repair");
    }
  });

  it("attaches only the reviewed municipal sources and lists each town once", () => {
    const plan = buildLocationPublicationPlan();
    assert.equal(plan.sources.length, 7);
    assert.equal(new Set(plan.sources.map((source) => source.url)).size, 7);
    for (const source of plan.sources) {
      assert.match(source.url, /^https:\/\//);
      assert.equal(source.source_type, "GOVERNMENT");
    }
    const entries = buildSitemapEntries(plan.pages);
    const towns = entries
      .map((entry) => entry.url)
      .filter((url) => url.includes("/home-services/"));
    assert.deepEqual(
      towns,
      LOCATIONS.slice(0, 6).map((location) => `https://www.a5homeservices.com/home-services/${location.slug}`),
    );
  });
});
