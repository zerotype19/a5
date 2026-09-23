import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { SERVICES } from "../config/services.ts";
import { LOCATIONS } from "../config/locations.ts";
import {
  formatServiceSelection,
  NEEDS_ATTENTION_STATUS,
} from "../src/lib/admin/format.ts";
import {
  LEAD_STATUS_TRANSITIONS,
  allowedTransitions,
  eventTypeForTransition,
  isAllowedTransition,
  validateNoteBody,
  STALE_STATUS_MESSAGE,
} from "../src/lib/admin/transitions.ts";
import { LEAD_NOTES_TABLE, LEAD_STATUSES } from "../src/lib/db/schema.ts";

function read(path: string): string {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

describe("A5-007 transition map", () => {
  it("allows NEW → QUALIFIED and NEW → UNSERVICEABLE", () => {
    assert.equal(isAllowedTransition("NEW", "QUALIFIED"), true);
    assert.equal(isAllowedTransition("NEW", "UNSERVICEABLE"), true);
    assert.equal(eventTypeForTransition("QUALIFIED"), "LeadQualified");
  });

  it("rejects inventing NEW → WON and vendor ASSIGNED from NEW", () => {
    assert.equal(isAllowedTransition("NEW", "WON"), false);
    assert.equal(isAllowedTransition("NEW", "ASSIGNED"), false);
    assert.deepEqual([...allowedTransitions("ASSIGNED")], []);
  });

  it("covers every lead_status key without inventing statuses", () => {
    for (const status of LEAD_STATUSES) {
      assert.ok(status in LEAD_STATUS_TRANSITIONS);
      for (const to of LEAD_STATUS_TRANSITIONS[status]) {
        assert.ok((LEAD_STATUSES as readonly string[]).includes(to));
      }
    }
  });

  it("validates note length 1–2000", () => {
    assert.equal(validateNoteBody("").ok, false);
    assert.equal(validateNoteBody("x").ok, true);
    assert.equal(validateNoteBody("a".repeat(2000)).ok, true);
    assert.equal(validateNoteBody("a".repeat(2001)).ok, false);
  });

  it("exposes stale concurrency message", () => {
    assert.match(STALE_STATUS_MESSAGE, /Refresh before continuing/);
  });
});

describe("A5-007 classification display + registries", () => {
  it("preserves NOT_SURE label when service_id is later set", () => {
    assert.equal(formatServiceSelection("NOT_SURE", null), "Not sure");
    assert.equal(
      formatServiceSelection("NOT_SURE", "handyman"),
      "Not sure → handyman",
    );
  });

  it("needs attention maps to NEW only", () => {
    assert.equal(NEEDS_ATTENTION_STATUS, "NEW");
  });

  it("leads list consumes canonical services registry (no local duplicate list)", () => {
    const page = read("src/app/admin/(protected)/leads/page.tsx");
    assert.match(page, /@config\/services/);
    assert.match(page, /SERVICES\.map/);
    assert.doesNotMatch(
      page,
      /const SERVICES = \[\s*"handyman"/,
    );
    assert.match(page, /attention=1|attention/);
    for (const service of SERVICES) {
      assert.ok(SERVICES.some((s) => s.id === service.id));
    }
    assert.equal(LOCATIONS.length > 0, true);
  });

  it("dashboard NEW waiting link filters leads", () => {
    const dash = read("src/app/admin/(protected)/page.tsx");
    assert.match(dash, /\/admin\/leads\?attention=1/);
    assert.match(dash, /new lead/);
  });
});

describe("A5-007 migration + authorization surface", () => {
  const migration = read(
    "supabase/migrations/20260923190000_a5_007_lead_operations.sql",
  );

  it("creates lead_notes with RLS deny-all and created_by", () => {
    assert.equal(LEAD_NOTES_TABLE, "lead_notes");
    assert.match(migration, /create table public\.lead_notes/);
    assert.match(migration, /created_by uuid not null references auth\.users/);
    assert.match(migration, /lead_notes_deny_all/);
    assert.match(migration, /char_length\(body\) between 1 and 2000/);
  });

  it("adds actor_user_id and relaxes NOT_SURE + service_id consistency", () => {
    assert.match(migration, /actor_user_id uuid references auth\.users/);
    assert.match(migration, /drop constraint if exists leads_service_selection_consistency/);
    assert.match(
      migration,
      /service_selection_status = 'NOT_SURE'/,
    );
    assert.doesNotMatch(
      migration,
      /service_selection_status = 'NOT_SURE'\s+and service_id is null/,
    );
  });

  it("ships atomic transition + classify + note RPCs for service_role only", () => {
    assert.match(migration, /admin_transition_lead_status/);
    assert.match(migration, /admin_classify_lead_service/);
    assert.match(migration, /admin_classify_lead_location/);
    assert.match(migration, /admin_add_lead_note/);
    assert.match(migration, /stale_status/);
    assert.match(migration, /for update/);
    assert.match(migration, /grant execute[\s\S]*to service_role/);
    assert.match(migration, /revoke all[\s\S]*from anon/);
    assert.match(migration, /revoke all[\s\S]*from authenticated/);
  });

  it("preserves NOT_SURE on service classify and postal_code on location classify", () => {
    assert.match(
      migration,
      /Preserve service_selection_status = NOT_SURE/,
    );
    assert.match(migration, /postal_code intentionally untouched/);
    assert.match(migration, /ServiceClassified/);
    assert.match(migration, /LocationClassified/);
  });

  it("server actions require admin then mutate via RPC", () => {
    const actions = read("src/lib/admin/actions.ts");
    assert.match(actions, /resolveAdminAccess/);
    assert.match(actions, /gateAdmin/);
    assert.match(actions, /admin_transition_lead_status/);
    assert.match(actions, /admin_classify_lead_service/);
    assert.match(actions, /admin_classify_lead_location/);
    assert.match(actions, /admin_add_lead_note/);
    assert.match(actions, /isAllowedTransition/);
    assert.doesNotMatch(actions, /process\.env\.NEXT_PUBLIC_.*SERVICE_ROLE/);
  });

  it("does not expose mutations to browser supabase clients", () => {
    for (const path of [
      "src/lib/supabase/browser.ts",
      "src/components/admin/AdminLoginForm.tsx",
      "src/components/admin/LeadOperationsPanels.tsx",
    ]) {
      const source = read(path);
      assert.doesNotMatch(source, /getSupabaseAdmin/);
      assert.doesNotMatch(source, /SUPABASE_SERVICE_ROLE_KEY/);
    }
  });

  it("lead detail exposes ops sections and contact links", () => {
    const detail = read("src/app/admin/(protected)/leads/[id]/page.tsx");
    assert.match(detail, /tel:/);
    assert.match(detail, /mailto:/);
    assert.match(detail, /Classification/);
    assert.match(detail, /LeadOperationsPanels/);
    assert.match(detail, /No photos attached/);
    const panels = read("src/components/admin/LeadOperationsPanels.tsx");
    assert.match(panels, /Qualify lead/);
    assert.match(panels, /Classify service/);
    assert.match(panels, /Add note/);
    assert.match(panels, /History/);
  });

  it("adds no new package.json dependencies", () => {
    const pkg = JSON.parse(read("package.json")) as {
      dependencies: Record<string, string>;
    };
    assert.deepEqual(Object.keys(pkg.dependencies).sort(), [
      "@supabase/ssr",
      "@supabase/supabase-js",
      "next",
      "react",
      "react-dom",
    ]);
  });

  it("documents migration", () => {
    const doc = read("docs/migrations/A5-007-lead-operations.md");
    assert.match(doc, /lead_notes/);
    assert.match(doc, /admin_transition_lead_status/);
  });
});
