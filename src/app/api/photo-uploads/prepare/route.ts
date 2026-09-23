import { NextResponse } from "next/server";
import { preparePhotoUploads } from "@/lib/photos/prepare-uploads";

export const runtime = "nodejs";

/**
 * Issue path-scoped signed upload URLs for photos belonging to an existing lead.
 * Auth: active submission_key (+ server grant). lead_id / public_reference alone rejected.
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

  const result = await preparePhotoUploads({
    submissionKey,
    files: Array.isArray(record.files) ? (record.files as never) : [],
    claimedLeadId: record.leadId,
    claimedPublicReference: record.publicReference,
  });

  if (!result.success) {
    const status =
      result.error === "validation"
        ? 400
        : result.error === "not_found"
          ? 404
          : result.error === "configuration"
            ? 503
            : 502;
    return NextResponse.json(result, { status });
  }

  return NextResponse.json(result, { status: 200 });
}
