/**
 * A5-G001 live non-prod authority/security matrix.
 * Run with env already loaded. Does not print secrets.
 * Restores fixtures to DRAFT / indexable=false at the end.
 */

import { createClient } from "@supabase/supabase-js";

const BASE = process.env.LIVE_BASE_URL ?? "http://127.0.0.1:43123";
const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

if (!url || !anon || !service) {
  console.error("MISSING_ENV");
  process.exit(1);
}

const anonClient = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const adminClient = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const FIXTURE_IDS = [
  "10000000-0000-4000-8000-000000000001",
  "10000000-0000-4000-8000-000000000002",
  "10000000-0000-4000-8000-000000000003",
  "10000000-0000-4000-8000-000000000004",
  "10000000-0000-4000-8000-000000000005",
];

const PATHS = {
  service: "/services/masonry",
  location: "/home-services/madison",
  serviceLocation: "/madison/masonry",
  problem: "/services/masonry/brick-step-repair",
  guide: "/guides/why-brick-steps-crack",
  unknownGuide: "/guides/does-not-exist-g001",
  invalidCombo: "/services/plumbing/brick-step-repair",
  invalidTown: "/springfield/masonry",
};

const rows = [];

function record(id, ok, detail) {
  rows.push({ id, ok, detail });
  console.log(`${ok ? "PASS" : "FAIL"} ${id} — ${detail}`);
}

async function http(path) {
  const res = await fetch(`${BASE}${path}`, { redirect: "manual" });
  const body = await res.text();
  return { status: res.status, body, headers: res.headers };
}

async function setStatus(status, indexable) {
  const published_at =
    status === "PUBLISHED" ? new Date().toISOString() : null;
  const { error } = await adminClient
    .from("content_pages")
    .update({ status, indexable, published_at })
    .in("id", FIXTURE_IDS);
  if (error) throw new Error(`update_failed:${error.message}`);
}

async function restoreDraft() {
  await setStatus("DRAFT", false);
}

