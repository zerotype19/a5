import { SITE } from "../../../config/site.ts";

const CANONICAL_HOST = new URL(SITE.url).hostname.toLowerCase();
const APEX_HOST = CANONICAL_HOST.replace(/^www\./, "");

export type CanonicalRedirectInput = {
  host: string | null;
  protocol: string | null;
  pathname: string;
  search: string;
};

/**
 * Apex and plain HTTP requests belong on the canonical HTTPS www origin.
 * Other hosts, including workers.dev, are left unchanged.
 */
export function canonicalRedirectTarget(
  input: CanonicalRedirectInput,
): string | null {
  const hostname =
    input.host?.split(",")[0]?.trim().split(":")[0]?.toLowerCase() ?? "";
  const protocol = input.protocol?.replace(/:$/, "").toLowerCase() ?? "";
  const path = `${input.pathname || "/"}${input.search || ""}`;

  if (hostname === APEX_HOST) {
    return `https://${CANONICAL_HOST}${path}`;
  }

  if (hostname === CANONICAL_HOST && protocol === "http") {
    return `https://${CANONICAL_HOST}${path}`;
  }

  return null;
}
