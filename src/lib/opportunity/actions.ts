"use server";

import { redirect } from "next/navigation";
import { getSupabaseAdmin } from "../supabase/admin.ts";
import { hashOpportunityToken, isOpportunityToken } from "./token.ts";

/**
 * Accept and Pass are POST actions. The token in the form is the capability.
 * A mail-client prefetch of the page URL cannot accept or pass.
 */
export async function acceptOpportunity(formData: FormData): Promise<void> {
  await respond(formData, "ACCEPT");
}

export async function passOpportunity(formData: FormData): Promise<void> {
  await respond(formData, "PASS");
}

async function respond(formData: FormData, action: "ACCEPT" | "PASS"): Promise<void> {
  const token = String(formData.get("token") ?? "");
  if (!isOpportunityToken(token)) {
    redirect("/opportunity/unavailable");
  }
  const db = getSupabaseAdmin();
  const { data, error } = await db.rpc(process.env.ENABLE_NETWORK_FOLLOWUP === "true" ? "network_respond_to_assignment" : "vendor_respond_to_assignment", {
    p_token_hash: hashOpportunityToken(token),
    p_action: action,
  });
  if (error) {
    console.error("[opportunity] respond", error.code ?? "error");
    redirect(`/opportunity/${token}`);
  }
  const row = (Array.isArray(data) ? data[0] : data) as
    | { ok?: boolean; error_code?: string | null }
    | undefined;
  const code = row?.ok ? "ok" : (row?.error_code ?? "unavailable");
  if (code === "ok") {
    redirect(`/opportunity/${token}?response=new`);
  }
  redirect(`/opportunity/${token}`);
}