async function main() {
  try {
    // Ensure starting state
    await restoreDraft();

    // 1. DRAFT + indexable=false → public URL unavailable, not in sitemap
    for (const [name, path] of Object.entries({
      service: PATHS.service,
      location: PATHS.location,
      serviceLocation: PATHS.serviceLocation,
      problem: PATHS.problem,
      guide: PATHS.guide,
    })) {
      const res = await http(path);
      record(
        `1-draft-404-${name}`,
        res.status === 404,
        `${path} status=${res.status}`,
      );
    }
    const sitemapDraft = await http("/sitemap.xml");
    record(
      "1-draft-sitemap-excludes",
      sitemapDraft.status === 200 &&
        !sitemapDraft.body.includes("/services/masonry") &&
        !sitemapDraft.body.includes("/guides/why-brick-steps-crack"),
      "sitemap excludes draft fixtures",
    );

    // Anon cannot read DRAFT
    const { data: anonDraft, error: anonDraftErr } = await anonClient
      .from("content_pages")
      .select("id, status")
      .eq("slug", "masonry");
    record(
      "1-rls-anon-draft-empty",
      !anonDraftErr && (anonDraft?.length ?? 0) === 0,
      `anon rows=${anonDraft?.length ?? 0} err=${anonDraftErr?.code ?? "none"}`,
    );

    // Service role can read drafts
    const { data: adminDraft, error: adminDraftErr } = await adminClient
      .from("content_pages")
      .select("id, status")
      .eq("slug", "masonry");
    record(
      "1-service-role-draft-visible",
      !adminDraftErr && (adminDraft?.length ?? 0) === 1,
      `admin rows=${adminDraft?.length ?? 0}`,
    );

    // 2. PUBLISHED + indexable=false
    await setStatus("PUBLISHED", false);
    const pubNoIndex = await http(PATHS.service);
    record(
      "2-published-noindex-readable",
      pubNoIndex.status === 200 &&
        pubNoIndex.body.includes("Masonry") &&
        (pubNoIndex.body.includes("noindex") ||
          pubNoIndex.body.includes("Published for review")),
      `status=${pubNoIndex.status}`,
    );
    // Check robots meta via HTML or note follow-only
    const sitemapNoIndex = await http("/sitemap.xml");
    record(
      "2-published-noindex-not-in-sitemap",
      !sitemapNoIndex.body.includes("/services/masonry"),
      "sitemap excludes published+indexable=false",
    );

    // 3. PUBLISHED + indexable=true (temporary)
    await setStatus("PUBLISHED", true);
    const pubIndex = await http(PATHS.guide);
    record(
      "3-published-indexable-renders",
      pubIndex.status === 200 &&
        pubIndex.body.includes("Why Brick Steps Crack") &&
        pubIndex.body.includes("application/ld+json") &&
        pubIndex.body.includes("A5 Home Services") &&
        pubIndex.body.includes("BreadcrumbList"),
      `status=${pubIndex.status}`,
    );
    record(
      "3-no-fake-ratings",
      !pubIndex.body.includes("aggregateRating") &&
        !pubIndex.body.includes("ratingValue") &&
        !pubIndex.body.includes("streetAddress"),
      "structured data has no fake ratings/address",
    );
    const sitemapIndex = await http("/sitemap.xml");
    record(
      "3-in-sitemap",
      sitemapIndex.body.includes("/guides/why-brick-steps-crack") &&
        sitemapIndex.body.includes("/services/masonry") &&
        sitemapIndex.body.includes("/madison/masonry") &&
        !sitemapIndex.body.includes("/admin"),
      "sitemap includes published+indexable content only",
    );

    // Related links should appear between published pages
    record(
      "3-related-links",
      pubIndex.body.includes("/services/masonry/brick-step-repair") ||
        pubIndex.body.includes("Brick Step Repair"),
      "guide shows related published content",
    );

    // Canonical present
    record(
      "3-canonical",
      pubIndex.body.includes(
        'rel="canonical"',
      ) && pubIndex.body.includes("a5homeservices.com/guides/why-brick-steps-crack"),
      "canonical present",
    );

    // 4. Unknown slug → 404
    const unknown = await http(PATHS.unknownGuide);
    record("4-unknown-404", unknown.status === 404, `status=${unknown.status}`);

    // 5. Invalid entity combination → 404
    const invalid = await http(PATHS.invalidCombo);
    record(
      "5-invalid-combo-404",
      invalid.status === 404,
      `plumbing+brick-step status=${invalid.status}`,
    );
    const invalidTown = await http(PATHS.invalidTown);
    record(
      "5-invalid-town-404",
      invalidTown.status === 404,
      `status=${invalidTown.status}`,
    );

    // 6. Public data boundary — anon cannot read operational tables
    for (const table of [
      "customers",
      "leads",
      "admin_users",
      "project_photos",
    ]) {
      const { data, error } = await anonClient.from(table).select("*").limit(1);
      record(
        `6-anon-blocked-${table}`,
        (data?.length ?? 0) === 0,
        `rows=${data?.length ?? 0} err=${error?.code ?? error?.message ?? "none"}`,
      );
    }

    // Anon can read published content
    const { data: anonPub } = await anonClient
      .from("content_pages")
      .select("id, status, indexable")
      .eq("status", "PUBLISHED");
    record(
      "6-anon-reads-published",
      (anonPub?.length ?? 0) === 5,
      `published rows=${anonPub?.length ?? 0}`,
    );

    // 7. Sitemap only approved core + PUBLISHED+indexable (already checked)
    record(
      "7-sitemap-core",
      sitemapIndex.body.includes("a5homeservices.com/") &&
        sitemapIndex.body.includes("/request-service"),
      "core routes present",
    );

    // 8. Structured data identity (checked above)
    // 9. Internal links only eligible — draft targets excluded when we revert
    // 10. Server-rendered — page HTML contains content without requiring JS hydration markers for body
    record(
      "10-ssr-content",
      pubIndex.body.includes("<h1") &&
        pubIndex.body.includes("Direct answer"),
      "authority content present in HTML",
    );

    // Mobile viewport smoke via CSS presence / page ok at representative pages
    for (const path of [PATHS.service, PATHS.serviceLocation, PATHS.problem]) {
      const res = await http(path);
      record(
        `mobile-ready-${path}`,
        res.status === 200 && res.body.includes("<main"),
        `status=${res.status}`,
      );
    }

    // Restore intended fixture state
    await restoreDraft();
    const after = await http(PATHS.service);
    record(
      "restore-draft",
      after.status === 404,
      `restored draft; status=${after.status}`,
    );

    // Confirm anon no longer sees drafts
    const { data: anonAfter } = await anonClient
      .from("content_pages")
      .select("id")
      .eq("status", "PUBLISHED");
    record(
      "restore-rls",
      (anonAfter?.length ?? 0) === 0,
      `published visible to anon=${anonAfter?.length ?? 0}`,
    );
  } catch (err) {
    console.error("MATRIX_ERROR", err instanceof Error ? err.message : err);
    try {
      await restoreDraft();
    } catch {
      /* ignore */
    }
    process.exit(2);
  }

  const failed = rows.filter((r) => !r.ok);
  console.log(`\nSUMMARY ${rows.length - failed.length}/${rows.length} passed`);
  if (failed.length) {
    console.log("FAILURES:");
    for (const f of failed) console.log(` - ${f.id}: ${f.detail}`);
    process.exit(1);
  }
}

await main();
