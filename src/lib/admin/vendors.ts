import { getLocationById, type LocationId } from "../../../config/locations.ts";
import { getServiceById, type ServiceId } from "../../../config/services.ts";
import { getSupabaseAdmin } from "../supabase/admin.ts";
import type { LeadAssignmentStatus, VendorStatus } from "../db/schema.ts";
import { isVendorEligible } from "./eligibility.ts";

export type VendorCoverage = {
  id: string;
  businessName: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  status: VendorStatus;
  acceptingLeads: boolean;
  registrationNumber: string | null;
  licenseNumber: string | null;
  insuranceVerified: boolean;
  credentialsNotes: string | null;
  serviceIds: string[];
  locationIds: string[];
};

export type AssignmentRow = {
  id: string;
  vendorId: string;
  vendorName: string;
  status: LeadAssignmentStatus;
  assignedAt: string;
  assignedBy: string;
  acceptedAt: string | null;
  passedAt: string | null;
  passReason: string | null;
};

type VendorRecord = {
  id: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  status: VendorStatus;
  accepting_leads: boolean;
  registration_number: string | null;
  license_number: string | null;
  insurance_verified: boolean;
  credentials_notes: string | null;
};

async function coverageFor(vendorIds: string[]): Promise<{
  services: Map<string, string[]>;
  locations: Map<string, string[]>;
}> {
  const services = new Map<string, string[]>();
  const locations = new Map<string, string[]>();
  if (vendorIds.length === 0) return { services, locations };
  const admin = getSupabaseAdmin();
  const { data: serviceRows, error: serviceErr } = await admin
    .from("vendor_services")
    .select("vendor_id, service_id")
    .in("vendor_id", vendorIds);
  if (serviceErr) {
    throw new Error(`admin_vendor_services:${serviceErr.code ?? "error"}`);
  }
  for (const row of serviceRows ?? []) {
    const id = row.vendor_id as string;
    const list = services.get(id) ?? [];
    list.push(row.service_id as string);
    services.set(id, list);
  }
  const { data: locationRows, error: locationErr } = await admin
    .from("vendor_locations")
    .select("vendor_id, location_id")
    .in("vendor_id", vendorIds);
  if (locationErr) {
    throw new Error(`admin_vendor_locations:${locationErr.code ?? "error"}`);
  }
  for (const row of locationRows ?? []) {
    const id = row.vendor_id as string;
    const list = locations.get(id) ?? [];
    list.push(row.location_id as string);
    locations.set(id, list);
  }
  return { services, locations };
}

function mapVendor(
  row: VendorRecord,
  services: Map<string, string[]>,
  locations: Map<string, string[]>,
): VendorCoverage {
  return {
    id: row.id,
    businessName: row.business_name,
    contactName: row.contact_name,
    phone: row.phone,
    email: row.email,
    status: row.status,
    acceptingLeads: row.accepting_leads,
    registrationNumber: row.registration_number,
    licenseNumber: row.license_number,
    insuranceVerified: row.insurance_verified,
    credentialsNotes: row.credentials_notes,
    serviceIds: services.get(row.id) ?? [],
    locationIds: locations.get(row.id) ?? [],
  };
}

export async function loadVendors(): Promise<VendorCoverage[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("vendors")
    .select(
      "id, business_name, contact_name, phone, email, status, accepting_leads, registration_number, license_number, insurance_verified, credentials_notes",
    )
    .order("business_name", { ascending: true });
  if (error) throw new Error(`admin_vendors:${error.code ?? "error"}`);
  const rows = (data ?? []) as VendorRecord[];
  const coverage = await coverageFor(rows.map((row) => row.id));
  return rows.map((row) => mapVendor(row, coverage.services, coverage.locations));
}

export async function loadVendor(id: string): Promise<VendorCoverage | null> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("vendors")
    .select(
      "id, business_name, contact_name, phone, email, status, accepting_leads, registration_number, license_number, insurance_verified, credentials_notes",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`admin_vendor:${error.code ?? "error"}`);
  if (!data) return null;
  const coverage = await coverageFor([id]);
  return mapVendor(data as VendorRecord, coverage.services, coverage.locations);
}

export async function loadEligibleVendors(lead: {
  serviceId: string | null;
  locationId: string | null;
}): Promise<VendorCoverage[]> {
  if (!lead.serviceId || !lead.locationId) return [];
  const vendors = await loadVendors();
  return vendors.filter((vendor) =>
    isVendorEligible(
      {
        id: vendor.id,
        status: vendor.status,
        acceptingLeads: vendor.acceptingLeads,
        serviceIds: vendor.serviceIds,
        locationIds: vendor.locationIds,
      },
      lead,
    ),
  );
}

export async function loadLeadAssignments(leadId: string): Promise<AssignmentRow[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("lead_assignments")
    .select(
      "id, vendor_id, status, assigned_at, assigned_by, accepted_at, passed_at, pass_reason, vendors(business_name)",
    )
    .eq("lead_id", leadId)
    .order("assigned_at", { ascending: false });
  if (error) throw new Error(`admin_assignments:${error.code ?? "error"}`);
  return (data ?? []).map((row) => {
    const vendor = row.vendors as
      | { business_name: string }
      | { business_name: string }[]
      | null;
    const name = Array.isArray(vendor)
      ? vendor[0]?.business_name
      : vendor?.business_name;
    return {
      id: row.id as string,
      vendorId: row.vendor_id as string,
      vendorName: name ?? "Vendor",
      status: row.status as LeadAssignmentStatus,
      assignedAt: row.assigned_at as string,
      assignedBy: row.assigned_by as string,
      acceptedAt: (row.accepted_at as string | null) ?? null,
      passedAt: (row.passed_at as string | null) ?? null,
      passReason: (row.pass_reason as string | null) ?? null,
    };
  });
}

export function coverageLabels(vendor: VendorCoverage): {
  services: string;
  locations: string;
} {
  const services = vendor.serviceIds
    .map((id) => getServiceById(id as ServiceId)?.name ?? id)
    .join(", ");
  const locations = vendor.locationIds
    .map((id) => getLocationById(id as LocationId)?.name ?? id)
    .join(", ");
  return {
    services: services || "—",
    locations: locations || "—",
  };
}
