/**
 * Canonical lead status transitions for A5-007 (no vendor infrastructure).
 * Source of truth for ADVANCE STATUS / QUALIFY / UNSERVICEABLE UI + server validation.
 * ASSIGNED and later funnel steps remain unavailable until A5-008.
 */

import { LEAD_STATUSES, type LeadStatus } from "../db/schema.ts";

/** Explicit allow-list: from → allowed to. Missing/empty = no ops transitions yet. */
export const LEAD_STATUS_TRANSITIONS: Record<
  LeadStatus,
  readonly LeadStatus[]
> = {
  NEW: ["QUALIFIED", "UNSERVICEABLE", "INVALID", "DUPLICATE"],
  QUALIFIED: ["LOST", "UNSERVICEABLE", "INVALID", "DUPLICATE"],
  // Vendor-dependent — intentionally empty in A5-007
  ASSIGNED: [],
  ACCEPTED: [],
  CONTACTED: [],
  ESTIMATE: [],
  WON: [],
  LOST: [],
  INVALID: [],
  DUPLICATE: [],
  UNSERVICEABLE: [],
};

export function allowedTransitions(from: LeadStatus): readonly LeadStatus[] {
  return LEAD_STATUS_TRANSITIONS[from] ?? [];
}

export function isAllowedTransition(
  from: LeadStatus,
  to: LeadStatus,
): boolean {
  return allowedTransitions(from).includes(to);
}

export function isLeadStatus(value: string): value is LeadStatus {
  return (LEAD_STATUSES as readonly string[]).includes(value);
}

/** Event type labels for ledger rows (non-exhaustive; matches RPC inserts). */
export function eventTypeForTransition(to: LeadStatus): string {
  switch (to) {
    case "QUALIFIED":
      return "LeadQualified";
    case "UNSERVICEABLE":
      return "LeadMarkedUnserviceable";
    case "INVALID":
      return "LeadMarkedInvalid";
    case "DUPLICATE":
      return "LeadMarkedDuplicate";
    case "LOST":
      return "LeadLost";
    case "ASSIGNED":
      return "VendorAssigned";
    case "ACCEPTED":
      return "VendorAccepted";
    case "CONTACTED":
      return "CustomerContacted";
    case "ESTIMATE":
      return "EstimateCreated";
    case "WON":
      return "LeadWon";
    case "NEW":
      return "LeadCreated";
    default: {
      const _exhaustive: never = to;
      return `LeadStatus:${_exhaustive}`;
    }
  }
}

export const NOTE_BODY_MIN = 1;
export const NOTE_BODY_MAX = 2000;

export function validateNoteBody(
  body: string,
): { ok: true; body: string } | { ok: false; code: "invalid_note_body" } {
  const trimmed = body.trim();
  if (
    trimmed.length < NOTE_BODY_MIN ||
    trimmed.length > NOTE_BODY_MAX
  ) {
    return { ok: false, code: "invalid_note_body" };
  }
  return { ok: true, body: trimmed };
}

export const STALE_STATUS_MESSAGE =
  "This lead changed since the page was loaded. Refresh before continuing.";
