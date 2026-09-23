import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { LOCATIONS } from "../config/locations.ts";
import { SERVICES } from "../config/services.ts";
import { SITE } from "../config/site.ts";
import {
  ALL_PROOF_FIXTURES,
  FIXTURE_COMPARISON_CONTRACT,
  FIXTURE_CONTENT_SOURCES,
  FIXTURE_COST_GUIDE_CONTRACT,
  FIXTURE_GUIDE_PAGE,
  FIXTURE_LOCATION_PAGE,
  FIXTURE_PROBLEM,
  FIXTURE_PROBLEM_PAGE,
  FIXTURE_PROBLEM_SERVICE_IDS,
  FIXTURE_PROJECT_CONTRACT,
  FIXTURE_RELATIONSHIPS,
  FIXTURE_SERVICE_LOCATION_PAGE,
  FIXTURE_SERVICE_PAGE,
  FIXTURE_SOURCE,
} from "../src/lib/authority/fixtures.ts";
import { hydrateFromMemory } from "../src/lib/authority/query.ts";
import {
  AUTHORITY_PUBLIC_TABLES,
  assertAuthorityQueryIsPublic,
} from "../src/lib/authority/query.ts";
import {
  findOrphanIndexablePages,
  resolveRelatedContent,
} from "../src/lib/authority/linking.ts";
import { buildContentMetadata } from "../src/lib/authority/metadata.ts";
import { buildBreadcrumbs } from "../src/lib/authority/breadcrumbs.ts";
import {
  AUTHORITY_REGISTRIES,
  isContentPageType,
  isContentStatus,
} from "../src/lib/authority/registry.ts";
import {
  resolveProblemRoute,
  resolveServiceLocationRoute,
  resolveServiceRoute,
  pageMatchesRoute,
} from "../src/lib/authority/resolve.ts";
import {
  buildArticleSchema,
  buildBreadcrumbSchema,
  buildOrganizationSchema,
  buildServiceSchema,
  schemaContainsForbiddenClaims,
  serializeJsonLd,
} from "../src/lib/authority/schema.ts";
import { findSlugCollisions, isValidSlug, isValidSourceUrl } from "../src/lib/authority/slugs.ts";
import { buildSitemapEntries, CORE_SITEMAP_ROUTES } from "../src/lib/authority/sitemap.ts";
import {
  AUTHORITY_FORBIDDEN_FIELDS,
  AUTHORITY_FORBIDDEN_TABLES,
  publicProjectionHasForbiddenField,
} from "../src/lib/authority/privacy.ts";
import {
  buildCanonicalUrl,
  buildContentPathFromRecord,
  RESERVED_ROOT_SEGMENTS,
} from "../src/lib/authority/urls.ts";
import {
  isPubliclyReadable,
  isSitemapEligible,
  robotsForPublicPage,
  validateForPublication,
} from "../src/lib/authority/validate.ts";
import { AUTHORITY_TABLES } from "../src/lib/db/schema.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

describe("A5-G001 authority registries", () => {
  it("exposes one canonical page type vocabulary", () => {
    assert.deepEqual(AUTHORITY_REGISTRIES.pageTypes, [
      "SERVICE",
      "LOCATION",
      "SERVICE_LOCATION",
      "PROBLEM",
      "GUIDE",
      "COST_GUIDE",
      "COMPARISON",
      "PROJECT",
      "CORE",
    ]);
    assert.equal(isContentPageType("SERVICE"), true);
    assert.equal(isContentPageType("BLOG"), false);
  });

  it("exposes one canonical content status vocabulary", () => {
    assert.deepEqual(AUTHORITY_REGISTRIES.contentStatuses, [
      "IDEA",
      "DRAFT",
      "REVIEW",
      "APPROVED",
      "PUBLISHED",
      "ARCHIVED",
    ]);
    assert.equal(isContentStatus("DRAFT"), true);
  });
});

