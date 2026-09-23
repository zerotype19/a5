import { NextResponse } from "next/server";
import { submitProjectRequest } from "@/lib/intake/submit-project-request";

export const runtime = "nodejs";

/**
 * Narrow project-submission boundary. Not a general CRUD API.
 * Browser → this route → validate + Turnstile → service-role RPC.
 */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: "validation",
        issues: [{ code: "invalid_json", message: "Invalid request." }],
      },
      { status: 400 },
    );
  }

  const idempotencyKey = request.headers.get("idempotency-key");
  const result = await submitProjectRequest(body, {
    submissionKey: idempotencyKey,
  });

  if (result.success) {
    return NextResponse.json(result, { status: 200 });
  }

  const status =
    result.error === "validation"
      ? 400
      : result.error === "turnstile"
        ? 403
        : result.error === "configuration"
          ? 503
          : result.error === "conflict"
            ? 409
            : 502;

  return NextResponse.json(result, { status });
}
