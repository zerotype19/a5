import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it } from "node:test";
import { withoutPassedVendors } from "../src/lib/admin/eligibility.ts";
import { SITEMAP_EXCLUSIONS } from "../src/lib/authority/sitemap.ts";
import {
  buildVendorOpportunityEmail,
  opportunityPageUrl,
} from "../src/lib/opportunity/email.ts";
import {
  canSendVendorNotification,
  opportunityAccess,
} from "../src/lib/opportunity/policy.ts";
import {
  createOpportunityToken,
  hashOpportunityToken,
  isOpportunityToken,
} from "../src/lib/opportunity/token.ts";

const root = process.cwd();
const migration = readFileSync(
  join(root, "supabase/migrations/20260930023000_a5_009_vendor_email.sql"),
  "utf8",
);

const active = {
  assignmentStatus: "ASSIGNED",
  vendorStatus: "ACTIVE",
  acceptingLeads: true,
  vendorEmail: "vendor@example.com",
  notificationStatus: null,
};

describe("A5-009 send rules", () => {
  it("allows an open assignment to an active accepting vendor with email", () => {
    assert.deepEqual(canSendVendorNotification(active), { ok: true });
    assert.equal(
      canSendVendorNotification({ ...active, notificationStatus: "FAILED" }).ok,
      true,
    );
  });

  it("blocks missing email, closed assignments, and a second send", () => {
    assert.equal(
      canSendVendorNotification({ ...active, vendorStatus: "DISCOVERED" }).ok,
      true,
    );
    assert.equal(
      canSendVendorNotification({ ...active, acceptingLeads: false }).ok,
      true,
    );
    assert.equal(
      canSendVendorNotification({ ...active, vendorEmail: " " }).ok,
      false,
    );
    assert.equal(
      canSendVendorNotification({ ...active, vendorEmail: "not-an-email" }).ok,
      false,
    );
    assert.equal(
      canSendVendorNotification({ ...active, assignmentStatus: "ACCEPTED" }).ok,
      false,
    );
    assert.equal(
      canSendVendorNotification({ ...active, notificationStatus: "SENT" }).ok,
      false,
    );
  });
});

describe("A5-009 capability", () => {
  it("stores a hash and not the raw token", () => {
    const token = createOpportunityToken(new Date("2026-09-30T00:00:00.000Z"));
    assert.equal(isOpportunityToken(token.raw), true);
    assert.equal(token.hash, hashOpportunityToken(token.raw));
    assert.equal(token.hash.length, 64);
    assert.equal(token.hash.includes(token.raw), false);
    assert.equal(
      token.expiresAt.toISOString(),
      "2026-10-03T00:00:00.000Z",
    );
  });

  it("hides unknown, expired, and revoked links the same way", () => {
    const now = "2026-09-30T12:00:00.000Z";
    const base = {
      found: true,
      revoked: false,
      expiresAt: "2026-10-01T12:00:00.000Z",
      now,
      assignmentStatus: "ASSIGNED",
    };
    assert.equal(opportunityAccess(base), "open");
    assert.equal(opportunityAccess({ ...base, found: false }), "unavailable");
    assert.equal(opportunityAccess({ ...base, revoked: true }), "unavailable");
    assert.equal(
      opportunityAccess({ ...base, expiresAt: "2026-09-30T12:00:00.000Z" }),
      "unavailable",
    );
    assert.equal(
      opportunityAccess({ ...base, assignmentStatus: "ACCEPTED" }),
      "accepted",
    );
    assert.equal(
      opportunityAccess({ ...base, assignmentStatus: "PASSED" }),
      "passed",
    );
    assert.equal(
      opportunityAccess({ ...base, assignmentStatus: "CANCELLED" }),
      "unavailable",
    );
  });
});

