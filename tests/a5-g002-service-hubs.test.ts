import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { LOCATIONS } from "../config/locations.ts";
import { SERVICES, type ServiceId } from "../config/services.ts";
import {
  SERVICE_HUBS,
  SERVICE_RESEARCH,
  hubToContentPage,
  multiServiceProblems,
  problemsForService,
} from "../src/lib/authority/service-hubs.ts";
import { renderG002SeedSql } from "../src/lib/authority/service-hub-seed.ts";
import {
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildServiceSchema,
  schemaContainsForbiddenClaims,
} from "../src/lib/authority/schema.ts";
import { buildCanonicalUrl } from "../src/lib/authority/urls.ts";
import { validateForPublication } from "../src/lib/authority/validate.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const seed = readFileSync(
  join(root, "supabase", "seeds", "a5_g002_service_hubs.sql"),
  "utf8",
);
const g001Seed = readFileSync(
  join(root, "supabase", "seeds", "a5_g001_authority_fixtures.sql"),
  "utf8",
);
const homepage = readFileSync(join(root, "src/app/page.tsx"), "utf8");
const serviceCard = readFileSync(
  join(root, "src/components/ServiceCard.tsx"),
  "utf8",
);
const footer = readFileSync(join(root, "src/components/Footer.tsx"), "utf8");

const FORBIDDEN = [
  /\bbest\b/i,
  /top-rated/i,
  /#1/,
  /thousands served/i,
  /same-day/i,
  /\b24\/7\b/i,
  /guaranteed/i,
  /fully vetted/i,
  /background checked/i,
  /licensed and insured/i,
];

function pageText(serviceId: ServiceId): string {
  const hub = SERVICE_HUBS.find((item) => item.serviceId === serviceId);
  assert.ok(hub);
  return JSON.stringify({
    title: hub.title,
    h1: hub.h1,
    meta: hub.metaDescription,
    answer: hub.directAnswer,
    sections: hub.sections,
  });
}

