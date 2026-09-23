import { createSupabaseServerClient } from "../supabase/server.ts";
import { getSupabaseAdmin } from "../supabase/admin.ts";

export type AdminAuthResult =
  | { ok: true; userId: string; email: string | null }
  | {
      ok: false;
      reason: "unauthenticated" | "forbidden" | "inactive" | "configuration";
    };

/**
 * VERIFY SESSION → VERIFY admin_users ACTIVE.
 * Does not load operational lead data.
 */
export async function resolveAdminAccess(): Promise<AdminAuthResult> {
  let supabase;
  try {
    supabase = await createSupabaseServerClient();
  } catch {
    return { ok: false, reason: "configuration" };
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { ok: false, reason: "unauthenticated" };
  }

  let admin;
  try {
    admin = getSupabaseAdmin();
  } catch {
    return { ok: false, reason: "configuration" };
  }

  const { data: row, error: allowErr } = await admin
    .from("admin_users")
    .select("user_id, active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (allowErr) {
    console.error("[admin] allowlist lookup failed", allowErr.code ?? "error");
    return { ok: false, reason: "configuration" };
  }

  if (!row) {
    return { ok: false, reason: "forbidden" };
  }
  if (row.active !== true) {
    return { ok: false, reason: "inactive" };
  }

  return {
    ok: true,
    userId: user.id,
    email: user.email ?? null,
  };
}

/** Hard gate for server loaders — never returns operational data on failure. */
export async function requireAdminAccess(): Promise<
  Extract<AdminAuthResult, { ok: true }>
> {
  const result = await resolveAdminAccess();
  if (!result.ok) {
    throw new AdminAccessError(result.reason);
  }
  return result;
}

export class AdminAccessError extends Error {
  readonly reason: Exclude<AdminAuthResult, { ok: true }>["reason"];

  constructor(reason: Exclude<AdminAuthResult, { ok: true }>["reason"]) {
    super(`admin_access_${reason}`);
    this.name = "AdminAccessError";
    this.reason = reason;
  }
}
