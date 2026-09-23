import { getSupabaseAdmin } from "../supabase/admin.ts";
import { LEAD_STATUSES, type LeadStatus } from "../db/schema.ts";
import { LEAD_UPLOADS_BUCKET } from "../photos/constants.ts";
import {
  formatServiceSelection,
  publicReferenceFromLeadId,
} from "./format.ts";

export type LeadListRow = {
  id: string;
  publicReference: string;
  createdAt: string;
  customerName: string;
  serviceLabel: string;
  postalCode: string | null;
  locationId: string | null;
  urgency: string | null;
  status: LeadStatus;
};

export type StatusCounts = Record<LeadStatus, number>;

export type LeadHistoryEvent = {
  id: string;
  occurredAt: string;
  eventType: string;
  fromStatus: LeadStatus | null;
  toStatus: LeadStatus;
  note: string | null;
  actorUserId: string | null;
};

export type LeadNoteRow = {
  id: string;
  body: string;
  createdAt: string;
  createdBy: string;
  createdByEmail: string | null;
};

export type LeadDetail = {
  id: string;
  publicReference: string;
  status: LeadStatus;
  createdAt: string;
  updatedAt: string;
  projectDescription: string;
  urgency: string | null;
  serviceId: string | null;
  serviceSelectionStatus: string | null;
  serviceLabel: string;
  postalCode: string | null;
  locationId: string | null;
  customer: {
    id: string;
    fullName: string;
    phone: string | null;
    email: string | null;
    preferredContact: string | null;
  };
  photos: Array<{
    id: string;
    storagePath: string;
    mimeType: string;
    fileSize: number;
    originalFilename: string | null;
    createdAt: string;
    signedUrl: string | null;
  }>;
  history: LeadHistoryEvent[];
  notes: LeadNoteRow[];
};

function emptyCounts(): StatusCounts {
  return Object.fromEntries(LEAD_STATUSES.map((s) => [s, 0])) as StatusCounts;
}

/** Privileged reads — caller must already have passed requireAdminAccess(). */
export async function loadDashboard(): Promise<{
  counts: StatusCounts;
  needsAttention: number;
  recent: LeadListRow[];
  totalLeads: number;
}> {
  const admin = getSupabaseAdmin();

  const { data: statusRows, error: statusErr } = await admin
    .from("leads")
    .select("status");

  if (statusErr) {
    throw new Error(`admin_dashboard_counts:${statusErr.code ?? "error"}`);
  }

  const counts = emptyCounts();
  for (const row of statusRows ?? []) {
    const status = row.status as LeadStatus;
    if (status in counts) counts[status] += 1;
  }

  const totalLeads = (statusRows ?? []).length;
  const needsAttention = counts.NEW;

  const recent = await loadLeadList({ limit: 12 });

  return { counts, needsAttention, recent, totalLeads };
}

export async function loadLeadList(options?: {
  limit?: number;
  status?: LeadStatus | null;
  serviceId?: string | null;
}): Promise<LeadListRow[]> {
  const admin = getSupabaseAdmin();
  let query = admin
    .from("leads")
    .select(
      "id, created_at, status, service_id, service_selection_status, postal_code, location_id, urgency, customers(full_name)",
    )
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.serviceId) {
    query = query.eq("service_id", options.serviceId);
  }
  if (options?.limit) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error) {
    throw new Error(`admin_lead_list:${error.code ?? "error"}`);
  }

  return (data ?? []).map((row) => {
    const customer = Array.isArray(row.customers)
      ? row.customers[0]
      : row.customers;
    return {
      id: row.id as string,
      publicReference: publicReferenceFromLeadId(row.id as string),
      createdAt: row.created_at as string,
      customerName: (customer as { full_name?: string } | null)?.full_name ?? "—",
      serviceLabel: formatServiceSelection(
        row.service_selection_status as string | null,
        row.service_id as string | null,
      ),
      postalCode: (row.postal_code as string | null) ?? null,
      locationId: (row.location_id as string | null) ?? null,
      urgency: (row.urgency as string | null) ?? null,
      status: row.status as LeadStatus,
    };
  });
}