describe("A5-G001 slug + source URL validation", () => {
  it("accepts lowercase hyphenated slugs", () => {
    assert.equal(isValidSlug("brick-step-repair"), true);
    assert.equal(isValidSlug("Madison"), false);
    assert.equal(isValidSlug("a--b"), false);
  });

  it("detects slug collisions without inventing suffixes", () => {
    assert.deepEqual(findSlugCollisions(["a", "b", "a"]), ["a"]);
  });

  it("rejects javascript: and data: source URLs", () => {
    assert.equal(isValidSourceUrl("https://example.com/x"), true);
    assert.equal(isValidSourceUrl("javascript:alert(1)"), false);
    assert.equal(isValidSourceUrl("data:text/html,hi"), false);
  });
});

describe("A5-G001 publication validation", () => {
  it("validates SERVICE requires registry service", () => {
    const ok = validateForPublication({ page: FIXTURE_SERVICE_PAGE });
    assert.equal(ok.valid, true);

    const bad = validateForPublication({
      page: { ...FIXTURE_SERVICE_PAGE, primary_service_id: null },
    });
    assert.equal(bad.valid, false);
    if (!bad.valid) {
      assert.ok(bad.issues.some((i) => i.code === "service_required"));
    }
  });

  it("validates LOCATION requires registry location", () => {
    const ok = validateForPublication({ page: FIXTURE_LOCATION_PAGE });
    assert.equal(ok.valid, true);
  });

  it("validates SERVICE_LOCATION requires service + location", () => {
    const ok = validateForPublication({ page: FIXTURE_SERVICE_LOCATION_PAGE });
    assert.equal(ok.valid, true);
    const bad = validateForPublication({
      page: {
        ...FIXTURE_SERVICE_LOCATION_PAGE,
        primary_location_id: null,
      },
    });
    assert.equal(bad.valid, false);
  });

  it("validates PROBLEM requires problem + related service", () => {
    const ok = validateForPublication({
      page: FIXTURE_PROBLEM_PAGE,
      relatedServiceIds: [...FIXTURE_PROBLEM_SERVICE_IDS],
    });
    assert.equal(ok.valid, true);

    const bad = validateForPublication({
      page: FIXTURE_PROBLEM_PAGE,
      relatedServiceIds: [],
    });
    assert.equal(bad.valid, false);
  });

  it("validates COST_GUIDE requires methodology, review date, sources", () => {
    const bad = validateForPublication({
      page: { ...FIXTURE_COST_GUIDE_CONTRACT, cost_methodology: null },
      sources: [FIXTURE_SOURCE],
    });
    assert.equal(bad.valid, false);

    const ok = validateForPublication({
      page: FIXTURE_COST_GUIDE_CONTRACT,
      sources: [FIXTURE_SOURCE],
    });
    assert.equal(ok.valid, true);
  });

  it("validates PROJECT requires public_project_approved", () => {
    const bad = validateForPublication({ page: FIXTURE_PROJECT_CONTRACT });
    assert.equal(bad.valid, false);
    const ok = validateForPublication({
      page: { ...FIXTURE_PROJECT_CONTRACT, public_project_approved: true },
    });
    assert.equal(ok.valid, true);
  });

  it("rejects slug collisions", () => {
    const result = validateForPublication({
      page: FIXTURE_GUIDE_PAGE,
      otherSlugsForType: ["why-brick-steps-crack"],
    });
    assert.equal(result.valid, false);
    if (!result.valid) {
      assert.ok(result.issues.some((i) => i.code === "slug_collision"));
    }
  });

  it("keeps publication and indexability separate", () => {
    assert.equal(
      isSitemapEligible({ status: "PUBLISHED", indexable: false }),
      false,
    );
    assert.equal(
      isSitemapEligible({ status: "PUBLISHED", indexable: true }),
      true,
    );
    assert.equal(isPubliclyReadable({ status: "DRAFT" }), false);
    assert.equal(isPubliclyReadable({ status: "PUBLISHED" }), true);
    assert.deepEqual(
      robotsForPublicPage({ status: "PUBLISHED", indexable: false }),
      { index: false, follow: true },
    );
  });

  it("rejects indexable without PUBLISHED", () => {
    const result = validateForPublication({
      page: { ...FIXTURE_SERVICE_PAGE, indexable: true },
    });
    assert.equal(result.valid, false);
  });
});

