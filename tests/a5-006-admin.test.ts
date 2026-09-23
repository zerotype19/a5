import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  formatAdminDateTime,
  formatServiceSelection,
  publicReferenceFromLeadId,
  DASHBOARD_STATUS_COUNTS,
} from "../src/lib/admin/format.ts";
import { LEAD_STATUSES } from "../src/lib/db/schema.ts";
import { rejectPublicPhotoCredential } from "../src/lib/admin/data.ts";

function read(path: string): string {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("A5-006 admin format", () => {
  it("derives public reference like A5-004 RPC", () => {
    assert.equal(
      publicReferenceFromLeadId("48bbd051-1234-5678-9abc-def012345678"),
      "A5-48BBD051",
    );
  });

  it("formats UTC timestamps consistently", () => {
    assert.equal(
      formatAdminDateTime("2026-09-23T16:00:00.000Z"),
      "2026-09-23 16:00 UTC",
    );
  });

  it("displays NOT_SURE as Not sure", () => {
    assert.equal(formatServiceSelection("NOT_SURE", null), "Not sure");
  });

  it("dashboard counts use actual schema enums only", () => {
    assert.deepEqual([...DASHBOARD_STATUS_COUNTS], [...LEAD_STATUSES]);
  });
});

describe("A5-006 migration + security surface", () => {
  it("creates admin_users with RLS deny-all", () => {
    const migration = read(
      "supabase/migrations/20260923180000_a5_006_admin_users.sql",
    );
    assert.match(migration, /create table public\.admin_users/);
    assert.match(migration, /user_id uuid primary key/);
    assert.match(migration, /active boolean not null default true/);
    assert.match(migration, /enable row level security/);
    assert.match(migration, /admin_users_deny_all/);
    assert.match(migration, /to anon, authenticated/);
    assert.doesNotMatch(migration, /password/i);
    assert.doesNotMatch(migration, /@.*\./); // no emails in migration
  });

  it("documents controlled bootstrap without inventing credentials", () => {
    const doc = read("docs/migrations/A5-006-admin-users.md");
    assert.match(doc, /Controlled bootstrap/);
    assert.match(doc, /Do \*\*not\*\* put passwords/);
  });

  it("approves @supabase/ssr in dependency registry", () => {
    const deps = read("docs/DEPENDENCIES.md");
    assert.match(deps, /@supabase\/ssr/);
    assert.match(deps, /\*\*Approved\*\*/);
    const pkg = JSON.parse(read("package.json")) as {
      dependencies: Record<string, string>;
    };
    assert.equal(pkg.dependencies["@supabase/ssr"] !== undefined, true);
  });

  it("admin browser clients never embed service-role", () => {
    for (const path of [
      "src/lib/supabase/browser.ts",
      "src/lib/supabase/server.ts",
      "src/lib/supabase/middleware.ts",
      "src/components/admin/AdminLoginForm.tsx",
      "src/components/admin/AdminShell.tsx",
    ]) {
      const source = read(path);
      assert.doesNotMatch(source, /process\.env\.SUPABASE_SERVICE_ROLE_KEY/);
      assert.doesNotMatch(source, /getSupabaseAdmin/);
    }
  });

  it("authorization order is session then allowlist", () => {
    const auth = read("src/lib/admin/authorize.ts");
    assert.match(auth, /getUser/);
    assert.match(auth, /admin_users/);
    assert.match(auth, /active/);
  });

  it("rejects photo credentials without admin gate", () => {
    assert.throws(
      () =>
        rejectPublicPhotoCredential({
          leadId: "00000000-0000-0000-0000-000000000001",
          publicReference: "A5-00000000",
          storagePath: "x/y.jpg",
        }),
      /photo_signed_read_requires_admin/,
    );
  });

  it("wires admin shell routes and noindex", () => {
    const layout = read("src/app/admin/layout.tsx");
    assert.match(layout, /index:\s*false/);
    assert.match(layout, /follow:\s*false/);
    assert.equal(read("src/app/admin/login/page.tsx").includes("Sign in"), true);
    assert.equal(
      read("src/app/admin/(protected)/page.tsx").includes("Dashboard"),
      true,
    );
    assert.equal(
      read("src/app/admin/(protected)/leads/page.tsx").includes("Leads"),
      true,
    );
    assert.match(
      read("src/app/admin/(protected)/leads/[id]/page.tsx"),
      /No photos attached/,
    );
    assert.match(
      read("src/app/admin/(protected)/layout.tsx"),
      /Access denied/,
    );
  });

  it("public header has no Admin link", () => {
    const header = read("src/components/Header.tsx");
    assert.doesNotMatch(header, /\/admin/);
    assert.doesNotMatch(header, /Admin/);
  });

  it("login has no signup or social providers", () => {
    const login = read("src/components/admin/AdminLoginForm.tsx");
    assert.doesNotMatch(login, /signUp|signInWithOAuth|magic.?link|forgot/i);
    assert.match(login, /signInWithPassword/);
  });
});
