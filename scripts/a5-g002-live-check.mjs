/**
 * A5-G002 live non-prod check for one service hub.
 * Temporarily publishes handyman, verifies public read, then returns it to REVIEW.
 * Does not print secrets. Exits if env is missing.
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
const service = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
const HUB_ID = "20000000-0000-4000-8000-000000000001";

if (!url || !anon || !service) {
  console.error("MISSING_ENV");
  process.exit(2);
}

const admin = createClient(url, service, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anonClient = createClient(url, anon, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function main() {
  const { data: before, error: beforeErr } = await admin
    .from("content_pages")
    .select("id, status, indexable, slug")
    .eq("id", HUB_ID)
    .maybeSingle();
  if (beforeErr || !before) {
    console.error("HUB_MISSING");
    process.exit(1);
  }

  const { error: pubErr } = await admin
    .from("content_pages")
    .update({ status: "PUBLISHED", indexable: true, published_at: new Date().toISOString() })
    .eq("id", HUB_ID);
  if (pubErr) {
    console.error("PUBLISH_FAILED");
    process.exit(1);
  }

  const { data: visible, error: readErr } = await anonClient
    .from("content_pages")
    .select("slug, status")
    .eq("id", HUB_ID)
    .maybeSingle();
  if (readErr || visible?.slug !== "handyman" || visible.status !== "PUBLISHED") {
    console.error("ANON_READ_FAILED");
    process.exit(1);
  }

  const { error: restoreErr } = await admin
    .from("content_pages")
    .update({
      status: "REVIEW",
      indexable: false,
      published_at: null,
    })
    .eq("id", HUB_ID);
  if (restoreErr) {
    console.error("RESTORE_FAILED");
    process.exit(1);
  }

  const { data: hidden } = await anonClient
    .from("content_pages")
    .select("id")
    .eq("id", HUB_ID)
    .maybeSingle();
  if (hidden) {
    console.error("STILL_PUBLIC");
    process.exit(1);
  }

  console.log("G002_LIVE_OK");
}

main().catch(() => {
  console.error("G002_LIVE_ERROR");
  process.exit(1);
});
