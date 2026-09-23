import { createClient } from "@supabase/supabase-js";
import { LEAD_UPLOADS_BUCKET } from "@/lib/photos/constants";

/**
 * Browser Supabase client for signed photo uploads only.
 * Never configure service-role here.
 */
export function createBrowserStorageClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    throw new Error("supabase_browser_not_configured");
  }
  return createClient(url, anon, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function uploadPhotoToSignedUrl(input: {
  path: string;
  token: string;
  file: File;
  contentType: string;
}): Promise<{ ok: true } | { ok: false; reason: string }> {
  try {
    const client = createBrowserStorageClient();
    const { error } = await client.storage
      .from(LEAD_UPLOADS_BUCKET)
      .uploadToSignedUrl(input.path, input.token, input.file, {
        contentType: input.contentType,
        upsert: false,
      });
    if (error) {
      return { ok: false, reason: error.message || "upload_failed" };
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "upload_failed" };
  }
}
