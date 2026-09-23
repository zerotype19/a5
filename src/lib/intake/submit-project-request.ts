import { getSupabaseAdmin } from "../supabase/admin.ts";
import { verifyTurnstileToken } from "../turnstile/verify.ts";
import {
  getIdempotentResult,
  rememberIdempotentResult,
} from "./idempotency.ts";
import type { SubmitProjectResult } from "./submit-types.ts";
import {
  validateSubmissionPayload,
  type ValidatedSubmission,
} from "./validate-submission.ts";

type RpcRow = {
  lead_id: string;
  public_reference: string;
};

export type SubmitOptions = {
  idempotencyKey?: string | null;
};

/**
 * Authoritative submit path:
 * validate → Turnstile → (idempotency hit?) → service-role RPC → success reference.
 * Success is returned only after the database transaction commits.
 */
export async function submitProjectRequest(
  raw: unknown,
  options: SubmitOptions = {},
): Promise<SubmitProjectResult> {
  const validated = validateSubmissionPayload(raw);
  if (!validated.ok) {
    return {
      success: false,
      error: "validation",
      issues: validated.issues,
      stepHint: validated.stepHint,
    };
  }

  const token =
    typeof raw === "object" &&
    raw !== null &&
    "turnstileToken" in raw &&
    (typeof (raw as { turnstileToken?: unknown }).turnstileToken === "string" ||
      (raw as { turnstileToken?: unknown }).turnstileToken === null)
      ? ((raw as { turnstileToken: string | null }).turnstileToken ?? null)
      : null;

  const turnstile = await verifyTurnstileToken(token);
  if (!turnstile.ok) {
    if (turnstile.reason === "misconfigured") {
      console.error("[submit] turnstile misconfigured");
      return { success: false, error: "configuration" };
    }
    return { success: false, error: "turnstile" };
  }

  const existing = getIdempotentResult(options.idempotencyKey);
  if (existing) {
    return { success: true, publicReference: existing };
  }

  try {
    const reference = await persistSubmission(validated.value);
    rememberIdempotentResult(options.idempotencyKey, reference);
    return { success: true, publicReference: reference };
  } catch (error) {
    const code =
      error instanceof Error ? error.message : "persistence_failed";
    if (code === "supabase_not_configured") {
      console.error("[submit] supabase not configured");
      return { success: false, error: "configuration" };
    }
    console.error("[submit] persistence failed", code);
    return { success: false, error: "persistence" };
  }
}

async function persistSubmission(
  value: ValidatedSubmission,
): Promise<string> {
  const admin = getSupabaseAdmin();
  const { data, error } = await admin.rpc("submit_project_request", {
    p_full_name: value.fullName,
    p_phone: value.phone,
    p_email: value.email,
    p_preferred_contact: value.preferredContact,
    p_service_selection_status: value.serviceSelectionStatus,
    p_service_id: value.serviceId,
    p_postal_code: value.postalCode,
    p_project_description: value.projectDescription,
    p_urgency: value.urgency,
  });

  if (error) {
    throw new Error(error.message || "rpc_failed");
  }

  const row = normalizeRpcResult(data);
  if (!row?.public_reference) {
    throw new Error("rpc_empty_result");
  }

  return row.public_reference;
}

function normalizeRpcResult(data: unknown): RpcRow | null {
  if (Array.isArray(data) && data.length > 0) {
    const first = data[0] as Record<string, unknown>;
    if (
      typeof first.public_reference === "string" &&
      typeof first.lead_id === "string"
    ) {
      return {
        lead_id: first.lead_id,
        public_reference: first.public_reference,
      };
    }
  }
  if (data && typeof data === "object" && !Array.isArray(data)) {
    const row = data as Record<string, unknown>;
    if (
      typeof row.public_reference === "string" &&
      typeof row.lead_id === "string"
    ) {
      return {
        lead_id: row.lead_id,
        public_reference: row.public_reference,
      };
    }
  }
  return null;
}
