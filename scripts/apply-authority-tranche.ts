/**
 * Apply the owner-approved 22-page authority tranche to the live database.
 * Does not insert problem entities. Does not publish any other page.
 *
 * Usage, from the repo, with production env loaded and not printed:
 *   CONFIRM_AUTHORITY_TRANCHE=publish-22 node --experimental-strip-types scripts/apply-authority-tranche.ts
 */

import { readFileSync } from "node:fs";
import { buildTranchePublicationPlan } from "../src/lib/authority/tranche-publication.ts";

if (process.env.CONFIRM_AUTHORITY_TRANCHE !== "publish-22") {
  console.error("Refusing to publish. Set CONFIRM_AUTHORITY_TRANCHE=publish-22.");
  process.exit(1);
}

function loadEnv(path: string): Record<string, string> {
  return Object.fromEntries(
    readFileSync(path, "utf8")
      .split("\n")
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, "")];
      }),
  );
}

const env = loadEnv(
  process.env.A5_ENV_FILE ?? "/Users/kevinmcgovern/a5/.env.production",
);
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Supabase URL or service role key is missing.");
  process.exit(1);
}

const headers = {
  apikey: key,
  Authorization: `Bearer ${key}`,
  "Content-Type": "application/json",
};

async function request(path: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...init,
    headers: { ...headers, ...(init.headers ?? {}) },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`${init.method ?? "GET"} ${path} ${response.status} ${body.slice(0, 500)}`);
  }
  return response;
}

const plan = buildTranchePublicationPlan();
const requiredProblems = plan.pages
  .filter((page) => page.page_type === "PROBLEM")
  .map((page) => page.primary_problem_id)
  .filter((id): id is string => Boolean(id));

const existing = await request(
  `problems?select=id&id=in.(${requiredProblems.join(",")})`,
).then((response) => response.json() as Promise<{ id: string }[]>);
const found = new Set(existing.map((row) => row.id));
const missing = requiredProblems.filter((id) => !found.has(id));
if (missing.length > 0) {
  throw new Error(`Missing problem entities: ${missing.join(", ")}`);
}

const serviceLinks = await request(
  `problem_services?select=problem_id,service_id&problem_id=in.(${requiredProblems.join(",")})`,
).then(
  (response) => response.json() as Promise<{ problem_id: string; service_id: string }[]>,
);
const linkSet = new Set(serviceLinks.map((row) => `${row.problem_id}:${row.service_id}`));
for (const page of plan.pages) {
  if (page.page_type !== "PROBLEM" || !page.primary_problem_id) continue;
  if (!linkSet.has(`${page.primary_problem_id}:${page.primary_service_id}`)) {
    throw new Error(
      `Missing problem_services ${page.primary_problem_id}:${page.primary_service_id}`,
    );
  }
}
if (!linkSet.has("water-damaged-ceiling:plumbing") || !linkSet.has("water-damaged-ceiling:painting")) {
  throw new Error("water-damaged-ceiling is missing a related service link");
}

await request("sources?on_conflict=id", {
  method: "POST",
  headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify(
    plan.sources.map((source) => ({
      id: source.id,
      title: source.title,
      url: source.url,
      publisher: source.publisher,
      source_type: source.source_type,
      retrieved_at: "2026-09-30T12:00:00.000Z",
      reviewed_at: "2026-09-30T12:00:00.000Z",
    })),
  ),
});

const pageIds = plan.pages.map((page) => page.id).join(",");
await request("content_pages?on_conflict=id", {
  method: "POST",
  headers: { Prefer: "resolution=merge-duplicates,return=minimal" },
  body: JSON.stringify(
    plan.pages.map((page) => {
      const { action, ...row } = page;
      void action;
      return row;
    }),
  ),
});

await request(`content_sources?content_page_id=in.(${pageIds})`, { method: "DELETE" });
await request("content_sources", {
  method: "POST",
  headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
  body: JSON.stringify(plan.sourceLinks),
});
await request("content_relationships?on_conflict=from_page_id,to_page_id,relationship_type", {
  method: "POST",
  headers: { Prefer: "resolution=ignore-duplicates,return=minimal" },
  body: JSON.stringify(plan.relationships),
});

const published = await request(
  `content_pages?select=id,slug,page_type,status,indexable&id=in.(${pageIds})`,
).then(
  (response) =>
    response.json() as Promise<
      { id: string; slug: string; page_type: string; status: string; indexable: boolean }[]
    >,
);
const brick = published.filter((page) => page.slug === "brick-step-repair");
const ceiling = published.filter((page) => page.slug === "water-damaged-ceiling");
if (published.length !== 22) throw new Error(`Expected 22 pages, found ${published.length}`);
if (brick.length !== 1 || brick[0]?.id !== "10000000-0000-4000-8000-000000000004") {
  throw new Error("brick-step-repair is not the existing page");
}
if (ceiling.length !== 1) throw new Error("water-damaged-ceiling count is not 1");
if (published.some((page) => page.status !== "PUBLISHED" || page.indexable !== true)) {
  throw new Error("A tranche page is not published and indexable");
}

console.log(
  `Published ${published.length} pages, ${plan.sourceLinks.length} source links, ${plan.relationships.length} relationships.`,
);
