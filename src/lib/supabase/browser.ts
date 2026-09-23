import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (anon key). For Auth sign-in/out and cookie session sync.
 * Never configure the service role key here.
 */
export function createSupabaseBrowserClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anon) {
    throw new Error("supabase_browser_not_configured");
  }
  return createBrowserClient(url, anon);
}
