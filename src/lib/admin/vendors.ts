import { getLocationById, type LocationId } from "../../../config/locations.ts";
import { getServiceById, type ServiceId } from "../../../config/services.ts";
import { getSupabaseAdmin } from "../supabase/admin.ts";
import type {
  LeadAssignmentStatus,
  NotificationStatus,
  VendorStatus,
} from "../db/schema.ts";
import { withoutPassedVendors } from "./eligibility.ts";

export type VendorCoverage = {
  id: string;
  businessName: string;
  contactName: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  source: string | null;
  sourceUrl: string | null;
  discoveryNotes: string | null;
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
  vendorEmail: string | null;
  notificationStatus: NotificationStatus | null;
  notificationAttemptedAt: string | null;
  notificationSentAt: string | null;
  notificationError: string | null;
};

type VendorRecord = {
  id: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  source: string | null;
  source_url: string | null;
  discovery_notes: string | null;
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
    website: row.website,
    source: row.source,
    sourceUrl: row.source_url,
    discoveryNotes: row.discovery_notes,
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
      "id, business_name, contact_name, phone, email, website, source, source_url, discovery_notes, status, accepting_leads, registration_number, license_number, insurance_verified, credentials_notes",
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
      "id, business_name, contact_name, phone, email, website, source, source_url, discovery_notes, status, accepting_leads, registration_number, license_number, insurance_verified, credentials_notes",
    )
    .eq("id", id)
    .maybeSingle();
  if (error) throw new Error(`admin_vendor:${error.code ?? "error"}`);
  if (!data) return null;
  const coverage = await coverageFor([id]);
  return mapVendor(data as VendorRecord, coverage.services, coverage.locations);
}

export async function loadEligibleVendors(
  lead: {
    serviceId: string | null;
    locationId: string | null;
  },
  leadId?: string,
): Promise<VendorCoverage[]> {
  void lead;
  const vendors = await loadVendors();
  if (!leadId) return vendors;
  const admin = getSupabaseAdmin();
  const passed = await admin
    .from("lead_assignments")
    .select("vendor_id")
    .eq("lead_id", leadId)
    .eq("status", "PASSED");
  if (passed.error) {
    throw new Error(`admin_passed_vendors:${passed.error.code ?? "error"}`);
  }
  return withoutPassedVendors(
    vendors,
    (passed.data ?? []).map((row) => row.vendor_id as string),
  );
}

export async function loadLeadAssignments(leadId: string): Promise<AssignmentRow[]> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin
    .from("lead_assignments")
    .select(
      "id, vendor_id, status, assigned_at, assigned_by, accepted_at, passed_at, pass_reason, notification_status, notification_attempted_at, notification_sent_at, notification_error, vendors(business_name, email)",
    )
    .eq("lead_id", leadId)
    .order("assigned_at", { ascending: false });
  if (error) throw new Error(`admin_assignments:${error.code ?? "error"}`);
  return (data ?? []).map((row) => {
    const vendor = row.vendors as
      | { business_name: string; email: string | null }
      | { business_name: string; email: string | null }[]
      | null;
    const record = Array.isArray(vendor) ? vendor[0] : vendor;
    const notice = row.notification_status as string | null;
    return {
      id: row.id as string,
      vendorId: row.vendor_id as string,
      vendorName: record?.business_name ?? "Vendor",
      status: row.status as LeadAssignmentStatus,
      assignedAt: row.assigned_at as string,
      assignedBy: row.assigned_by as string,
      acceptedAt: (row.accepted_at as string | null) ?? null,
      passedAt: (row.passed_at as string | null) ?? null,
      passReason: (row.pass_reason as string | null) ?? null,
      vendorEmail: record?.email ?? null,
      notificationStatus:
        notice === "PENDING" || notice === "SENT" || notice === "FAILED"
          ? notice
          : null,
      notificationAttemptedAt: (row.notification_attempted_at as string | null) ?? null,
      notificationSentAt: (row.notification_sent_at as string | null) ?? null,
      notificationError: (row.notification_error as string | null) ?? null,
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