describe("A5-009 email privacy", () => {
  const leaks = [
    "973-555-0142",
    "(201) 555 0199",
    "+1 862.555.0123",
    "jane.homeowner@example.com",
    "JANE@EXAMPLE.ORG",
    "14 Ridgedale Ave",
    "Apt 3B",
    "07932",
    "gate code 4411",
    "Stair rail",
  ];
  const description = [
    "Stair rail is loose. Call me at 973-555-0142 or (201) 555 0199,",
    "text +1 862.555.0123, email jane.homeowner@example.com or JANE@EXAMPLE.ORG.",
    "I live at 14 Ridgedale Ave, Apt 3B, Florham Park NJ 07932 — gate code 4411.",
  ].join("\n");

  function emailFromLeadRow() {
    const row = {
      serviceLabel: "Handyman",
      locationLabel: "Florham Park, NJ",
      timingLabel: "As soon as possible",
      description,
      photoCount: 3,
      opportunityUrl: opportunityPageUrl("abc"),
    };
    return buildVendorOpportunityEmail(row);
  }

  it("renders only controlled fields and the opportunity link", () => {
    const url = opportunityPageUrl("abc");
    assert.match(url, /\/opportunity\/abc$/);
    const message = emailFromLeadRow();
    for (const body of [message.text, message.html]) {
      assert.match(body, /New project opportunity/);
      assert.match(body, /Handyman/);
      assert.match(body, /Florham Park, NJ/);
      assert.match(body, /As soon as possible/);
      assert.match(body, /3 project photos are on the secure page/);
      assert.match(body, /Review the project details securely/);
      assert.ok(body.includes(url));
    }
    assert.match(message.html, />View project<\/a>/);
    assert.doesNotMatch(message.html, /<img /i);
  });

  it("keeps a homeowner description with contact details out of both bodies", () => {
    const message = emailFromLeadRow();
    for (const body of [message.subject, message.text, message.html]) {
      for (const leak of leaks) {
        assert.equal(
          body.toLowerCase().includes(leak.toLowerCase()),
          false,
          `email leaked ${leak}`,
        );
      }
      assert.doesNotMatch(body, /@example\./i);
      assert.doesNotMatch(body, /555/);
    }
  });

  it("does not read or accept the description for the email", () => {
    const email = readFileSync(
      join(root, "src/lib/opportunity/email.ts"),
      "utf8",
    );
    const notify = readFileSync(
      join(root, "src/lib/opportunity/notify.ts"),
      "utf8",
    );
    assert.doesNotMatch(email, /description:|input\.description/);
    assert.doesNotMatch(notify, /project_description|description:/);
    assert.doesNotMatch(email, /full_name|preferred_contact|customerPhone|customerEmail/);
  });

  it("still shows the description on the opportunity page", () => {
    const load = readFileSync(join(root, "src/lib/opportunity/load.ts"), "utf8");
    const page = readFileSync(
      join(root, "src/app/opportunity/[token]/page.tsx"),
      "utf8",
    );
    assert.match(load, /project_description/);
    assert.match(page, /project\.description/);
  });
});

describe("A5-009 rerouting", () => {
  it("drops a vendor who already passed the lead", () => {
    const vendors = [{ id: "a" }, { id: "b" }];
    assert.deepEqual(withoutPassedVendors(vendors, ["a"]), [{ id: "b" }]);
  });
});

describe("A5-009 migration and routes", () => {
  it("keeps delivery separate and the response atomic", () => {
    assert.match(migration, /notification_status/);
    assert.match(migration, /token_hash/);
    assert.doesNotMatch(migration, /token_raw|plaintext token/i);
    assert.match(migration, /admin_prepare_vendor_notification/);
    assert.match(migration, /admin_finish_vendor_notification/);
    assert.match(migration, /vendor_respond_to_assignment/);
    assert.match(migration, /VendorAccepted/);
    assert.match(migration, /VendorPassed/);
    assert.match(migration, /for update/);
    assert.match(migration, /already_accepted/);
    assert.match(migration, /already_passed/);
    assert.match(migration, /vendor_previously_passed/);
    assert.match(migration, /vendor_response_required/);
    assert.match(migration, /assignment_capabilities_deny_all/);
    assert.match(migration, /grant execute on function public\.vendor_respond_to_assignment/);
    assert.match(migration, /from public, anon, authenticated/);
    assert.doesNotMatch(migration, /content_pages/);
    assert.doesNotMatch(migration, /twilio|sms/i);
  });

  it("keeps the opportunity route out of the index", () => {
    assert.ok(SITEMAP_EXCLUSIONS.includes("/opportunity"));
    const robots = readFileSync(join(root, "src/app/robots.ts"), "utf8");
    const page = readFileSync(
      join(root, "src/app/opportunity/[token]/page.tsx"),
      "utf8",
    );
    assert.match(robots, /\/opportunity/);
    assert.match(page, /index:\s*false/);
    assert.match(page, /follow:\s*false/);
    assert.match(page, /acceptOpportunity/);
    assert.match(page, /passOpportunity/);
    assert.doesNotMatch(page, /\/admin/);
  });

  it("lets an admin send or retry without creating another assignment", () => {
    const actions = readFileSync(
      join(root, "src/lib/admin/vendor-actions.ts"),
      "utf8",
    );
    const panel = readFileSync(
      join(root, "src/components/admin/LeadAssignmentPanel.tsx"),
      "utf8",
    );
    assert.match(actions, /sendVendorEmail/);
    assert.match(actions, /resolveAdminAccess/);
    assert.match(actions, /deliverVendorNotification/);
    assert.match(panel, /Send vendor email/);
    assert.match(panel, /Retry email/);
    assert.match(panel, /Vendor email required before notification can be sent/);
    const notify = readFileSync(
      join(root, "src/lib/opportunity/notify.ts"),
      "utf8",
    );
    assert.doesNotMatch(notify, /admin_assign_lead_to_vendor/);
    const load = readFileSync(join(root, "src/lib/opportunity/load.ts"), "utf8");
    assert.match(load, /hashOpportunityToken/);
    assert.match(load, /createSignedUrl/);
  });
});