export async function loadLeadDetail(leadId: string): Promise<LeadDetail | null> {
  const admin = getSupabaseAdmin();

  const { data: lead, error } = await admin
    .from("leads")
    .select(
      "id, created_at, updated_at, status, project_description, urgency, service_id, service_selection_status, postal_code, location_id, customers(id, full_name, phone, email, preferred_contact_method)",
    )
    .eq("id", leadId)
    .maybeSingle();

  if (error) {
    throw new Error(`admin_lead_detail:${error.code ?? "error"}`);
  }
  if (!lead) return null;

  const customerRaw = Array.isArray(lead.customers)
    ? lead.customers[0]
    : lead.customers;
  const customer = customerRaw as {
    id: string;
    full_name: string;
    phone: string | null;
    email: string | null;
    preferred_contact_method: string | null;
  } | null;

  if (!customer) {
    throw new Error("admin_lead_detail:missing_customer");
  }

  const { data: photos, error: photoErr } = await admin
    .from("project_photos")
    .select(
      "id, storage_bucket, storage_path, mime_type, file_size, original_filename, created_at",
    )
    .eq("lead_id", leadId)
    .order("created_at", { ascending: true });

  if (photoErr) {
    throw new Error(`admin_lead_photos:${photoErr.code ?? "error"}`);
  }

  const enriched = [];
  for (const photo of photos ?? []) {
    const bucket = (photo.storage_bucket as string) || LEAD_UPLOADS_BUCKET;
    const path = photo.storage_path as string;
    const { data: signed, error: signErr } = await admin.storage
      .from(bucket)
      .createSignedUrl(path, 60 * 15); // 15 minutes

    if (signErr) {
      console.error("[admin] signed read failed", signErr.message ?? "error");
    }

    enriched.push({
      id: photo.id as string,
      storagePath: path,
      mimeType: photo.mime_type as string,
      fileSize: Number(photo.file_size),
      originalFilename: (photo.original_filename as string | null) ?? null,
      createdAt: photo.created_at as string,
      signedUrl: signed?.signedUrl ?? null,
    });
  }

  const { data: events, error: eventsErr } = await admin
    .from("lead_status_events")
    .select(
      "id, occurred_at, event_type, from_status, to_status, note, actor_user_id",
    )
    .eq("lead_id", leadId)
    .order("occurred_at", { ascending: true });

  if (eventsErr) {
    throw new Error(`admin_lead_history:${eventsErr.code ?? "error"}`);
  }

  const history: LeadHistoryEvent[] = (events ?? []).map((row) => ({
    id: row.id as string,
    occurredAt: row.occurred_at as string,
    eventType: row.event_type as string,
    fromStatus: (row.from_status as LeadStatus | null) ?? null,
    toStatus: row.to_status as LeadStatus,
    note: (row.note as string | null) ?? null,
    actorUserId: (row.actor_user_id as string | null) ?? null,
  }));

  const { data: noteRows, error: notesErr } = await admin
    .from("lead_notes")
    .select("id, body, created_at, created_by")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false });

  if (notesErr) {
    throw new Error(`admin_lead_notes:${notesErr.code ?? "error"}`);
  }

  const creatorIds = [
    ...new Set(
      (noteRows ?? [])
        .map((n) => n.created_by as string)
        .filter(Boolean),
    ),
  ];
  const emailByUserId = new Map<string, string | null>();
  for (const userId of creatorIds) {
    const { data: userData, error: userErr } =
      await admin.auth.admin.getUserById(userId);
    if (userErr) {
      console.error("[admin] note actor lookup", userErr.message ?? "error");
      emailByUserId.set(userId, null);
    } else {
      emailByUserId.set(userId, userData.user?.email ?? null);
    }
  }

  const notes: LeadNoteRow[] = (noteRows ?? []).map((row) => {
    const createdBy = row.created_by as string;
    return {
      id: row.id as string,
      body: row.body as string,
      createdAt: row.created_at as string,
      createdBy,
      createdByEmail: emailByUserId.get(createdBy) ?? null,
    };
  });

  return {
    id: lead.id as string,
    publicReference: publicReferenceFromLeadId(lead.id as string),
    status: lead.status as LeadStatus,
    createdAt: lead.created_at as string,
    updatedAt: lead.updated_at as string,
    projectDescription: lead.project_description as string,
    urgency: (lead.urgency as string | null) ?? null,
    serviceId: (lead.service_id as string | null) ?? null,
    serviceSelectionStatus:
      (lead.service_selection_status as string | null) ?? null,
    serviceLabel: formatServiceSelection(
      lead.service_selection_status as string | null,
      lead.service_id as string | null,
    ),
    postalCode: (lead.postal_code as string | null) ?? null,
    locationId: (lead.location_id as string | null) ?? null,
    customer: {
      id: customer.id,
      fullName: customer.full_name,
      phone: customer.phone,
      email: customer.email,
      preferredContact: customer.preferred_contact_method,
    },
    photos: enriched,
    history,
    notes,
  };
}

/**
 * Rejects unauthenticated signed-read attempts that only know lead_id /
 * public_reference / storage_path. Real signed URLs require requireAdminAccess first.
 */
export function rejectPublicPhotoCredential(input: {
  leadId?: string;
  publicReference?: string;
  storagePath?: string;
}): never {
  void input;
  throw new Error("photo_signed_read_requires_admin");
}