describe("A5-G001 URL + registry integration", () => {
  it("builds paths from registry slugs (not invented madison-nj)", () => {
    assert.equal(
      buildContentPathFromRecord(FIXTURE_SERVICE_PAGE),
      "/services/masonry",
    );
    assert.equal(
      buildContentPathFromRecord(FIXTURE_LOCATION_PAGE),
      "/home-services/madison",
    );
    assert.equal(
      buildContentPathFromRecord(FIXTURE_SERVICE_LOCATION_PAGE),
      "/madison/masonry",
    );
    assert.equal(
      buildContentPathFromRecord(FIXTURE_PROBLEM_PAGE, FIXTURE_PROBLEM.slug),
      "/services/masonry/brick-step-repair",
    );
    assert.equal(
      buildContentPathFromRecord(FIXTURE_GUIDE_PAGE),
      "/guides/why-brick-steps-crack",
    );
  });

  it("canonical URLs always use SITE domain", () => {
    const url = buildCanonicalUrl("/services/masonry?utm_source=x");
    assert.equal(url, "https://www.a5homeservices.com/services/masonry");
    assert.ok(url.startsWith(SITE.url.replace(/\/$/, "")));
  });

  it("does not collide reserved roots with location slugs", () => {
    for (const location of LOCATIONS) {
      assert.equal(RESERVED_ROOT_SEGMENTS.has(location.slug), false);
    }
    assert.ok(RESERVED_ROOT_SEGMENTS.has("request-service"));
    assert.ok(RESERVED_ROOT_SEGMENTS.has("admin"));
  });

  it("resolves valid service/location routes and rejects invalid combos", () => {
    assert.equal(resolveServiceRoute("masonry").ok, true);
    assert.equal(resolveServiceRoute("hvac").ok, false);
    assert.equal(resolveServiceLocationRoute("madison", "masonry").ok, true);
    assert.equal(resolveServiceLocationRoute("madison", "hvac").ok, false);
    assert.equal(resolveServiceLocationRoute("admin", "masonry").ok, false);
    assert.equal(resolveProblemRoute("masonry", "brick-step-repair").ok, true);
  });

  it("ties proof fixtures to approved service/location registries only", () => {
    const serviceIds = new Set(SERVICES.map((s) => s.id));
    const locationIds = new Set(LOCATIONS.map((l) => l.id));
    for (const page of ALL_PROOF_FIXTURES) {
      if (page.primary_service_id) {
        assert.ok(serviceIds.has(page.primary_service_id as never));
      }
      if (page.primary_location_id) {
        assert.ok(locationIds.has(page.primary_location_id as never));
      }
    }
    assert.equal(ALL_PROOF_FIXTURES.length, 5);
  });
});

describe("A5-G001 metadata / breadcrumbs / structured data", () => {
  it("generates metadata with canonical and robots", () => {
    const published = {
      ...FIXTURE_SERVICE_PAGE,
      status: "PUBLISHED" as const,
      indexable: true,
    };
    const meta = buildContentMetadata({
      page: published,
      path: "/services/masonry",
    });
    assert.equal(meta.alternates?.canonical, "https://www.a5homeservices.com/services/masonry");
    assert.deepEqual(meta.robots, { index: true, follow: true });
    assert.equal(
      (meta.openGraph as { siteName?: string })?.siteName,
      SITE.name,
    );
  });

  it("builds breadcrumbs for SERVICE and PROBLEM", () => {
    const serviceCrumbs = buildBreadcrumbs(FIXTURE_SERVICE_PAGE);
    assert.equal(serviceCrumbs[0]?.path, "/");
    assert.equal(serviceCrumbs.at(-1)?.path, "/services/masonry");

    const problemCrumbs = buildBreadcrumbs(FIXTURE_PROBLEM_PAGE, {
      problemSlug: FIXTURE_PROBLEM.slug,
      problemName: FIXTURE_PROBLEM.name,
    });
    assert.ok(problemCrumbs.some((c) => c.path === "/services/masonry"));
  });

  it("Organization schema derives from SITE without fake ratings/address", () => {
    const org = buildOrganizationSchema();
    assert.equal(org.name, SITE.name);
    assert.equal(org.telephone, SITE.phone);
    assert.deepEqual(schemaContainsForbiddenClaims(org), []);

    const service = buildServiceSchema({
      serviceId: "masonry",
      path: "/services/masonry",
    });
    assert.ok(service);
    assert.deepEqual(schemaContainsForbiddenClaims(service!), []);

    const article = buildArticleSchema({
      title: "Why Brick Steps Crack",
      path: "/guides/why-brick-steps-crack",
    });
    assert.equal(
      (article.author as { name: string }).name,
      SITE.name,
    );

    const crumbs = buildBreadcrumbSchema(
      buildBreadcrumbs(FIXTURE_GUIDE_PAGE),
    );
    assert.equal(crumbs["@type"], "BreadcrumbList");
    assert.match(serializeJsonLd(org), /A5 Home Services/);
    assert.doesNotMatch(serializeJsonLd(org), /</);
  });
});

