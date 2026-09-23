import { getSupabaseAdmin } from "../supabase/admin.ts";
import { parseSubmissionKey } from "../intake/validate-submission.ts";
import {
  isAllowedPhotoMime,
  isExplicitlyBlockedFilename,
  LEAD_UPLOADS_BUCKET,
  MAX_PROJECT_PHOTOS,
} from "./constants.ts";
import { verifyPhotoUploadGrant } from "./upload-grant.ts";

export type CompletedUploadInput = {
  path: string;
  originalFilename: string;
  mimeType: string;
  fileSize: number;
  uploaded: boolean;
};

export type CompleteUploadsResult =
  | {
      success: true;
      attachedCount: number;
      failedCount: number;
      photoIds: string[];
      orphans: Array<{ path: string; reason: string }>;
    }
  | {
      success: false;
      error: "validation" | "forbidden" | "not_found" | "configuration" | "persistence";
      message?: string;
    };

/**
 * Verify objects exist in private storage and insert project_photos rows.
 * Only records successful uploads. Lead is never deleted or recreated here.
 */
export async function completePhotoUploads(input: {
  submissionKey: string | null | undefined;
  grantToken: string | null | undefined;
  uploads: CompletedUploadInput[];
  claimedLeadId?: unknown;
  claimedPublicReference?: unknown;
}): Promise<CompleteUploadsResult> {
  if (
    (input.claimedLeadId != null || input.claimedPublicReference != null) &&
    !parseSubmissionKey(input.submissionKey)
  ) {
    return {
      success: false,
      error: "forbidden",
      message: "Upload authorization requires the active submission capability.",
    };
  }

  const submissionKey = parseSubmissionKey(input.submissionKey);
  if (!submissionKey) {
    return { success: false, error: "validation", message: "Missing submission key." };
  }

  const grant = verifyPhotoUploadGrant(input.grantToken, { submissionKey });
  if (!grant.ok) {
    return {
      success: false,
      error: grant.reason === "grant_expired" ? "forbidden" : "forbidden",
      message: "Upload grant is invalid or expired.",
    };
  }

  if (!Array.isArray(input.uploads) || input.uploads.length === 0) {
    return { success: false, error: "validation", message: "No upload results." };
  }
  if (input.uploads.length > MAX_PROJECT_PHOTOS) {
    return { success: false, error: "validation", message: "Too many photos." };
  }

  const allowedPaths = new Set(grant.payload.paths);
  for (const item of input.uploads) {
    if (!allowedPaths.has(item.path)) {
      return {
        success: false,
        error: "forbidden",
        message: "Upload path is not authorized.",
      };
    }
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return { success: false, error: "configuration" };
  }

  const { data: lead, error: leadErr } = await admin
    .from("leads")
    .select("id")
    .eq("submission_key", submissionKey)
    .eq("id", grant.payload.leadId)
    .maybeSingle();

  if (leadErr) {
    console.error("[photos] complete lead lookup failed", leadErr.code ?? "error");
    return { success: false, error: "persistence" };
  }
  if (!lead?.id) {
    return { success: false, error: "not_found", message: "Lead not found." };
  }

  const photoIds: string[] = [];
  const orphans: Array<{ path: string; reason: string }> = [];
  let failedCount = 0;

  for (const item of input.uploads) {
    if (!item.uploaded) {
      failedCount += 1;
      continue;
    }
    if (
      !isAllowedPhotoMime(item.mimeType) ||
      isExplicitlyBlockedFilename(item.originalFilename ?? "")
    ) {
      failedCount += 1;
      continue;
    }
    if (!Number.isFinite(item.fileSize) || item.fileSize <= 0) {
      failedCount += 1;
      continue;
    }

    // Confirm object exists in private bucket before inserting DB row.
    const objectPath = item.path;
    const folder = objectPath.includes("/")
      ? objectPath.slice(0, objectPath.lastIndexOf("/"))
      : "";
    const name = objectPath.includes("/")
      ? objectPath.slice(objectPath.lastIndexOf("/") + 1)
      : objectPath;

    const { data: listed, error: listErr } = await admin.storage
      .from(LEAD_UPLOADS_BUCKET)
      .list(folder, { search: name, limit: 20 });

    const found = listed?.some(
      (obj) => obj.name === name && typeof obj.metadata?.size === "number"
        ? true
        : obj.name === name,
    );

    if (listErr || !found) {
      console.error(
        "[photos] storage object missing after client upload",
        listErr?.message ?? "not_found",
      );
      failedCount += 1;
      continue;
    }

    const { data: inserted, error: insertErr } = await admin
      .from("project_photos")
      .insert({
        lead_id: lead.id,
        storage_bucket: LEAD_UPLOADS_BUCKET,
        storage_path: objectPath,
        original_filename: item.originalFilename.trim().slice(0, 255),
        mime_type: item.mimeType,
        file_size: Math.trunc(item.fileSize),
      })
      .select("id")
      .maybeSingle();

    if (insertErr || !inserted?.id) {
      // STORAGE WITHOUT DB — orphan object for later cleanup.
      console.error(
        "[photos] orphan: storage ok, db insert failed",
        insertErr?.code ?? "insert_failed",
      );
      orphans.push({ path: objectPath, reason: "db_insert_failed" });
      failedCount += 1;
      continue;
    }

    photoIds.push(inserted.id as string);
  }

  return {
    success: true,
    attachedCount: photoIds.length,
    failedCount,
    photoIds,
    orphans,
  };
}
