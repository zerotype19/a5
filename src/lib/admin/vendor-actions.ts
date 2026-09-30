"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { LOCATIONS, type LocationId } from "../../../config/locations.ts";
import { SERVICES, type ServiceId } from "../../../config/services.ts";
import { isValidUsPhone } from "../../components/intake/validation.ts";
import { getSupabaseAdmin } from "../supabase/admin.ts";
import { VENDOR_STATUSES, type VendorStatus } from "../db/schema.ts";
import { resolveAdminAccess } from "./authorize.ts";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function gateAdmin(): Promise<{ userId: string }> {
  const result = await resolveAdminAccess();
  if (!result.ok) {
    redirect("/admin/login");
  }
  return { userId: result.userId };
}

function vendorPath(id: string, kind: "notice" | "error", message: string): never {
  const params = new URLSearchParams();
  params.set(kind, message);
  redirect(`/admin/vendors/${id}?${params.toString()}`);
}

export async function saveVendor(formData: FormData): Promise<void> {
  const admin = await gateAdmin();
  const rawId = String(formData.get("vendorId") ?? "").trim();
  const businessName = String(formData.get("businessName") ?? "").trim();
  const contactName = String(formData.get("contactName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const website = String(formData.get("website") ?? "").trim();
  const source = String(formData.get("source") ?? "").trim();
  const sourceUrl = String(formData.get("sourceUrl") ?? "").trim();
  const discoveryNotes = String(formData.get("discoveryNotes") ?? "").trim();
  const status = String(formData.get("status") ?? "");
  const accepting =
    status === "ACTIVE" && formData.get("acceptingLeads") === "on";
  const registration = String(formData.get("registrationNumber") ?? "").trim();
  const license = String(formData.get("licenseNumber") ?? "").trim();
  const insurance = formData.get("insuranceVerified") === "on";
  const notes = String(formData.get("credentialsNotes") ?? "").trim();
  const serviceIds = formData
    .getAll("serviceIds")
    .map(String)
    .filter((id): id is ServiceId => SERVICES.some((service) => service.id === id));
  const locationIds = formData
    .getAll("locationIds")
    .map(String)
    .filter((id): id is LocationId =>
      LOCATIONS.some((location) => location.id === id),
    );

  const back = rawId && isUuid(rawId) ? `/admin/vendors/${rawId}` : "/admin/vendors/new";
  const fail = (message: string): never => {
    const params = new URLSearchParams();
    params.set("error", message);
    redirect(`${back}?${params.toString()}`);
  };

  if (businessName.length < 1 || businessName.length > 160) {
    fail("Enter a business name (160 characters or fewer).");
  }
  if (!(VENDOR_STATUSES as readonly string[]).includes(status)) {
    fail("Choose a vendor status.");
  }
  if (phone && !isValidUsPhone(phone)) {
    fail("Enter a valid US phone number or leave phone blank.");
  }
  if (email && !EMAIL_RE.test(email)) {
    fail("Enter a valid email or leave email blank.");
  }
  if (notes.length > 2000) {
    fail("Credential notes must be 2000 characters or fewer.");
  }
  if (discoveryNotes.length > 2000) {
    fail("Discovery notes must be 2000 characters or fewer.");
  }
  if (website && !/^https?:\/\//i.test(website)) {
    fail("Website must start with http:// or https://.");
  }
  if (sourceUrl && !/^https?:\/\//i.test(sourceUrl)) {
    fail("Source URL must start with http:// or https://.");
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db.rpc("admin_upsert_vendor", {
    p_vendor_id: rawId && isUuid(rawId) ? rawId : null,
    p_business_name: businessName,
    p_contact_name: contactName || null,
    p_phone: phone || null,
    p_email: email || null,
    p_website: website || null,
    p_source: source || null,
    p_source_url: sourceUrl || null,
    p_discovery_notes: discoveryNotes || null,
    p_status: status as VendorStatus,
    p_accepting_leads: accepting,
    p_registration_number: registration || null,
    p_license_number: license || null,
    p_insurance_verified: insurance,
    p_credentials_notes: notes || null,
    p_service_ids: serviceIds,
    p_location_ids: locationIds,
    p_actor_user_id: admin.userId,
  });

  if (error) {
    console.error("[admin] upsert vendor", error.code ?? "error");
    fail("Vendor save failed.");
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | { ok?: boolean; error_code?: string | null; vendor_id?: string | null }
    | undefined;
  const savedId = row?.ok ? row.vendor_id : null;
  if (typeof savedId !== "string" || savedId.length === 0) {
    fail("Vendor save failed.");
  } else {
    revalidatePath("/admin/vendors");
    revalidatePath(`/admin/vendors/${savedId}`);
    vendorPath(savedId, "notice", "Vendor saved.");
  }
}

export async function assignLeadToVendor(formData: FormData): Promise<void> {
  const admin = await gateAdmin();
  const leadId = String(formData.get("leadId") ?? "");
  const vendorId = String(formData.get("vendorId") ?? "");
  const params = new URLSearchParams();

  if (!isUuid(leadId) || !isUuid(vendorId)) {
    params.set("error", "Choose an eligible vendor.");
    redirect(`/admin/leads/${leadId || "invalid"}?${params.toString()}`);
  }

  const db = getSupabaseAdmin();
  const { data, error } = await db.rpc("admin_assign_lead_to_vendor", {
    p_lead_id: leadId,
    p_vendor_id: vendorId,
    p_actor_user_id: admin.userId,
  });

  if (error) {
    console.error("[admin] assign lead", error.code ?? "error");
    params.set("error", "Assignment failed.");
    redirect(`/admin/leads/${leadId}?${params.toString()}`);
  }

  const row = (Array.isArray(data) ? data[0] : data) as
    | { ok?: boolean; error_code?: string | null }
    | undefined;
  if (!row?.ok) {
    const message =
      row?.error_code === "vendor_not_eligible"
        ? "That vendor is not eligible for this lead."
        : row?.error_code === "unclassified"
          ? "Classify service and location before assignment."
          : row?.error_code === "active_assignment_exists"
            ? "This lead already has an open assignment."
            : row?.error_code === "stale_status"
              ? "This lead is no longer QUALIFIED. Refresh before assigning."
              : "Assignment failed.";
    params.set("error", message);
    redirect(`/admin/leads/${leadId}?${params.toString()}`);
  }

  revalidatePath(`/admin/leads/${leadId}`);
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
  params.set("notice", "Vendor assigned. Notification is not enabled.");
  redirect(`/admin/leads/${leadId}?${params.toString()}`);
}
