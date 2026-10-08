/**
 * Assignment choice (owner, 2026-09-30).
 * Owner update: active vendors must match the requested service and town.
 * A vendor who already PASSED that lead is excluded by the caller.
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
  return vendor.status === "ACTIVE" && !!lead.serviceId && !!lead.locationId && vendor.serviceIds.includes(lead.serviceId) && vendor.locationIds.includes(lead.locationId);
}

export function isOpenAssignmentStatus(
  status: LeadAssignmentStatus,
): boolean {
  return status === "ASSIGNED" || status === "ACCEPTED";
}

/** A vendor who PASSED this lead is not offered again. */
export function withoutPassedVendors<T extends { id: string }>(
  vendors: readonly T[],
  passedVendorIds: readonly string[],
): T[] {
  const passed = new Set(passedVendorIds);
  return vendors.filter((vendor) => !passed.has(vendor.id));
}