describe("A5-G001 sitemap", () => {
  it("includes core routes and only PUBLISHED+indexable content", () => {
    const draftEntries = buildSitemapEntries(ALL_PROOF_FIXTURES);
    assert.equal(draftEntries.length, CORE_SITEMAP_ROUTES.length);

    const published = ALL_PROOF_FIXTURES.map((page) => ({
      ...page,
      status: "PUBLISHED" as const,
      indexable: true,
      problem_slug:
        page.page_type === "PROBLEM" ? page.slug : undefined,
    }));
    const entries = buildSitemapEntries(published);
    assert.ok(entries.length > CORE_SITEMAP_ROUTES.length);
    assert.ok(
      entries.some((e) =>
        String(e.url).endsWith("/services/masonry"),
      ),
    );
    assert.ok(!entries.some((e) => String(e.url).includes("/admin")));
  });
});

describe("A5-G001 internal linking + orphans", () => {
  it("excludes unpublished related content from public links", () => {
    const pagesById = new Map(
      ALL_PROOF_FIXTURES.map((page) => [page.id, page]),
    );
    const links = resolveRelatedContent({
      fromPageId: FIXTURE_SERVICE_PAGE.id,
      relationships: FIXTURE_RELATIONSHIPS,
      pagesById,
      publicOnly: true,
    });
    assert.equal(links.length, 0);

    const publishedMap = new Map(
      ALL_PROOF_FIXTURES.map((page) => [
        page.id,
        { ...page, status: "PUBLISHED" as const },
      ]),
    );
    const publicLinks = resolveRelatedContent({
      fromPageId: FIXTURE_SERVICE_PAGE.id,
      relationships: FIXTURE_RELATIONSHIPS,
      pagesById: publishedMap,
      problemSlugById: new Map([[FIXTURE_PROBLEM.id, FIXTURE_PROBLEM.slug]]),
      publicOnly: true,
    });
    assert.ok(publicLinks.length >= 1);
  });

  it("identifies orphan indexable pages without auto-publishing", () => {
    const pages = [
      {
        ...FIXTURE_SERVICE_PAGE,
        status: "PUBLISHED" as const,
        indexable: true,
      },
    ];
    const orphans = findOrphanIndexablePages({
      pages,
      relationships: [],
    });
    assert.equal(orphans.length, 1);
  });
});

