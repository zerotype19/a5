/**
 * Publish the six owner-approved location hubs.
 * Updates Madison in place. Inserts the other five LOCATION pages.
 * Does not create service × location pages or any other problem pages.
 *
 *   CONFIRM_LOCATION_HUBS=publish-6 node --experimental-strip-types scripts/apply-location-hubs.ts
 */

import { readFileSync } from "node:fs";
import { buildLocationPublicationPlan } from "../src/lib/authority/location-publication.ts";

if (process.env.CONFIRM_LOCATION_HUBS !== "publish-6") {
  console.error("Refusing to publish. Set CONFIRM_LOCATION_HUBS=publish-6.");
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

const env = loadEnv(process.env.A5_ENV_FILE ?? "/Users/kevinmcgovern/a5/.env.production");
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

const plan = buildLocationPublicationPlan();
const beforeServiceLocations = await request(
  "content_pages?select=id&page_type=eq.SERVICE_LOCATION",
).then((response) => response.json() as Promise<{ id: string }[]>);
if (beforeServiceLocations.length !== 1) {
  throw new Error(`Expected 1 service × location page, found ${beforeServiceLocations.length}`);
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
      retrieved_at: "2026-09-30T12:45:00.000Z",
      reviewed_at: "2026-09-30T12:45:00.000Z",
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
  `content_pages?select=id,slug,page_type,status,indexable,primary_location_id&page_type=eq.LOCATION`,
).then(
  (response) =>
    response.json() as Promise<
      {
        id: string;
        slug: string;
        page_type: string;
        status: string;
        indexable: boolean;
        primary_location_id: string;
      }[]
    >,
);
const serviceLocations = await request(
  "content_pages?select=id&page_type=eq.SERVICE_LOCATION",
).then((response) => response.json() as Promise<{ id: string }[]>);
const madison = published.filter((page) => page.slug === "madison");
if (published.length !== 6) throw new Error(`Expected 6 location pages, found ${published.length}`);
if (madison.length !== 1 || madison[0]?.id !== "10000000-0000-4000-8000-000000000002") {
  throw new Error("Madison is not the existing location page");
}
if (published.some((page) => page.status !== "PUBLISHED" || page.indexable !== true)) {
  throw new Error("A location hub is not published and indexable");
}
if (serviceLocations.length !== 1 || serviceLocations[0]?.id !== "10000000-0000-4000-8000-000000000003") {
  throw new Error("Service × location pages changed");
}

console.log(
  `Published ${published.length} location hubs, ${plan.sourceLinks.length} source links, ${plan.relationships.length} relationships.`,
);