describe("A5-G002 service hubs", () => {
  it("creates exactly the eight registry services and no others", () => {
    assert.equal(SERVICE_HUBS.length, 8);
    assert.deepEqual(
      SERVICE_HUBS.map((hub) => hub.serviceId),
      SERVICES.map((service) => service.id),
    );
    for (const hub of SERVICE_HUBS) {
      assert.equal(hub.slug, hub.serviceId);
      assert.equal(hub.primaryQuestion.startsWith("What can A5 help with for "), true);
    }
  });

  it("keeps hubs in REVIEW and not indexable", () => {
    for (const hub of SERVICE_HUBS) {
      const page = hubToContentPage(hub);
      assert.equal(page.status, "REVIEW");
      assert.equal(page.indexable, false);
      assert.equal(page.page_type, "SERVICE");
      assert.equal(page.primary_location_id, null);
    }
    assert.doesNotMatch(seed, /'PUBLISHED'/);
    assert.match(seed, /'REVIEW'/);
  });

  it("passes the publication validator for each hub", () => {
    const slugs = SERVICE_HUBS.map((hub) => hub.slug);
    for (const hub of SERVICE_HUBS) {
      const page = hubToContentPage(hub);
      const ready = validateForPublication({
        page,
        otherSlugsForType: slugs.filter((slug) => slug !== hub.slug),
      });
      assert.equal(ready.valid, true, JSON.stringify(ready));

      const indexedTooEarly = validateForPublication({
        page: { ...page, indexable: true },
      });
      assert.equal(indexedTooEarly.valid, false);

      const ownerCouldPublish = validateForPublication({
        page: { ...page, status: "PUBLISHED", indexable: true },
        otherSlugsForType: slugs.filter((slug) => slug !== hub.slug),
      });
      assert.equal(ownerCouldPublish.valid, true);
    }
  });

  it("differentiates hubs and avoids unsupported claims", () => {
    const answers = new Set(SERVICE_HUBS.map((hub) => hub.directAnswer));
    const intros = new Set(
      SERVICE_HUBS.map((hub) => {
        const intro = hub.sections.find((section) => section.type === "INTRO");
        assert.ok(intro && intro.type === "INTRO");
        return intro.body;
      }),
    );
    assert.equal(answers.size, 8);
    assert.equal(intros.size, 8);
    const masonry = pageText("masonry");
    const drywall = pageText("drywall");
    assert.notEqual(masonry, drywall);
    assert.match(masonry, /mortar|paver|brick/i);
    assert.match(drywall, /patch|ceiling|hole/i);
    for (const service of SERVICES) {
      const text = pageText(service.id);
      for (const pattern of FORBIDDEN) {
        assert.doesNotMatch(text, pattern);
      }
    }
    assert.match(pageText("plumbing"), /does not offer emergency/i);
    assert.match(pageText("electrical"), /does not offer emergency/i);
    assert.match(pageText("handyman"), /regulated plumbing or electrical/i);
    assert.match(pageText("tile"), /not a specialty restoration|specialty restoration/i);
  });

  it("stores 4–8 problems per service and a multi-service ceiling problem", () => {
    for (const service of SERVICES) {
      const count = problemsForService(service.id).length;
      assert.ok(count >= 4 && count <= 8, `${service.id} has ${count}`);
    }
    const shared = multiServiceProblems();
    assert.ok(shared.some((problem) => problem.slug === "water-damaged-ceiling"));
    const ceiling = shared.find((problem) => problem.slug === "water-damaged-ceiling");
    assert.deepEqual(
      [...(ceiling?.serviceIds ?? [])].sort(),
      ["drywall", "painting", "plumbing"],
    );
    assert.equal(
      seed.includes("page_type") && seed.includes("'PROBLEM'"),
      false,
    );
    assert.doesNotMatch(seed, /SERVICE_LOCATION/);
    assert.match(seed, /No content_relationships/);
  });

  it("keeps the G001 seed draft and updates masonry in place", () => {
    assert.match(g001Seed, /'DRAFT'/);
    assert.doesNotMatch(g001Seed, /'PUBLISHED'/);
    assert.match(seed, /10000000-0000-4000-8000-000000000001/);
    assert.equal(renderG002SeedSql(), seed);
  });

  it("points homepage and footer service links at hubs and keeps the primary CTA", () => {
    assert.match(homepage, /href="\/request-service"/);
    assert.match(homepage, /href=\{`\/services\/\$\{service\.slug\}`\}/);
    assert.match(serviceCard, /href=\{`\/services\/\$\{service\.slug\}`\}/);
    assert.doesNotMatch(serviceCard, /href="\/request-service"/);
    assert.match(footer, /href=\{`\/services\/\$\{service\.slug\}`\}/);
    for (const service of SERVICES) {
      assert.match(seed, new RegExp(`'${service.slug}'`));
    }
    assert.equal(LOCATIONS.length, 6);
  });

  it("builds truthful service schema without reviews or offers", () => {
    for (const hub of SERVICE_HUBS) {
      const path = `/services/${hub.slug}`;
      const schema = buildServiceSchema({
        serviceId: hub.serviceId,
        path,
        description: hub.metaDescription,
      });
      assert.ok(schema);
      assert.equal(schema["@type"], "Service");
      assert.equal(schema.url, buildCanonicalUrl(path));
      assert.deepEqual(schemaContainsForbiddenClaims(schema), []);
      assert.equal(JSON.stringify(schema).includes('"Offer"'), false);
      const org = buildOrganizationSchema();
      const crumbs = buildBreadcrumbSchema([
        { name: "Home", path: "/" },
        { name: hub.h1, path },
      ]);
      assert.equal(org["@type"], "Organization");
      assert.equal(crumbs["@type"], "BreadcrumbList");
      assert.equal(hub.metaTitle.length > 0, true);
      assert.notEqual(hub.metaTitle, hub.h1);
    }
  });

  it("records research and planned pages without creating them", () => {
    for (const service of SERVICES) {
      const research = SERVICE_RESEARCH[service.id];
      assert.equal(research.serviceId, service.id);
      assert.ok(research.plannedProblemPages.length >= 3);
      assert.equal(research.claimsRequiringSources.length, 0);
    }
    const cta = SERVICE_HUBS[0]?.sections.find((section) => section.type === "CTA");
    assert.ok(cta && cta.type === "CTA");
    assert.equal(cta.title, "Get Help With a Project");
  });
});
