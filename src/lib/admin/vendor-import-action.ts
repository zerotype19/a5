"use server";

import {vendorContactState} from "./vendor-contact.ts";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "../supabase/admin.ts";
import { resolveAdminAccess } from "./authorize.ts";
import {
  parseVendorCandidateCsv,
  type VendorImportRejection,
} from "./vendor-import.ts";

export type VendorImportResult = {
  imported: number;
  rejected: VendorImportRejection[];
  fileError: string | null;
};

export async function importVendorCandidates(
  _previous: VendorImportResult | null,
  formData: FormData,
): Promise<VendorImportResult> {
  const access = await resolveAdminAccess();
  if (!access.ok) {
    redirect("/admin/login");
  }

  const file = formData.get("csvFile");
  let text = String(formData.get("csvText") ?? "");
  if (file instanceof File && file.size > 0) {
    text = await file.text();
  }

  const db = getSupabaseAdmin();
  const existing = await db.from("vendors").select("business_name");
  if (existing.error) {
    return {
      imported: 0,
      rejected: [],
      fileError: "Could not read existing vendors. Nothing was imported.",
    };
  }
  const names = (existing.data ?? []).map(
    (row) => String(row.business_name ?? ""),
  );
  const parsed = parseVendorCandidateCsv(text, names);
  if (parsed.fileError) {
    return { imported: 0, rejected: [], fileError: parsed.fileError };
  }

  const rejected = [...parsed.rejected];
  let imported = 0;
  for (const row of parsed.rows) {
    const { data, error } = await db.rpc("admin_upsert_vendor", {
      p_vendor_id: null,
      p_business_name: row.businessName,
      p_contact_name: row.contactName || null,
      p_phone: row.phone || null,
      p_email: row.email || null,
      p_website: row.website || null,
      p_source: row.source || null,
      p_source_url: row.sourceUrl || null,
      p_discovery_notes: row.discoveryNotes || null,
      p_status: vendorContactState(row.email,"DISCOVERED",false).status,
      p_accepting_leads: false,
      p_registration_number: null,
      p_license_number: null,
      p_insurance_verified: false,
      p_credentials_notes: null,
      p_service_ids: row.serviceIds,
      p_location_ids: row.locationIds,
      p_actor_user_id: access.userId,
    });
    const result = (Array.isArray(data) ? data[0] : data) as
      | { ok?: boolean }
      | undefined;
    if (error || !result?.ok) {
      rejected.push({
        row: row.row,
        businessName: row.businessName,
        reason: "Save failed. This row was not imported.",
      });
      continue;
    }
    imported += 1;
  }

  revalidatePath("/admin/vendors");
  revalidatePath("/admin/queue");
  return { imported, rejected, fileError: null };
}
