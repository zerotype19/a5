import { NextResponse } from "next/server";
import { completePhotoUploads } from "@/lib/photos/complete-uploads";

export const runtime = "nodejs";

/**
 * Confirm uploaded objects and create project_photos rows.
 * Never deletes or recreates the lead.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "validation", message: "Invalid request." },
      { status: 400 },
    );
  }

  const record = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  const submissionKey =
    (typeof record.submissionKey === "string" && record.submissionKey) ||
    request.headers.get("idempotency-key");

  const result = await completePhotoUploads({
    submissionKey,
    grantToken: typeof record.grantToken === "string" ? record.grantToken : null,
    uploads: Array.isArray(record.uploads) ? (record.uploads as never) : [],
    claimedLeadId: record.leadId,
    claimedPublicReference: record.publicReference,
  });

  if (!result.success) {
    const status =
      result.error === "validation"
        ? 400
        : result.error === "forbidden"
          ? 403
          : result.error === "not_found"
            ? 404
            : result.error === "configuration"
              ? 503
              : 502;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, { status: 200 });
}
