import { randomUUID } from "node:crypto";
import { getSupabaseAdmin } from "../supabase/admin.ts";
import { parseSubmissionKey } from "../intake/validate-submission.ts";
import {
  extensionForMime,
  isAllowedPhotoMime,
  isExplicitlyBlockedFilename,
  LEAD_UPLOADS_BUCKET,
  validatePhotoMetas,
  type AllowedPhotoMime,
  type PhotoFileMeta,
} from "./constants.ts";
import { issuePhotoUploadGrant } from "./upload-grant.ts";

export type PreparedUpload = {
  path: string;
  token: string;
  signedUrl: string;
  mimeType: AllowedPhotoMime;
  originalFilename: string;
  fileSize: number;
};

export type PrepareUploadResult =
  | {
      success: true;
      grantToken: string;
      uploads: PreparedUpload[];
    }
  | {
      success: false;
      error: "validation" | "not_found" | "configuration" | "persistence";
      message?: string;
    };

/**
 * After a successful A5-004 lead (resolved by submission_key), issue path-scoped
 * signed upload URLs. Rejects lead_id / public_reference as sole credentials.
 */
export async function preparePhotoUploads(input: {
  submissionKey: string | null | undefined;
  files: PhotoFileMeta[];
  claimedLeadId?: unknown;
  claimedPublicReference?: unknown;
}): Promise<PrepareUploadResult> {
  if (input.claimedLeadId != null || input.claimedPublicReference != null) {
    if (!parseSubmissionKey(input.submissionKey)) {
      return {
        success: false,
        error: "validation",
        message:
          "Upload authorization requires the active submission capability.",
      };
    }
  }

  const submissionKey = parseSubmissionKey(input.submissionKey);
  if (!submissionKey) {
    return {
      success: false,
      error: "validation",
      message: "Missing submission key.",
    };
  }

  if (!Array.isArray(input.files) || input.files.length === 0) {
    return {
      success: false,
      error: "validation",
      message: "No photos to prepare.",
    };
  }

  for (const file of input.files) {
    if (isExplicitlyBlockedFilename(file.originalFilename ?? "")) {
      return {
        success: false,
        error: "validation",
        message: "That file type is not allowed.",
      };
    }
  }

  const issues = validatePhotoMetas(input.files);
  if (issues.length > 0) {
    return {
      success: false,
      error: "validation",
      message: issues[0]?.message ?? "Invalid photos.",
    };
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
    .maybeSingle();

  if (leadErr) {
    console.error("[photos] lead lookup failed", leadErr.code ?? "error");
    return { success: false, error: "persistence" };
  }
  if (!lead?.id) {
    return {
      success: false,
      error: "not_found",
      message: "No project request found for this submission.",
    };
  }

  const leadId = lead.id as string;
  const uploads: PreparedUpload[] = [];

  for (const file of input.files) {
    const mime = file.mimeType as AllowedPhotoMime;
    if (!isAllowedPhotoMime(mime)) {
      return {
        success: false,
        error: "validation",
        message: "Use JPEG, PNG, or WEBP photos only.",
      };
    }
    const path = `${leadId}/${randomUUID()}.${extensionForMime(mime)}`;
    const { data, error } = await admin.storage
      .from(LEAD_UPLOADS_BUCKET)
      .createSignedUploadUrl(path);

    if (error || !data?.token || !data?.signedUrl) {
      console.error(
        "[photos] signed upload url failed",
        error?.message ?? "empty",
      );
      return { success: false, error: "persistence" };
    }

    uploads.push({
      path: data.path ?? path,
      token: data.token,
      signedUrl: data.signedUrl,
      mimeType: mime,
      originalFilename: file.originalFilename.trim().slice(0, 255),
      fileSize: file.fileSize,
    });
  }

  const grantToken = issuePhotoUploadGrant({
    leadId,
    submissionKey,
    paths: uploads.map((u) => u.path),
  });

  return { success: true, grantToken, uploads };
}
