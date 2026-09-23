/** A5-005 photo upload constants and client/server shared validation. */

export const LEAD_UPLOADS_BUCKET = "lead-uploads" as const;

export const MAX_PROJECT_PHOTOS = 5;
export const MAX_PHOTO_BYTES = 10 * 1024 * 1024; // 10 MiB

export const ALLOWED_PHOTO_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedPhotoMime = (typeof ALLOWED_PHOTO_MIME_TYPES)[number];

const MIME_TO_EXT: Record<AllowedPhotoMime, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function isAllowedPhotoMime(value: string): value is AllowedPhotoMime {
  return (ALLOWED_PHOTO_MIME_TYPES as readonly string[]).includes(value);
}

export function extensionForMime(mime: AllowedPhotoMime): string {
  return MIME_TO_EXT[mime];
}

export type PhotoFileMeta = {
  originalFilename: string;
  mimeType: string;
  fileSize: number;
};

export type PhotoValidationIssue = {
  code: string;
  message: string;
  index?: number;
};

/**
 * Validate photo metadata (client convenience + authoritative server check).
 * Does not trust filename extension alone — MIME must be an allowlisted type.
 */
export function validatePhotoMetas(
  files: PhotoFileMeta[],
): PhotoValidationIssue[] {
  const issues: PhotoValidationIssue[] = [];

  if (files.length > MAX_PROJECT_PHOTOS) {
    issues.push({
      code: "too_many_photos",
      message: `You can attach up to ${MAX_PROJECT_PHOTOS} photos.`,
    });
    return issues;
  }

  files.forEach((file, index) => {
    if (!file.originalFilename?.trim()) {
      issues.push({
        index,
        code: "missing_filename",
        message: "Each photo needs a filename.",
      });
    }
    if (!isAllowedPhotoMime(file.mimeType)) {
      issues.push({
        index,
        code: "unsupported_type",
        message: "Use JPEG, PNG, or WEBP photos only.",
      });
    }
    if (!Number.isFinite(file.fileSize) || file.fileSize <= 0) {
      issues.push({
        index,
        code: "empty_file",
        message: "Photo file is empty.",
      });
    } else if (file.fileSize > MAX_PHOTO_BYTES) {
      issues.push({
        index,
        code: "file_too_large",
        message: "Each photo must be 10 MB or smaller.",
      });
    }
  });

  return issues;
}

/** Reject dangerous types that must never slip through by extension games. */
export function isExplicitlyBlockedFilename(name: string): boolean {
  const lower = name.trim().toLowerCase();
  return (
    lower.endsWith(".svg") ||
    lower.endsWith(".html") ||
    lower.endsWith(".htm") ||
    lower.endsWith(".js") ||
    lower.endsWith(".pdf") ||
    lower.endsWith(".zip") ||
    lower.endsWith(".exe") ||
    lower.endsWith(".heic") ||
    lower.endsWith(".heif")
  );
}
