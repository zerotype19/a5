/**
 * A5-009 opportunity read. Service role only, after the capability hash matches.
 * Customer contact is loaded only when the assignment is already ACCEPTED.
 */

import { getLocationById, type LocationId } from "../../../config/locations.ts";
import { getServiceById, type ServiceId } from "../../../config/services.ts";
import { LEAD_UPLOADS_BUCKET } from "../photos/constants.ts";
import { getSupabaseAdmin } from "../supabase/admin.ts";
import { formatPreferredContact } from "../admin/format.ts";
import { timingDisplay } from "./email.ts";
import { opportunityAccess, type OpportunityAccess } from "./policy.ts";
import { hashOpportunityToken, isOpportunityToken } from "./token.ts";

export type OpportunityProject = {
  vendorName: string;
  acceptanceDueAt: string;
  serviceLabel: string;
  locationLabel: string;
  timingLabel: string;
  description: string;
  photos: { id: string; url: string }[];
};

export type OpportunityContact = {
  name: string;
  preferredContact: string;
  phone: string;
  email: string;
};

export type LoadedOpportunity =
  | { access: "unavailable" }
  | { access: "passed" }
  | { access: "open"; project: OpportunityProject }
  | { access: "accepted"; project: OpportunityProject; contact: OpportunityContact };

export async function loadOpportunity(token: string, client?: ReturnType<typeof getSupabaseAdmin>): Promise<LoadedOpportunity> {
  if (!isOpportunityToken(token)) return { access: "unavailable" };
  const db = client ?? getSupabaseAdmin();
  const capability = await db
    .from("assignment_capabilities")
    .select("assignment_id, expires_at, revoked_at")
    .eq("token_hash", hashOpportunityToken(token))
    .maybeSingle();
  if (capability.error || !capability.data) return { access: "unavailable" };

  const assignmentResult = await db
    .from("lead_assignments")
    .select(process.env.ENABLE_NETWORK_FOLLOWUP === "true" ? "id, lead_id, status, acceptance_due_at, vendors(business_name)" : "id, lead_id, status, vendors(business_name)")
    .eq("id", capability.data.assignment_id as string)
    .maybeSingle();

  const assignment = { ...assignmentResult, data: assignmentResult.data as unknown as {status:string;lead_id:string;acceptance_due_at?:string|null;vendors?:{business_name:string}|{business_name:string}[]|null}|null };
  const access: OpportunityAccess = opportunityAccess({
    found: true,
    revoked: capability.data.revoked_at != null,
    expiresAt: capability.data.expires_at as string,
    now: new Date().toISOString(),
    assignmentStatus: (assignment.data?.status as string | null) ?? null,
    acceptanceDueAt: (assignment.data?.acceptance_due_at as string | null) ?? null,
  });
  if (access === "unavailable" || access === "passed" || !assignment.data) {
    return { access: access === "passed" ? "passed" : "unavailable" };
  }

  const leadId = assignment.data.lead_id as string;
  const lead = await db
    .from("leads")
    .select("service_id, location_id, urgency, archived_at")
    .eq("id", leadId)
    .maybeSingle();
  if (lead.error || !lead.data || lead.data.archived_at) return { access: "unavailable" };

  const service = getServiceById(lead.data.service_id as ServiceId);
  const location = getLocationById(lead.data.location_id as LocationId);
  const vendor=assignment.data.vendors;
  const project: OpportunityProject = {
    vendorName:(Array.isArray(vendor)?vendor[0]:vendor)?.business_name??"service professional",
    acceptanceDueAt: assignment.data.acceptance_due_at ?? String(capability.data.expires_at),
    serviceLabel: service?.name ?? "Not specified",
    locationLabel: location ? `${location.name}, ${location.state}` : "Not specified",
    timingLabel: timingDisplay(lead.data.urgency as string | null),
    description: "Accept this opportunity to view the homeowner’s full request and any photos. Acceptance means you intend to contact the homeowner; it does not book or guarantee the work.",
    photos: [],
  };

  if (access === "open") return { access: "open", project };

  const withCustomer = await db
    .from("leads")
    .select("project_description, customers(full_name, phone, email, preferred_contact_method)")
    .eq("id", leadId)
    .maybeSingle();
  if (withCustomer.error || !withCustomer.data) return { access: "unavailable" };
  project.description = String(withCustomer.data.project_description ?? "").trim() || "No description was provided.";
  project.photos = await signedPhotos(leadId, db);
  const raw = withCustomer.data?.customers as
    | {
        full_name: string | null;
        phone: string | null;
        email: string | null;
        preferred_contact_method: string | null;
      }
    | {
        full_name: string | null;
        phone: string | null;
        email: string | null;
        preferred_contact_method: string | null;
      }[]
    | null;
  const customer = Array.isArray(raw) ? raw[0] : raw;
  return {
    access: "accepted",
    project,
    contact: {
      name: customer?.full_name?.trim() || "Not provided",
      preferredContact: formatPreferredContact(customer?.preferred_contact_method),
      phone: customer?.phone?.trim() || "Not provided",
      email: customer?.email?.trim() || "Not provided",
    },
  };
}

async function signedPhotos(leadId: string, db: ReturnType<typeof getSupabaseAdmin>): Promise<{ id: string; url: string }[]> {
  const photos = await db
    .from("project_photos")
    .select("id, storage_bucket, storage_path")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });
  if (photos.error) return [];
  const signed = [];
  for (const photo of photos.data ?? []) {
    const bucket = (photo.storage_bucket as string) || LEAD_UPLOADS_BUCKET;
    const path = photo.storage_path as string;
    const { data, error } = await db.storage.from(bucket).createSignedUrl(path, 60 * 10);
    if (error || !data?.signedUrl) continue;
    signed.push({ id: photo.id as string, url: data.signedUrl });
  }
  return signed;
}
