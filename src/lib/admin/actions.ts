"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { SERVICES, type ServiceId } from "../../../config/services.ts";
import { LOCATIONS, type LocationId } from "../../../config/locations.ts";import { getSupabaseAdmin } from "../supabase/admin.ts";
import { resolveAdminAccess } from "./authorize.ts";
import type { LeadStatus } from "../db/schema.ts";
import {
  eventTypeForTransition,
  isAllowedTransition,
  isLeadStatus,
  STALE_STATUS_MESSAGE,
  validateNoteBody,
} from "./transitions.ts";

function leadPath(leadId: string): string {
  return `/admin/leads/${leadId}`;
}

function redirectWith(
  leadId: string,
  kind: "notice" | "error",
  message: string,
): never {
  const params = new URLSearchParams();
  params.set(kind, message);
  redirect(`${leadPath(leadId)}?${params.toString()}`);
}

/** VERIFY SESSION → VERIFY admin_users.active — never trust the browser. */
async function gateAdmin(): Promise<{ userId: string; email: string | null }> {
  const result = await resolveAdminAccess();
  if (!result.ok) {
    redirect("/admin/login");
  }
  return { userId: result.userId, email: result.email };
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isServiceId(value: string): value is ServiceId {
  return SERVICES.some((s) => s.id === value);
}

function isLocationId(value: string): value is LocationId {
  return LOCATIONS.some((l) => l.id === value);
}

type RpcRow = {
  ok: boolean;
  error_code: string | null;
  from_status?: string | null;
  to_status?: string | null;
  note_id?: string | null;
};

function mapTransitionError(code: string | null | undefined): string {
  switch (code) {
    case "stale_status":
      return STALE_STATUS_MESSAGE;
    case "lead_not_found":
      return "Lead not found.";
    case "invalid_status":
    case "noop_transition":
      return "That status change is not valid.";
    case "actor_required":
      return "Operator identity required.";
    default:
      return "Status change failed.";
  }
}

export async function transitionLeadStatus(formData: FormData): Promise<void> {
  const admin = await gateAdmin();
  const leadId = String(formData.get("leadId") ?? "");
  const expectedStatus = String(formData.get("expectedStatus") ?? "");
  const toStatus = String(formData.get("toStatus") ?? "");

  if (!isUuid(leadId)) {
    redirectWith(leadId || "invalid", "error", "Invalid lead.");
  }
  if (!isLeadStatus(expectedStatus) || !isLeadStatus(toStatus)) {
    redirectWith(leadId, "error", "Invalid status.");
  }
  if (!isAllowedTransition(expectedStatus, toStatus)) {
    redirectWith(leadId, "error", "That status transition is not allowed.");
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db.rpc("admin_transition_lead_status", {
    p_lead_id: leadId,
    p_expected_status: expectedStatus,
    p_to_status: toStatus,
    p_event_type: eventTypeForTransition(toStatus as LeadStatus),
    p_actor_user_id: admin.userId,
    p_note: null,
  });

  if (error) {
    console.error("[admin] transition rpc", error.code ?? "error");
    redirectWith(leadId, "error", "Status change failed.");
  }

  const row = (Array.isArray(data) ? data[0] : data) as RpcRow | undefined;
  if (!row?.ok) {
    redirectWith(leadId, "error", mapTransitionError(row?.error_code));
  }

  revalidatePath(leadPath(leadId));
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  redirectWith(leadId, "notice", `Status updated to ${toStatus}.`);
}

export async function classifyLeadService(formData: FormData): Promise<void> {
  const admin = await gateAdmin();
  const leadId = String(formData.get("leadId") ?? "");
  const serviceId = String(formData.get("serviceId") ?? "");

  if (!isUuid(leadId)) {
    redirectWith(leadId || "invalid", "error", "Invalid lead.");
  }
  if (!isServiceId(serviceId)) {
    redirectWith(leadId, "error", "Select an approved service.");
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db.rpc("admin_classify_lead_service", {
    p_lead_id: leadId,
    p_service_id: serviceId,
    p_actor_user_id: admin.userId,
  });

  if (error) {
    console.error("[admin] classify service rpc", error.code ?? "error");
    redirectWith(leadId, "error", "Service classification failed.");
  }

  const row = (Array.isArray(data) ? data[0] : data) as RpcRow | undefined;
  if (!row?.ok) {
    const msg =
      row?.error_code === "not_classifiable"
        ? "Only Not sure leads without a service can be classified."
        : row?.error_code === "already_classified"
          ? "Service already classified."
          : row?.error_code === "unknown_service"
            ? "Unknown service."
            : "Service classification failed.";
    redirectWith(leadId, "error", msg);
  }

  revalidatePath(leadPath(leadId));
  revalidatePath("/admin/leads");
  redirectWith(leadId, "notice", "Service classified.");
}

export async function classifyLeadLocation(formData: FormData): Promise<void> {
  const admin = await gateAdmin();
  const leadId = String(formData.get("leadId") ?? "");
  const locationId = String(formData.get("locationId") ?? "");

  if (!isUuid(leadId)) {
    redirectWith(leadId || "invalid", "error", "Invalid lead.");
  }
  if (!isLocationId(locationId)) {
    redirectWith(leadId, "error", "Select an approved location.");
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db.rpc("admin_classify_lead_location", {
    p_lead_id: leadId,
    p_location_id: locationId,
    p_actor_user_id: admin.userId,
  });

  if (error) {
    console.error("[admin] classify location rpc", error.code ?? "error");
    redirectWith(leadId, "error", "Location classification failed.");
  }

  const row = (Array.isArray(data) ? data[0] : data) as RpcRow | undefined;
  if (!row?.ok) {
    const msg =
      row?.error_code === "unknown_location"
        ? "Unknown location."
        : "Location classification failed.";
    redirectWith(leadId, "error", msg);
  }

  revalidatePath(leadPath(leadId));
  revalidatePath("/admin/leads");
  redirectWith(leadId, "notice", "Location classified.");
}

export async function addLeadNote(formData: FormData): Promise<void> {
  const admin = await gateAdmin();
  const leadId = String(formData.get("leadId") ?? "");
  const rawBody = String(formData.get("body") ?? "");

  if (!isUuid(leadId)) {
    redirectWith(leadId || "invalid", "error", "Invalid lead.");
  }

  const validated = validateNoteBody(rawBody);
  if (!validated.ok) {
    redirectWith(
      leadId,
      "error",
      "Note must be plain text between 1 and 2,000 characters.",
    );
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db.rpc("admin_add_lead_note", {
    p_lead_id: leadId,
    p_body: validated.body,
    p_actor_user_id: admin.userId,
  });

  if (error) {
    console.error("[admin] add note rpc", error.code ?? "error");
    redirectWith(leadId, "error", "Could not add note.");
  }

  const row = (Array.isArray(data) ? data[0] : data) as RpcRow | undefined;
  if (!row?.ok) {
    redirectWith(leadId, "error", "Could not add note.");
  }

  revalidatePath(leadPath(leadId));
  redirectWith(leadId, "notice", "Note added.");
}