describe("A5-G001 privacy boundary", () => {
  it("forbids operational tables and fields in public authority layer", () => {
    for (const table of AUTHORITY_FORBIDDEN_TABLES) {
      assert.ok(!(AUTHORITY_PUBLIC_TABLES as readonly string[]).includes(table));
    }
    assert.throws(() => assertAuthorityQueryIsPublic("customers"));
    assert.throws(() => assertAuthorityQueryIsPublic("leads"));
    assert.throws(() => assertAuthorityQueryIsPublic("admin_users"));
    assert.throws(() => assertAuthorityQueryIsPublic("project_photos"));
    assert.doesNotThrow(() => assertAuthorityQueryIsPublic("content_pages"));

    const projection = {
      id: "x",
      title: "Masonry",
      submission_key: "nope",
    };
    assert.ok(
      publicProjectionHasForbiddenField(projection).includes("submission_key"),
    );
    assert.ok(AUTHORITY_FORBIDDEN_FIELDS.includes("submission_key"));
  });

  it("hydrated public pages do not include operational PII fields", () => {
    const hydrated = hydrateFromMemory({
      page: { ...FIXTURE_GUIDE_PAGE, status: "PUBLISHED" },
      pages: ALL_PROOF_FIXTURES.map((p) => ({
        ...p,
        status: "PUBLISHED" as const,
      })),
      relationships: FIXTURE_RELATIONSHIPS,
      problems: [FIXTURE_PROBLEM],
      problemServices: [
        { problem_id: FIXTURE_PROBLEM.id, service_id: "masonry" },
      ],
      sources: [FIXTURE_SOURCE],
      contentSources: FIXTURE_CONTENT_SOURCES,
    });
    assert.equal(
      publicProjectionHasForbiddenField(
        hydrated as unknown as Record<string, unknown>,
      ).length,
      0,
    );
    assert.ok(hydrated.related_content.length >= 1);
  });
});

describe("A5-G001 route matching / 404 semantics", () => {
  it("matches SERVICE pages by primary_service_id", () => {
    const route = resolveServiceRoute("masonry");
    assert.ok(route.ok);
    if (route.ok) {
      assert.equal(pageMatchesRoute(FIXTURE_SERVICE_PAGE, route), true);
      assert.equal(pageMatchesRoute(FIXTURE_LOCATION_PAGE, route), false);
    }
  });

  it("rejects invalid service×problem combinations conceptually", () => {
    const route = resolveProblemRoute("plumbing", "brick-step-repair");
    assert.ok(route.ok);
    if (route.ok) {
      assert.equal(
        pageMatchesRoute(FIXTURE_PROBLEM_PAGE, route, {
          problemServiceIds: ["masonry"],
        }),
        false,
      );
    }
  });
});

describe("A5-G001 comparison/project contracts exist", () => {
  it("ships comparison and project contract fixtures without publishing them", () => {
    assert.equal(FIXTURE_COMPARISON_CONTRACT.page_type, "COMPARISON");
    assert.equal(FIXTURE_PROJECT_CONTRACT.page_type, "PROJECT");
    assert.equal(FIXTURE_PROJECT_CONTRACT.public_project_approved, false);
    assert.equal(FIXTURE_COMPARISON_CONTRACT.status, "DRAFT");
  });
});

describe("A5-G001 migration SQL", () => {
  it("ships additive authority migration with RLS for published-only content", () => {
    const migrationsDir = join(root, "supabase", "migrations");
    const fileName = readdirSync(migrationsDir)
      .filter((name) => name.includes("a5_g001"))
      .sort()[0];
    assert.ok(fileName);
    const sql = readFileSync(join(migrationsDir, fileName!), "utf8");
    for (const table of AUTHORITY_TABLES) {
      assert.match(sql, new RegExp(`create table public\\.${table}\\b`, "i"));
      assert.match(
        sql,
        new RegExp(
          `alter table public\\.${table} enable row level security`,
          "i",
        ),
      );
    }
    assert.match(sql, /status = 'PUBLISHED'/);
    assert.doesNotMatch(sql, /create table public\.customers\b/i);
    assert.doesNotMatch(sql, /alter table public\.leads\b/i);
    assert.doesNotMatch(sql, /drop table public\.leads\b/i);
  });

  it("keeps seed fixtures separate and DRAFT", () => {
    const seed = readFileSync(
      join(root, "supabase", "seeds", "a5_g001_authority_fixtures.sql"),
      "utf8",
    );
    assert.match(seed, /'DRAFT'/);
    assert.match(seed, /indexable[\s\S]*false/i);
    assert.doesNotMatch(seed, /'PUBLISHED'/);
  });
});
