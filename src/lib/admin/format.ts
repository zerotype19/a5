import { LEAD_STATUSES, type LeadStatus } from "../db/schema.ts";

/** Display convention: UTC wall time as `YYYY-MM-DD HH:mm UTC` (no TZ lib). */
export function formatAdminDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  const hh = String(d.getUTCHours()).padStart(2, "0");
  const mm = String(d.getUTCMinutes()).padStart(2, "0");
  return `${y}-${m}-${day} ${hh}:${mm} UTC`;
}

export function formatAdminDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Derived public reference — matches A5-004 RPC (not a stored column). */
export function publicReferenceFromLeadId(leadId: string): string {
  return `A5-${leadId.replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

export function formatServiceSelection(
  status: string | null | undefined,
  serviceId: string | null | undefined,
): string {
  if (status === "NOT_SURE") {
    if (serviceId) return `Not sure → ${serviceId}`;
    return "Not sure";
  }
  if (serviceId) return serviceId;
  return "—";
}

export function formatPreferredContact(
  value: string | null | undefined,
): string {
  if (!value) return "—";
  if (value === "phone") return "Phone";
  if (value === "email") return "Email";
  if (value === "text") return "Text";
  return value;
}

/** Dashboard count chips — actual schema enums only (no invented statuses). */
export const DASHBOARD_STATUS_COUNTS: LeadStatus[] = [...LEAD_STATUSES];

export const NEEDS_ATTENTION_STATUS: LeadStatus = "NEW";
