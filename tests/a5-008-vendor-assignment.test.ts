import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { isVendorEligible } from "../src/lib/admin/eligibility.ts";
import { isAllowedTransition } from "../src/lib/admin/transitions.ts";
import {
  LEAD_ASSIGNMENT_STATUSES,
  VENDOR_STATUSES,
} from "../src/lib/db/schema.ts";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const migration = readFileSync(
  join(root, "supabase/migrations/20260923210000_a5_008_vendor_assignment.sql"),
  "utf8",
);

const base = {
  id: "v",
  status: "ACTIVE" as const,
  acceptingLeads: true,
  serviceIds: ["masonry"],
  locationIds: ["madison"],
};

describe("A5-008 eligibility", () => {
  it("includes only ACTIVE accepting vendors with service and location", () => {
    assert.equal(
      isVendorEligible(base, { serviceId: "masonry", locationId: "madison" }),
      true,
    );
    assert.equal(
      isVendorEligible(
        { ...base, status: "PAUSED" },
        { serviceId: "masonry", locationId: "madison" },
      ),
      false,
    );
    assert.equal(
      isVendorEligible(
        { ...base, acceptingLeads: false },
        { serviceId: "masonry", locationId: "madison" },
      ),
      false,
    );
    assert.equal(
      isVendorEligible(
        { ...base, serviceIds: ["drywall"] },
        { serviceId: "masonry", locationId: "madison" },
      ),
      false,
    );
    assert.equal(
      isVendorEligible(base, { serviceId: "masonry", locationId: null }),
      false,
    );
    assert.equal(
      isVendorEligible(base, { serviceId: null, locationId: "madison" }),
      false,
    );
  });
});

describe("A5-008 assignment boundary", () => {
  it("does not allow generic QUALIFIED → ASSIGNED", () => {
    assert.equal(isAllowedTransition("QUALIFIED", "ASSIGNED"), false);
    assert.equal(isAllowedTransition("NEW", "ASSIGNED"), false);
    assert.match(migration, /assignment_required/);
    assert.match(migration, /p_to_status = 'ASSIGNED'/);
  });

  it("ships vendors, coverage, and one-open-assignment constraint", () => {
    assert.equal(VENDOR_STATUSES.includes("DISCOVERED"), true);
    assert.equal(VENDOR_STATUSES.includes("ACTIVE"), true);
    assert.equal(VENDOR_STATUSES.includes("PAUSED"), true);
    assert.equal(
      (VENDOR_STATUSES as readonly string[]).includes("PROSPECT"),
      false,
    );
    assert.match(migration, /accepting_requires_active/);
    assert.match(migration, /'DISCOVERED'/);
    assert.deepEqual([...LEAD_ASSIGNMENT_STATUSES], [
      "ASSIGNED",
      "ACCEPTED",
      "PASSED",
      "CANCELLED",
    ]);
    assert.match(migration, /create table public\.vendors/);
    assert.match(migration, /create table public\.vendor_services/);
    assert.match(migration, /create table public\.vendor_locations/);
    assert.match(migration, /create table public\.lead_assignments/);
    assert.match(migration, /lead_assignments_one_open_idx/);
    assert.match(migration, /vendors_deny_all/);
    assert.match(migration, /status = 'ACTIVE'/);
    assert.match(migration, /accepting_leads = true/);
    assert.match(migration, /vs\.vendor_id = v_id/);
    assert.match(migration, /admin_assign_lead_to_vendor/);
    assert.match(migration, /VendorAssigned/);
    assert.match(migration, /assigned_by/);
    assert.match(migration, /grant execute on function public\.admin_assign_lead_to_vendor/);
    assert.doesNotMatch(migration, /content_pages/);
    assert.doesNotMatch(migration, /resend|send email|twilio/i);
  });

  it("wires admin vendor UI and keeps assignment off the status dropdown", () => {
    const nav = readFileSync(
      join(root, "src/components/admin/AdminShell.tsx"),
      "utf8",
    );
    const panel = readFileSync(
      join(root, "src/components/admin/LeadAssignmentPanel.tsx"),
      "utf8",
    );
    const actions = readFileSync(
      join(root, "src/lib/admin/vendor-actions.ts"),
      "utf8",
    );
    assert.match(nav, /\/admin\/vendors/);
    assert.match(panel, /Vendor notification is not enabled/);
    assert.match(panel, /admin_assign_lead_to_vendor|assignLeadToVendor/);
    assert.match(actions, /resolveAdminAccess/);
    assert.doesNotMatch(actions, /SUPABASE_SERVICE_ROLE_KEY/);
    const transitions = readFileSync(
      join(root, "src/lib/admin/transitions.ts"),
      "utf8",
    );
    assert.doesNotMatch(
      transitions,
      /QUALIFIED:\s*\[[^\]]*ASSIGNED/,
    );
  });
});
