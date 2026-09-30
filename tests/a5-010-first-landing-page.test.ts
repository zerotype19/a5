import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import {
  normalizeFirstLandingPage,
  selectFirstLandingPath,
} from "../src/lib/intake/landing-page.ts";
import { validateSubmissionPayload } from "../src/lib/intake/validate-submission.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function read(path: string): string {
  return readFileSync(join(root, path), "utf8");
}

describe("first landing page normalization", () => {
  it("keeps a direct homepage entry", () => {
    assert.equal(normalizeFirstLandingPage("/"), "/");
    assert.equal(normalizeFirstLandingPage("/?gclid=abc"), "/");
  });

  it("keeps service, problem, and location paths", () => {
    assert.equal(
      normalizeFirstLandingPage("/services/masonry"),
      "/services/masonry",
    );
    assert.equal(
      normalizeFirstLandingPage("/services/masonry/brick-step-repair"),
      "/services/masonry/brick-step-repair",
    );
    assert.equal(
      normalizeFirstLandingPage("/home-services/chatham"),
      "/home-services/chatham",
    );
  });

  it("reduces a same-site absolute URL to its pathname and drops the query", () => {
    assert.equal(
      normalizeFirstLandingPage(
        "https://www.a5homeservices.com/services/masonry/brick-step-repair?q=brick",
      ),
      "/services/masonry/brick-step-repair",
    );
    assert.equal(
      normalizeFirstLandingPage(
        "https://a5homeservices.com/home-services/chatham/",
      ),
      "/home-services/chatham",
    );
  });

  it("rejects the intake form, operational routes, and external origins", () => {
    assert.equal(normalizeFirstLandingPage("/request-service"), null);
    assert.equal(normalizeFirstLandingPage("/request-service/"), null);
    assert.equal(normalizeFirstLandingPage("/admin/leads"), null);
    assert.equal(normalizeFirstLandingPage("/api/submit-project-request"), null);
    assert.equal(normalizeFirstLandingPage("/opportunity/abc"), null);
    assert.equal(
      normalizeFirstLandingPage("https://evil.example/services/masonry"),
      null,
    );
    assert.equal(
      normalizeFirstLandingPage("https://www.a5homeservices.com.evil.example/"),
      null,
    );
    assert.equal(normalizeFirstLandingPage("//evil.example/services/masonry"), null);
    assert.equal(normalizeFirstLandingPage("javascript:alert(1)"), null);
    assert.equal(normalizeFirstLandingPage("../services/masonry"), null);
    assert.equal(normalizeFirstLandingPage("/services/masonry%2fsecret"), null);
    assert.equal(normalizeFirstLandingPage(""), null);
    assert.equal(normalizeFirstLandingPage(null), null);
  });
});

describe("first path during a visit", () => {
  it("keeps the content page when the visit ends on the form", () => {
    const visit = [
      "/services/masonry/brick-step-repair",
      "/services/electrical",
      "/request-service",
    ];
    const stored = visit.reduce<string | null>(
      (current, path) => selectFirstLandingPath(current, path),
      null,
    );
    assert.equal(stored, "/services/masonry/brick-step-repair");
  });

  it("keeps the first town page when the visitor browses to another service", () => {
    const visit = [
      "/home-services/chatham",
      "/services/electrical",
      "/request-service",
    ];
    const stored = visit.reduce<string | null>(
      (current, path) => selectFirstLandingPath(current, path),
      null,
    );
    assert.equal(stored, "/home-services/chatham");
  });

  it("keeps the homepage when that is the first page", () => {
    const stored = selectFirstLandingPath(
      selectFirstLandingPath(null, "/"),
      "/request-service",
    );
    assert.equal(stored, "/");
  });

  it("stores nothing when the only page is the form", () => {
    assert.equal(selectFirstLandingPath(null, "/request-service"), null);
  });

  it("does not replace a captured path with a later or malformed value", () => {
    const first = "/services/masonry/brick-step-repair";
    assert.equal(
      selectFirstLandingPath(first, "https://evil.example/services/electrical"),
      first,
    );
    assert.equal(selectFirstLandingPath(first, "/home-services/chatham"), first);
  });
});

describe("submit validation", () => {
  const payload = {
    serviceId: "handyman",
    serviceSelectionStatus: "SELECTED",
    zip: "07940",
    description: "The closet door sticks and needs adjustment.",
    timing: "WITHIN_30_DAYS",
    firstName: "Alex",
    lastName: "Lee",
    phone: "(973) 555-1212",
    email: "alex@example.com",
    preferredContact: "PHONE",
    turnstileToken: null,
  };

  it("passes a content path through and drops an external value without failing the request", () => {
    const kept = validateSubmissionPayload({
      ...payload,
      firstLandingPage: "/services/masonry/brick-step-repair",
    });
    assert.equal(kept.ok, true);
    if (kept.ok) {
      assert.equal(
        kept.value.firstLandingPage,
        "/services/masonry/brick-step-repair",
      );
    }

    const dropped = validateSubmissionPayload({
      ...payload,
      firstLandingPage: "https://evil.example/services/masonry",
    });
    assert.equal(dropped.ok, true);
    if (dropped.ok) {
      assert.equal(dropped.value.firstLandingPage, null);
    }

    const absent = validateSubmissionPayload(payload);
    assert.equal(absent.ok, true);
    if (absent.ok) {
      assert.equal(absent.value.firstLandingPage, null);
    }
  });
});

describe("first landing page persistence", () => {
  const migration = read(
    "supabase/migrations/20260930150000_first_landing_page.sql",
  );
  const submit = read("src/lib/intake/submit-project-request.ts");
  const form = read("src/components/intake/ProjectIntakeForm.tsx");
  const shell = read("src/components/SiteShell.tsx");
  const detail = read("src/app/admin/(protected)/leads/[id]/page.tsx");
  const data = read("src/lib/admin/data.ts");

  it("writes the column on insert and does not update it on retry", () => {
    assert.match(migration, /p_first_landing_page text default null/);
    assert.match(migration, /first_landing_page/);
    assert.match(migration, /Do not update first_landing_page/);
    assert.doesNotMatch(migration, /update public\.leads/i);
    assert.match(
      migration,
      /where l\.submission_key = p_submission_key;[\s\S]*return query select v_lead_id, v_reference;/,
    );
    assert.match(migration, /drop function if exists public\.submit_project_request/i);
    assert.match(
      migration,
      /'UNKNOWN'::public\.attribution_confidence/,
    );
    assert.match(migration, /to service_role/);
  });

  it("passes the normalized path from the form into the RPC and shows it on the lead", () => {
    assert.match(shell, /rememberFirstLandingPath\(pathname\)/);
    assert.match(form, /readFirstLandingPage\(\)/);
    assert.match(form, /firstLandingPage: readFirstLandingPage\(\)/);
    assert.match(submit, /p_first_landing_page: value\.firstLandingPage/);
    assert.match(data, /first_landing_page/);
    assert.match(detail, /Landing page/);
    assert.match(detail, /lead\.firstLandingPage/);
  });
});
