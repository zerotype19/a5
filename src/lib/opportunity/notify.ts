import {acceptanceHours} from '../network/policy.ts';
/**
 * A5-009 delivery attempt. Assignment state is already committed.
 * A provider failure records FAILED and does not change the assignment.
 */

import { getLocationById, type LocationId } from "../../../config/locations.ts";
import { getServiceById, type ServiceId } from "../../../config/services.ts";
import { getSupabaseAdmin } from "../supabase/admin.ts";
import { sendResendEmail } from "../email/resend.ts";
import {
  buildVendorOpportunityEmail,
  opportunityPageUrl,
  timingDisplay,
} from "./email.ts";
import { canSendVendorNotification } from "./policy.ts";
import { createOpportunityToken } from "./token.ts";

type RpcRow = {
  ok?: boolean;
  error_code?: string | null;
  vendor_email?: string | null;
};

function firstRow(data: unknown): RpcRow | undefined {
  const value = Array.isArray(data) ? data[0] : data;
  return value as RpcRow | undefined;
}

export type DeliveryResult =
  | { ok: true }
  | { ok: false; code: string };

export async function deliverVendorNotification(
  assignmentId: string,
  actorUserId: string,
): Promise<DeliveryResult> {
  const db = getSupabaseAdmin();
  const loaded = await db
    .from("lead_assignments")
    .select(
      "id, lead_id, status, notification_status, vendors(email, status, accepting_leads)",
    )
    .eq("id", assignmentId)
    .maybeSingle();
  if (loaded.error || !loaded.data) {
    return { ok: false, code: "assignment_not_found" };
  }

  const vendorRaw = loaded.data.vendors as
    | { email: string | null; status: string; accepting_leads: boolean }
    | { email: string | null; status: string; accepting_leads: boolean }[]
    | null;
  const vendor = Array.isArray(vendorRaw) ? vendorRaw[0] : vendorRaw;
  const decision = canSendVendorNotification({
    assignmentStatus: String(loaded.data.status),
    vendorStatus: vendor?.status ?? "",
    acceptingLeads: vendor?.accepting_leads === true,
    vendorEmail: vendor?.email ?? null,
    notificationStatus: (loaded.data.notification_status as string | null) ?? null,
  });
  if (!decision.ok) return decision;

  const leadId = loaded.data.lead_id as string;
  const lead = await db
    .from("leads")
    .select("service_id, location_id, urgency")
    .eq("id", leadId)
    .maybeSingle();
  if (lead.error || !lead.data) {
    return { ok: false, code: "lead_not_found" };
  }
  const photos = await db
    .from("project_photos")
    .select("id", { count: "exact", head: true })
    .eq("lead_id", leadId);
  if (photos.error) return { ok: false, code: "photo_lookup_failed" };

  const token = createOpportunityToken();
  const prepared = await db.rpc(process.env.ENABLE_NETWORK_FOLLOWUP === "true" ? "network_prepare_vendor_notification" : "admin_prepare_vendor_notification", {
    p_assignment_id: assignmentId,
    p_token_hash: token.hash,
    p_expires_at: token.expiresAt.toISOString(),
    p_actor_user_id: actorUserId,
    ...(process.env.ENABLE_NETWORK_FOLLOWUP === "true" ? {p_acceptance_hours: acceptanceHours()} : {}),
  });
  const preparedRow = firstRow(prepared.data);
  if (prepared.error || !preparedRow?.ok) {
    return {
      ok: false,
      code: preparedRow?.error_code ?? prepared.error?.code ?? "prepare_failed",
    };
  }
  const recipient = preparedRow.vendor_email?.trim() ?? "";
  if (!recipient) {
    await finish(db, assignmentId, "FAILED", "vendor_email_required");
    return { ok: false, code: "vendor_email_required" };
  }

  const service = getServiceById(lead.data.service_id as ServiceId);
  const location = getLocationById(lead.data.location_id as LocationId);
  const message = buildVendorOpportunityEmail({
    serviceLabel: service?.name ?? "Not specified",
    locationLabel: location ? `${location.name}, ${location.state}` : "Not specified",
    timingLabel: timingDisplay(lead.data.urgency as string | null),
    photoCount: photos.count ?? 0,
    opportunityUrl: opportunityPageUrl(token.raw),
    acceptanceHours: process.env.ENABLE_NETWORK_FOLLOWUP === "true" ? acceptanceHours() : 72,
  });
  const sent = await sendResendEmail({
    to: recipient,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
  if (!sent.ok) {
    await finish(db, assignmentId, "FAILED", sent.error);
    return { ok: false, code: sent.error };
  }
  await finish(db, assignmentId, "SENT", null);
  return { ok: true };
}

async function finish(
  db: ReturnType<typeof getSupabaseAdmin>,
  assignmentId: string,
  status: "SENT" | "FAILED",
  error: string | null,
): Promise<void> {
  const result = await db.rpc("admin_finish_vendor_notification", {
    p_assignment_id: assignmentId,
    p_status: status,
    p_error: error,
  });
  if (result.error) {
    console.error("[vendor-email] finish", result.error.code ?? "error");
  }
}
