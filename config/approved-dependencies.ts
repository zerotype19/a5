/**
 * Dependency governance for A5.
 * Baseline packages are the product runtime.
 * Hosting packages are the owner-approved A5-L001 Cloudflare Workers set.
 * Versions on the hosting set are exact pins. Do not widen them.
 */

export const BASELINE_RUNTIME_DEPENDENCIES = [
  "@supabase/ssr",
  "@supabase/supabase-js",
  "next",
  "react",
  "react-dom",
] as const;

export const APPROVED_HOSTING_RUNTIME_DEPENDENCIES = {
  "@vinext/cloudflare": "1.0.0-beta.11",
  "react-server-dom-webpack": "19.2.8",
  vinext: "1.0.0-beta.13",
} as const;

export const BASELINE_DEV_DEPENDENCIES = [
  "@types/node",
  "@types/react",
  "@types/react-dom",
  "eslint",
  "eslint-config-next",
  "typescript",
] as const;

export const APPROVED_HOSTING_DEV_DEPENDENCIES = {
  "@cloudflare/vite-plugin": "1.61.0",
  "@vitejs/plugin-react": "6.1.1",
  "@vitejs/plugin-rsc": "0.5.35",
  vite: "8.3.1",
  wrangler: "4.142.0",
} as const;
