/**
 * Deterministic vendor eligibility (A5-008).
 * ACTIVE + accepting_leads + service coverage + location coverage.
 * Null lead service or location matches nobody. No ZIP inference.
 */

import type { LeadAssignmentStatus, VendorStatus } from "../db/schema.ts";

export type EligibilityVendor = {
  id: string;
  status: VendorStatus;
  acceptingLeads: boolean;
  serviceIds: readonly string[];
  locationIds: readonly string[];
};

export function isVendorEligible(
  vendor: EligibilityVendor,
  lead: { serviceId: string | null; locationId: string | null },
): boolean {
  if (!lead.serviceId || !lead.locationId) return false;
  return (
    vendor.status === "ACTIVE" &&
    vendor.acceptingLeads === true &&
    vendor.serviceIds.includes(lead.serviceId) &&
    vendor.locationIds.includes(lead.locationId)
  );
}

export function isOpenAssignmentStatus(
  status: LeadAssignmentStatus,
): boolean {
  return status === "ASSIGNED" || status === "ACCEPTED";
}
