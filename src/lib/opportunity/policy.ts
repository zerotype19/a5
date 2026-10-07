/**
 * A5-009 vendor notification and opportunity rules.
 * The database RPCs are authoritative for races. These functions are the
 * application decisions tests lock in.
 */

export const NOTIFICATION_STATUSES = ["PENDING", "SENT", "FAILED"] as const;

export type NotificationStatus = (typeof NOTIFICATION_STATUSES)[number];

export const OPPORTUNITY_TTL_HOURS = 72;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type SendBlockCode =
  | "assignment_not_open"
  | "vendor_not_active"
  | "vendor_not_accepting"
  | "vendor_email_required"
  | "already_sent";

export function canSendVendorNotification(input: {
  assignmentStatus: string;
  vendorStatus: string;
  acceptingLeads: boolean;
  vendorEmail: string | null;
  notificationStatus: string | null;
}): { ok: true } | { ok: false; code: SendBlockCode } {
  if (input.assignmentStatus !== "ASSIGNED") {
    return { ok: false, code: "assignment_not_open" };
  }
  const email = input.vendorEmail?.trim() ?? "";
  if (!email || !EMAIL_RE.test(email)) {
    return { ok: false, code: "vendor_email_required" };
  }
  if (input.notificationStatus === "SENT") {
    return { ok: false, code: "already_sent" };
  }
  return { ok: true };
}

export type OpportunityAccess = "unavailable" | "open" | "accepted" | "passed";

/**
 * Unknown, revoked, and expired capabilities all return unavailable.
 * The public page uses one message for those cases.
 */
export function opportunityAccess(input: {
  found: boolean;
  revoked: boolean;
  expiresAt: string | null;
  now: string;
  assignmentStatus: string | null;
}): OpportunityAccess {
  if (!input.found || input.revoked || !input.expiresAt) return "unavailable";
  const expires = Date.parse(input.expiresAt);
  const now = Date.parse(input.now);
  if (!Number.isFinite(expires) || !Number.isFinite(now) || expires <= now) {
    return "unavailable";
  }
  if (input.assignmentStatus === "ACCEPTED") return "accepted";
  if (input.assignmentStatus === "PASSED") return "passed";
  if (input.assignmentStatus === "ASSIGNED") return "open";
  return "unavailable";
}
